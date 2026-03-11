// app/(client)/cart/hooks/useVariantSelector.ts
import { useState, useCallback } from "react";
import apiRequest from "@/lib/api";
import toast from "react-hot-toast";
import { VariantOption } from "@/(client)/cart/components/VariantDropdown";
import { CartItemWithDetails } from "@/(client)/cart/types/cart.types";

// ─── API response types ────────────────────────────────────────────────────────

interface ColorOption {
  id: string;
  value: string;
  label: string;
  enabled: boolean;
}

interface StorageOption {
  id: string;
  value: string;
  label: string;
  enabled: boolean;
}

interface AvailableOption {
  type: "color" | "storage";
  values: (ColorOption | StorageOption)[];
}

interface VariantDetail {
  id: string;
  code: string;
  price: number;
  isActive: boolean;
  available: boolean;
}

interface ApiVariantResponse {
  data: {
    currentVariant: VariantDetail;
    availableOptions: AvailableOption[];
  };
  message: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseCodeParts(code: string): { color: string; storage: string } {
  const upper = code.toUpperCase();
  const storageMatch = upper.match(/(\d+GB)/);
  if (!storageMatch) return { color: "", storage: "" };

  const storage = storageMatch[1].toLowerCase();
  const afterStorage = upper
    .slice(upper.indexOf(storageMatch[1]) + storageMatch[1].length)
    .replace(/^-+/, "")
    .toLowerCase();

  return { color: afterStorage, storage };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseVariantSelectorProps {
  cartItemId: string;
  productSlug: string;
  currentVariantId: string;
  currentVariantCode: string;
  currentQuantity: number;
  onSuccess?: () => void;
  /** Optimistic update: cập nhật item ngay trong state, không cần refetch */
  onUpdateItem?: (patch: Partial<CartItemWithDetails>) => void;
}

export function useVariantSelector({
  cartItemId,
  productSlug,
  currentVariantId,
  currentVariantCode,
  currentQuantity,
  onSuccess,
  onUpdateItem,
}: UseVariantSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<VariantOption[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // ── Fetch all variants ──────────────────────────────────────────────────────
  const fetchVariants = useCallback(async () => {
    if (hasFetched) return;
    setIsFetching(true);
    setErrorMessage(null);

    try {
      const { color: currentColor, storage: currentStorage } =
        parseCodeParts(currentVariantCode);

      const firstRes = await apiRequest.get<ApiVariantResponse>(
        `/products/slug/${productSlug}/variant`,
        { params: { color: currentColor, storage: currentStorage } },
      );

      const availableOptions = firstRes?.data?.availableOptions ?? [];

      const colorOptions = (
        availableOptions.find((o) => o.type === "color")?.values ?? []
      ) as ColorOption[];

      const storageOptions = (
        availableOptions.find((o) => o.type === "storage")?.values ?? []
      ) as StorageOption[];

      const enabledColors = colorOptions.filter((c) => c.enabled);
      const enabledStorages = storageOptions.filter((s) => s.enabled);

      if (enabledColors.length === 0 || enabledStorages.length === 0) {
        const cv = firstRes?.data?.currentVariant;
        if (cv && cv.isActive) {
          setOptions([{
            id: cv.id,
            colorLabel: currentColor,
            storageLabel: currentStorage,
            price: cv.price,
            available: cv.available,
          }]);
        }
        setHasFetched(true);
        return;
      }

      const combos = enabledColors.flatMap((c) =>
        enabledStorages.map((s) => ({
          color: c.value,
          storage: s.value,
          colorLabel: c.label,
          storageLabel: s.label,
        })),
      );

      const results = await Promise.allSettled(
        combos.map((combo) =>
          apiRequest
            .get<ApiVariantResponse>(`/products/slug/${productSlug}/variant`, {
              params: { color: combo.color, storage: combo.storage },
            })
            .then((res) => ({ combo, variant: res?.data?.currentVariant })),
        ),
      );

      const seen = new Set<string>();
      const built: VariantOption[] = [];

      for (const result of results) {
        if (result.status !== "fulfilled") continue;
        const { combo, variant } = result.value;
        if (!variant || !variant.isActive || seen.has(variant.id)) continue;
        seen.add(variant.id);
        built.push({
          id: variant.id,
          colorLabel: combo.colorLabel,
          storageLabel: combo.storageLabel,
          price: variant.price,
          available: variant.available,
        });
      }

      setOptions(built);
      setHasFetched(true);
    } catch (err) {
      console.error("[useVariantSelector] fetchVariants error:", err);
      setErrorMessage("Không thể tải biến thể");
    } finally {
      setIsFetching(false);
    }
  }, [productSlug, currentVariantCode, hasFetched]);

  // ── Toggle dropdown ─────────────────────────────────────────────────────────
  const handleToggle = useCallback(() => {
    if (isChanging) return;
    setIsOpen((prev) => {
      if (!prev) fetchVariants();
      return !prev;
    });
  }, [isChanging, fetchVariants]);

  // ── Close dropdown ──────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // ── Retry fetch ─────────────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    setHasFetched(false);
    setErrorMessage(null);
    setIsFetching(true);
    Promise.resolve().then(() => fetchVariants());
  }, [fetchVariants]);

  // ── Select variant → optimistic update + silent refetch ────────────────────
  const handleSelect = useCallback(
    async (variant: VariantOption) => {
      if (!variant.available) return;
      if (variant.id === currentVariantId) {
        setIsOpen(false);
        return;
      }

      setIsOpen(false);
      setIsChanging(true);

      // ── Optimistic update ngay lập tức, không chờ API ──────────────────────
      onUpdateItem?.({
        productVariantId: variant.id,
        variantCode: `${variant.colorLabel}/${variant.storageLabel}`,
        unitPrice: variant.price,
        originalPrice: variant.price,
        color: variant.colorLabel,
      });

      try {
        await apiRequest.put(`/cart/${cartItemId}/change-variant`, {
          newVariantId: variant.id,
          quantity: currentQuantity,
        });
        toast.success("Đã cập nhật phiên bản sản phẩm");
        // silent refetch để sync data thật từ server, không gây flash
        onSuccess?.();
      } catch (err) {
        console.error("[useVariantSelector] change-variant error:", err);
        toast.error("Không thể đổi phiên bản, vui lòng thử lại");
        // Rollback optimistic update về variant cũ
        onUpdateItem?.({
          productVariantId: currentVariantId,
          variantCode: currentVariantCode,
        });
      } finally {
        setIsChanging(false);
      }
    },
    [cartItemId, currentVariantId, currentVariantCode, currentQuantity, onSuccess, onUpdateItem],
  );

  return {
    isOpen,
    options,
    isFetching,
    isChanging,
    errorMessage,
    hasFetched,
    handleToggle,
    handleClose,
    handleRetry,
    handleSelect,
  };
}