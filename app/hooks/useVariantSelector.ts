// app/(client)/cart/hooks/useVariantSelector.ts
import { useState, useCallback, useContext } from "react";
import apiRequest from "@/lib/api";
import toast from "react-hot-toast";
import { VariantOption } from "@/(client)/cart/components/VariantDropdown";
import { CartItemWithDetails } from "@/(client)/cart/types/cart.types";
import { AuthContext } from "@/contexts/AuthContext";

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

// validate-item response — trả về thông tin variant từ productVariantId
interface ValidateItemResponse {
  data: {
    productVariantId: string;
    color: string;        // English value: "black", "white", ...
    variantCode: string;  // SKU: "IPHONE-16-PLUS-128GB-BLACK"
    price: number;
    available: boolean;
    productSlug: string;
    [key: string]: unknown;
  };
  message: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_RE = /(\d+\s*(?:GB|TB))/i;

function parseStorage(code: string): string {
  if (!code || code === "Mặc định") return "";
  if (code.includes("/")) {
    for (const p of code.split("/").map((s) => s.trim())) {
      const m = p.match(STORAGE_RE);
      if (m) return m[1].replace(/\s+/g, "").toLowerCase();
    }
    return "";
  }
  const storageMatch = code.match(STORAGE_RE);
  if (!storageMatch) return "";
  return storageMatch[1].replace(/\s+/g, "").toLowerCase();
}

function buildParams(
  color: string,
  storage: string,
): Record<string, string> | undefined {
  const p: Record<string, string> = {};
  if (color) p.color = color;
  if (storage) p.storage = storage;
  return Object.keys(p).length > 0 ? p : undefined;
}

// ─── Local storage helpers ────────────────────────────────────────────────────

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

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseVariantSelectorProps {
  cartItemId: string;
  productSlug: string;
  currentVariantId: string;
  currentVariantCode: string;
  /** colorValue từ item — optional, hook tự resolve qua validate-item nếu thiếu */
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

  // ── Fetch all variants ──────────────────────────────────────────────────────
  const fetchVariants = useCallback(async () => {
    if (hasFetched) return;
    setIsFetching(true);
    setErrorMessage(null);

    try {
      let color = currentColorValue ?? "";
      let storage = parseStorage(currentVariantCode);

      // ── Bước 1: nếu thiếu color/storage, dùng validate-item để resolve ────
      // validate-item là public endpoint (không cần auth), nhận productVariantId
      // và trả về color + variantCode đầy đủ
      if ((!color || !storage) && currentVariantId) {
        try {
          const validateRes = await apiRequest.post<ValidateItemResponse>(
            "/cart/validate-item",
            { productVariantId: currentVariantId, quantity: 1 },
            { noAuth: true },
          );
          const vd = validateRes?.data;
          if (vd) {
            if (!color) color = vd.color ?? "";
            if (!storage) storage = parseStorage(vd.variantCode ?? "");
          }
        } catch (e) {
          console.warn("[useVariantSelector] validate-item fallback failed:", e);
          // tiếp tục với những gì có, fetchVariants sẽ xử lý error bên dưới
        }
      }

      // ── Bước 2: gọi variant API với color + storage đã resolve ────────────
      const params = buildParams(color, storage);
      if (!params) {
        // Không có đủ params sau khi đã thử resolve → báo lỗi
        setErrorMessage("Không thể xác định biến thể");
        setHasFetched(true);
        return;
      }

      const firstRes = await apiRequest.get<ApiVariantResponse>(
        `/products/slug/${productSlug}/variant`,
        { params, noAuth: true },
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

      // Chỉ 1 variant hoặc không có options
      if (enabledColors.length === 0 || enabledStorages.length === 0) {
        const cv = firstRes?.data?.currentVariant;
        if (cv && cv.isActive) {
          setOptions([{
            id: cv.id,
            colorLabel: color,
            storageLabel: storage,
            price: cv.price,
            available: cv.available,
          }]);
        }
        setHasFetched(true);
        return;
      }

      // ── Bước 3: gọi song song tất cả combo color × storage ────────────────
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
  }, [productSlug, currentVariantCode, currentColorValue, currentVariantId, hasFetched]);

  // ── Toggle dropdown ─────────────────────────────────────────────────────────
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
    setIsFetching(true);
    Promise.resolve().then(() => fetchVariants());
  }, [fetchVariants]);

  // ── Select variant ──────────────────────────────────────────────────────────
  const handleSelect = useCallback(
    async (variant: VariantOption) => {
      if (!variant.available) return;
      if (variant.id === currentVariantId) {
        setIsOpen(false);
        return;
      }

      setIsOpen(false);
      setIsChanging(true);

      onUpdateItem?.({
        productVariantId: variant.id,
        variantCode: `${variant.colorLabel}/${variant.storageLabel}`,
        unitPrice: variant.price,
        originalPrice: variant.price,
        color: variant.colorLabel,
      });

      // ── Guest: chỉ cập nhật localStorage ──────────────────────────────────
      if (!isAuthenticated) {
        try {
          const updated = readLocalCart().map((item) =>
            item.id !== cartItemId
              ? item
              : {
                  ...item,
                  productVariantId: variant.id,
                  variantCode: `${variant.colorLabel}/${variant.storageLabel}`,
                  unitPrice: variant.price,
                  originalPrice: variant.price,
                  color: variant.colorLabel,
                },
          );
          writeLocalCart(updated);
          toast.success("Đã cập nhật phiên bản sản phẩm");
          onSuccess?.();
        } catch (err) {
          console.error("[useVariantSelector] guest update error:", err);
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

      // ── Authenticated: gọi API change-variant ─────────────────────────────
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