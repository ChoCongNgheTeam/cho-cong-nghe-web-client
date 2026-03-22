import { useState, useCallback, useRef, useEffect } from "react";
import apiRequest from "@/lib/api";
import { VariantOption } from "@/(client)/cart/components/VariantDropdown";
import { CartItemWithDetails } from "@/(client)/cart/types/cart.types";
import {  NewVariantData } from "@/contexts/CartContext";
import { useToasty } from "@/components/Toast";
import { useAuth } from "./useAuth";
import { useCart } from "./useCart";

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
  colorValue?: string;
  price: number;
  isActive: boolean;
  available: boolean;
}
interface ApiVariantResponse {
  data: { currentVariant: VariantDetail; availableOptions: AvailableOption[] };
  message: string;
}
interface ApiProductResponse {
  data: { availableOptions: AvailableOption[] };
  message: string;
}

function buildParams(color: string, storage: string): Record<string, string> {
  const p: Record<string, string> = {};
  if (color) p.color = color;
  if (storage) p.storage = storage;
  return p;
}

async function fetchProductOptions(productSlug: string, isAuthenticated: boolean): Promise<AvailableOption[]> {
  const opts = isAuthenticated ? {} : { noAuth: true, noRedirectOn401: true, silentAuth: true };
  try {
    const res = await apiRequest.get<ApiProductResponse>(`/products/slug/${productSlug}`, opts);
    return res?.data?.availableOptions ?? [];
  } catch {
    return [];
  }
}

async function fetchVariantApi(productSlug: string, params: Record<string, string>, isAuthenticated: boolean): Promise<ApiVariantResponse | null> {
  const opts = {
    ...(Object.keys(params).length > 0 ? { params } : {}),
    ...(isAuthenticated ? {} : { noAuth: true, noRedirectOn401: true, silentAuth: true }),
  };
  return apiRequest.get<ApiVariantResponse>(`/products/slug/${productSlug}/variant`, opts);
}

export interface UseVariantSelectorProps {
  cartItemId: string;
  productSlug: string;
  currentVariantId: string;
  colorLabel: string;
  storageLabel: string;
  storageValue?: string;
  colorValue?: string;
  currentQuantity: number;
  onSuccess?: () => void;
  onUpdateItem?: (patch: Partial<CartItemWithDetails>) => void;
}

export function useVariantSelector({
  cartItemId,
  productSlug,
  currentVariantId,
  colorLabel,
  storageLabel,
  storageValue,
  colorValue,
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

  const cacheKey = `${productSlug}-${storageValue ?? storageLabel}`;
  const fetchedSlugRef = useRef<string | null>(null);

  const fetchVariants = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh && fetchedSlugRef.current === cacheKey) return;
      fetchedSlugRef.current = cacheKey;

      setIsFetching(true);
      setErrorMessage(null);

      try {
        const opts = isAuthenticated ? {} : { noAuth: true, noRedirectOn401: true, silentAuth: true };

        const params: Record<string, string> = {};
        if (storageValue) params.storage = storageValue;

        const res = await apiRequest.get<{ data: VariantOption[] }>(`/products/slug/${productSlug}/variant-options`, {
          ...opts,
          ...(Object.keys(params).length > 0 ? { params } : {}),
        });

        setOptions(res?.data ?? []);
      } catch {
        setErrorMessage("Có lỗi xảy ra, vui lòng thử lại");
        fetchedSlugRef.current = null;
      } finally {
        setIsFetching(false);
      }
    },
    [productSlug, storageValue, isAuthenticated, cacheKey],
  );
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);
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

      // Optimistic update UI — chỉ update label/image, KHÔNG update price
      // Price sẽ được tính lại khi getCart được gọi sau changeVariant
      onUpdateItem?.({
        productVariantId: variant.id,
        variantCode: `${variant.storageLabel} / ${variant.colorLabel}`,
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
        } as NewVariantData);

        toast.success("Đã cập nhật phiên bản sản phẩm");
        onSuccess?.(); // ← onSuccess sẽ trigger getCart để lấy price đúng
      } catch (err) {
        console.error("[useVariantSelector] handleSelect error:", err);
        toast.error("Không thể đổi phiên bản, vui lòng thử lại");
        // Rollback optimistic update
        onUpdateItem?.({
          productVariantId: currentVariantId,
          variantCode: `${storageLabel} / ${colorLabel}`,
          colorLabel,
          storageLabel,
        });
      } finally {
        setIsChanging(false);
      }
    },
    [cartItemId, currentVariantId, colorLabel, storageLabel, changeVariant, onSuccess, onUpdateItem],
  );
  return {
    options,
    isFetching,
    isOpen, // ← thêm
    isChanging,
    errorMessage,
    hasFetched: fetchedSlugRef.current === cacheKey,
    handleRetry,
    handleToggle,
    handleSelect,
  };
}
