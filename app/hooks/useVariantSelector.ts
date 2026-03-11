// app/(client)/cart/hooks/useVariantSelector.ts
import { useState, useCallback, useContext } from "react";
import apiRequest from "@/lib/api";
import toast from "react-hot-toast";
import { VariantOption } from "@/(client)/cart/components/VariantDropdown";
import { CartItemWithDetails } from "@/(client)/cart/types/cart.types";
import { AuthContext } from "@/contexts/AuthContext";

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
  color: string;
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

const STORAGE_RE = /(\d+\s*(?:GB|TB))/i;

function parseStorage(code: string): string {
  if (!code || code === "Mặc định") return "";
  const m = code.match(STORAGE_RE);
  if (!m) return "";
  return m[1].replace(/\s+/g, "").toLowerCase();
}

function parseColorFromCode(code: string): string {
  if (!code || code === "Mặc định") return "";
  const upper = code.toUpperCase();
  const m = upper.match(STORAGE_RE);
  if (!m) return "";
  const after = upper
    .slice(upper.indexOf(m[1]) + m[1].length)
    .replace(/^[-\s]+/, "")
    .toLowerCase();
  return after;
}

function resolveColor(colorValue: string | undefined, code: string): string {
  if (colorValue) {
    const v = colorValue.trim();
    if (/^[a-z0-9-]+$/.test(v)) return v;
    if (v.startsWith("#")) return parseColorFromCode(code);
    return v.toLowerCase().replace(/\s+/g, "-");
  }
  return parseColorFromCode(code);
}

function buildParams(color: string, storage: string): Record<string, string> {
  const p: Record<string, string> = {};
  if (color) p.color = color;
  if (storage) p.storage = storage;
  return p;
}

const LOCAL_KEY = "guest_cart";

function readLocalCart(): CartItemWithDetails[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]") as CartItemWithDetails[];
  } catch {
    return [];
  }
}

