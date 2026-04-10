import { useState, useCallback, useRef, useEffect } from "react";
import apiRequest from "@/lib/api";
import { VariantOption } from "@/(client)/cart/components/VariantDropdown";
import { CartItemWithDetails } from "@/(client)/cart/types/cart.types";
import { NewVariantData } from "@/contexts/CartContext";
import { useToasty } from "@/components/Toast";
import { useAuth } from "./useAuth";
import { useCart } from "./useCart";

export interface UseVariantSelectorProps {
  cartItemId: string;
  productSlug: string;
  currentVariantId: string;
  colorLabel: string;
  storageLabel: string;
  storageValue?: string;
  colorValue?: string;
  currentQuantity: number;
  /** variantCode đầy đủ từ cart item, vd: "12GB 256GB", "128GB", "256GB / Đen" */
  variantCode?: string;
  onSuccess?: () => void;
  onUpdateItem?: (patch: Partial<CartItemWithDetails>) => void;
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
}

/**
 * Trích tất cả các số dạng "NGB" / "NTB" từ một chuỗi.
 * variantCode "12GB 256GB" → ["12GB", "256GB"]
 * variantCode "128GB"      → ["128GB"]
 */
function extractMemoryTokens(code: string): string[] {
  return [...code.matchAll(/\b(\d+\s*(?:GB|TB))\b/gi)].map((m) => m[1].replace(/\s+/g, "").toUpperCase());
}

/**
 * Xây dựng query params để gọi /variant-options.
 *
 * Logic:
 *  - Nếu variantCode chứa ≥ 2 memory tokens → sản phẩm có RAM + Storage.
 *    Lấy token nhỏ nhất = RAM, lớn nhất = Storage (hoặc TB > GB).
 *    Gửi cả ram=... và storage=...
 *  - Nếu chỉ có 1 token → chỉ có storage. Gửi storage=...
 *  - Nếu storageLabel/storageValue tồn tại nhưng variantCode không có token
 *    (trường hợp FE cũ) → fallback về storageValue/storageLabel.
 *  - Nếu không có gì → gọi không có param (backend tự trả đủ).
 */
function buildVariantParams(variantCode: string | undefined, storageLabel: string, storageValue: string | undefined): Record<string, string> {
  const params: Record<string, string> = {};

  if (variantCode) {
    const tokens = extractMemoryTokens(variantCode);

    if (tokens.length >= 2) {
      // Phân biệt RAM vs Storage:
      // TB luôn là storage; trong các GB token, nhỏ hơn = RAM, lớn hơn = storage
      const tbTokens = tokens.filter((t) => t.endsWith("TB"));
      const gbTokens = tokens.filter((t) => t.endsWith("GB"));

      if (tbTokens.length > 0) {
        // Có TB → đó là storage, còn lại là RAM
        const storageToken = tbTokens[0];
        const ramToken = gbTokens.sort((a, b) => parseInt(a) - parseInt(b))[0];
        if (ramToken) params.ram = ramToken.toLowerCase();
        params.storage = storageToken.toLowerCase();
      } else {
        // Tất cả GB — nhỏ hơn là RAM, lớn hơn là storage
        const sorted = gbTokens.sort((a, b) => parseInt(a) - parseInt(b));
        params.ram = sorted[0].toLowerCase();
        params.storage = sorted[sorted.length - 1].toLowerCase();
      }
      return params;
    }

    if (tokens.length === 1) {
      params.storage = tokens[0].toLowerCase();
      return params;
    }
  }

  // Fallback: dùng storageValue hoặc storageLabel
  const storageRaw = storageValue || storageLabel;
  if (storageRaw) {
    params.storage = storageRaw.toLowerCase().replace(/\s+/g, "");
  }

  return params;
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useVariantSelector({
  cartItemId,
  productSlug,
  currentVariantId,
  colorLabel,
  storageLabel,
  storageValue,
  colorValue,
  variantCode,
  currentQuantity,
  onSuccess,
  onUpdateItem,
}: UseVariantSelectorProps) {
  const { changeVariant } = useCart();
  const toast = useToasty();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const [options, setOptions] = useState<VariantOption[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  // Cache key bao gồm variantCode để refetch khi đổi RAM/storage
  const cacheKey = `${productSlug}-${currentVariantId}`;
  const fetchedSlugRef = useRef<string | null>(null);

  const fetchVariants = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh && fetchedSlugRef.current === cacheKey) return;
      fetchedSlugRef.current = cacheKey;

      setIsFetching(true);
      setErrorMessage(null);

      try {
        const authOpts = isAuthenticated ? {} : { noAuth: true, noRedirectOn401: true, silentAuth: true };

        const params = buildVariantParams(variantCode, storageLabel, storageValue);

        const res = await apiRequest.get<ApiResponse<VariantOption[]>>(`/products/slug/${productSlug}/variant-options`, {
          ...authOpts,
          ...(Object.keys(params).length > 0 ? { params } : {}),
        });

        const raw = res?.data ?? [];

        // Dedup phòng trường hợp backend trả duplicate colorLabel
        // (xảy ra khi param không match đúng — giữ item đầu tiên của mỗi colorLabel)
        const seen = new Set<string>();
        const deduped = raw.filter((opt) => {
          const key = opt.colorLabel.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setOptions(deduped);
      } catch {
        setErrorMessage("Có lỗi xảy ra, vui lòng thử lại");
        fetchedSlugRef.current = null;
      } finally {
        setIsFetching(false);
      }
    },
    [productSlug, storageLabel, storageValue, variantCode, isAuthenticated, cacheKey],
  );

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    setOptions([]);
    setErrorMessage(null);
    fetchedSlugRef.current = null;
  }, [cacheKey]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const handleRetry = useCallback(() => {
    fetchedSlugRef.current = null;
    setErrorMessage(null);
    setOptions([]);
    fetchVariants(true);
  }, [fetchVariants]);

  const handleSelect = useCallback(
    async (variant: VariantOption) => {
      if (!variant.available || variant.id === currentVariantId) return;

      setIsChanging(true);

      // Optimistic update — chỉ update labels/image, KHÔNG update price
      onUpdateItem?.({
        productVariantId: variant.id,
        variantCode: [variant.storageLabel, variant.colorLabel].filter(Boolean).join(" / "),
        colorLabel: variant.colorLabel,
        storageLabel: variant.storageLabel,
        color: variant.colorLabel,
        colorValue: variant.colorValue ?? variant.colorLabel.toLowerCase().replace(/\s+/g, "-"),
        ...(variant.imageUrl ? { image: variant.imageUrl } : {}),
      });

      try {
        await changeVariant(cartItemId, {
          id: variant.id,
          colorLabel: variant.colorLabel,
          storageLabel: variant.storageLabel,
          colorValue: variant.colorValue,
        } as NewVariantData);

        toast.success("Đã cập nhật phiên bản sản phẩm");
        onSuccess?.();
      } catch (err) {
        console.error("[useVariantSelector] handleSelect error:", err);
        toast.error("Không thể đổi phiên bản, vui lòng thử lại");
        // Rollback optimistic update
        onUpdateItem?.({
          productVariantId: currentVariantId,
          variantCode: [storageLabel, colorLabel].filter(Boolean).join(" / "),
          colorLabel,
          storageLabel,
        });
      } finally {
        setIsChanging(false);
      }
    },
    [cartItemId, currentVariantId, colorLabel, storageLabel, changeVariant, onSuccess, onUpdateItem, toast],
  );

  return {
    options,
    isFetching,
    isOpen,
    isChanging,
    errorMessage,
    hasFetched: fetchedSlugRef.current === cacheKey,
    handleRetry,
    handleToggle,
    handleSelect,
  };
}