function writeLocalCart(items: CartItemWithDetails[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

interface UseVariantSelectorProps {
  cartItemId: string;
  productSlug: string;
  currentVariantId: string;
  currentVariantCode: string;
  currentColorValue?: string;
  currentQuantity: number;
  onSuccess?: () => void;
  onUpdateItem?: (patch: Partial<CartItemWithDetails>) => void;
}

export function useVariantSelector({
  cartItemId,
  productSlug,
  currentVariantId,
  currentVariantCode,
  currentColorValue,
  currentQuantity,
  onSuccess,
  onUpdateItem,
}: UseVariantSelectorProps) {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated ?? false;

  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<VariantOption[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const fetchVariants = useCallback(async () => {
    if (hasFetched) return;
    setIsFetching(true);
    setErrorMessage(null);

    try {
      // Best-effort resolve params từ data có sẵn
      // Guest thường không có → params = {} → vẫn gọi API, không block
      const color = resolveColor(currentColorValue, currentVariantCode);
      const storage = parseStorage(currentVariantCode);
      const params = buildParams(color, storage);

      // ── Bước 1: Luôn gọi API — params optional ──────────────────────────
      let firstRes: ApiVariantResponse | null = null;
      try {
        firstRes = await apiRequest.get<ApiVariantResponse>(
          `/products/slug/${productSlug}/variant`,
          {
            // Truyền params nếu có, bỏ qua nếu không — API trả availableOptions
            ...(Object.keys(params).length > 0 ? { params } : {}),
            noAuth: true,
            noRedirectOn401: true,
            silentAuth: true,
          },
        );
      } catch (e) {
        console.warn("[useVariantSelector] step1 fetch failed:", e);
        setHasFetched(true);
        return;
      }

      const availableOptions = firstRes?.data?.availableOptions ?? [];
      const colorOptions = (
        availableOptions.find((o) => o.type === "color")?.values ?? []
      ) as ColorOption[];
      const storageOptions = (
        availableOptions.find((o) => o.type === "storage")?.values ?? []
      ) as StorageOption[];

      const enabledColors = colorOptions.filter((c) => c.enabled);
      const enabledStorages = storageOptions.filter((s) => s.enabled);

      // Sản phẩm không có options matrix
      if (enabledColors.length === 0 || enabledStorages.length === 0) {
        const cv = firstRes?.data?.currentVariant;
        if (cv?.isActive) {
          setOptions([{
            id: cv.id,
            colorLabel: color || cv.color || "",
            storageLabel: storage || cv.code || "",
            price: cv.price,
            available: cv.available,
          }]);
        }
        setHasFetched(true);
        return;
      }

      // ── Bước 2: Fetch song song tất cả combo color × storage ────────────
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
              params: buildParams(combo.color, combo.storage),
              noAuth: true,
              noRedirectOn401: true,
              silentAuth: true,
            })
            .then((res) => ({ combo, variant: res?.data?.currentVariant ?? null }))
            .catch(() => ({ combo, variant: null })),
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
      console.warn("[useVariantSelector] fetchVariants unexpected error:", err);
      setHasFetched(true);
    } finally {
      setIsFetching(false);
    }
  }, [productSlug, currentVariantCode, currentColorValue, hasFetched]);

  const handleToggle = useCallback(() => {
    if (isChanging) return;
    setIsOpen((prev) => {
      if (!prev) fetchVariants();
      return !prev;
    });
  }, [isChanging, fetchVariants]);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleRetry = useCallback(() => {
    setHasFetched(false);
    setErrorMessage(null);
    setOptions([]);
    Promise.resolve().then(fetchVariants);
  }, [fetchVariants]);

  const handleSelect = useCallback(
    async (variant: VariantOption) => {
      if (!variant.available) return;
      if (variant.id === currentVariantId) {
        setIsOpen(false);
        return;
      }

      setIsOpen(false);
      setIsChanging(true);

      // Optimistic update ngay lập tức
      onUpdateItem?.({
        productVariantId: variant.id,
        variantCode: `${variant.colorLabel} / ${variant.storageLabel}`,
        unitPrice: variant.price,
        originalPrice: variant.price,
        color: variant.colorLabel,
      });

      // ── Guest: update localStorage ────────────────────────────────────
      if (!isAuthenticated) {
        try {
          const updated = readLocalCart().map((item) =>
            item.id !== cartItemId
              ? item
              : {
                  ...item,
                  productVariantId: variant.id,
                  variantCode: `${variant.colorLabel} / ${variant.storageLabel}`,
                  unitPrice: variant.price,
                  originalPrice: variant.price,
                  color: variant.colorLabel,
                  // Reset colorValue về slug để lần sau fetchVariants resolve được
                  colorValue: variant.colorLabel.toLowerCase().replace(/\s+/g, "-"),
                },
          );
          writeLocalCart(updated);
          toast.success("Đã cập nhật phiên bản sản phẩm");
          onSuccess?.();
        } catch {
          toast.error("Không thể đổi phiên bản, vui lòng thử lại");
          onUpdateItem?.({
            productVariantId: currentVariantId,
            variantCode: currentVariantCode,
          });
        } finally {
          setIsChanging(false);
        }
        return;
      }

      // ── Authenticated: gọi API ────────────────────────────────────────
      try {
        await apiRequest.put(`/cart/${cartItemId}/change-variant`, {
          newVariantId: variant.id,
          quantity: currentQuantity,
        });
        toast.success("Đã cập nhật phiên bản sản phẩm");
        onSuccess?.();
      } catch (err) {
        console.error("[useVariantSelector] change-variant error:", err);
        toast.error("Không thể đổi phiên bản, vui lòng thử lại");
        onUpdateItem?.({
          productVariantId: currentVariantId,
          variantCode: currentVariantCode,
        });
      } finally {
        setIsChanging(false);
      }
    },
    [
      cartItemId,
      currentVariantId,
      currentVariantCode,
      currentQuantity,
      isAuthenticated,
      onSuccess,
      onUpdateItem,
    ],
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