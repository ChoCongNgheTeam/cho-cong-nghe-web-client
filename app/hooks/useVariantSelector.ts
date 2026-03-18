import { useState, useCallback, useRef, useContext } from "react";
import apiRequest from "@/lib/api";
import { VariantOption } from "@/(client)/cart/components/VariantDropdown";
import { CartItemWithDetails } from "@/(client)/cart/types/cart.types";
import { useCart, NewVariantData } from "@/contexts/CartContext";
import { AuthContext } from "@/contexts/AuthContext";
import { useToasty } from "@/components/Toast";
import { useAuth } from "./useAuth";

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

async function fetchProductOptions(
   productSlug: string,
   isAuthenticated: boolean,
): Promise<AvailableOption[]> {
   const opts = isAuthenticated
      ? {}
      : { noAuth: true, noRedirectOn401: true, silentAuth: true };
   try {
      const res = await apiRequest.get<ApiProductResponse>(
         `/products/slug/${productSlug}`,
         opts,
      );
      return res?.data?.availableOptions ?? [];
   } catch {
      return [];
   }
}

async function fetchVariantApi(
   productSlug: string,
   params: Record<string, string>,
   isAuthenticated: boolean,
): Promise<ApiVariantResponse | null> {
   const opts = {
      ...(Object.keys(params).length > 0 ? { params } : {}),
      ...(isAuthenticated
         ? {}
         : { noAuth: true, noRedirectOn401: true, silentAuth: true }),
   };
   return apiRequest.get<ApiVariantResponse>(
      `/products/slug/${productSlug}/variant`,
      opts,
   );
}

export interface UseVariantSelectorProps {
   cartItemId: string;
   productSlug: string;
   currentVariantId: string;
   colorLabel: string;
   storageLabel: string;
   storageValue?: string; // ← THÊM: "128gb", "256gb", ...
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
   storageValue, // ← THÊM
   colorValue,
   currentQuantity,
   onSuccess,
   onUpdateItem,
}: UseVariantSelectorProps) {
   const { changeVariant } = useCart();
   const toast = useToasty();
   const { isAuthenticated } = useAuth(); // ✅ thay useContext(AuthContext)

   const [isOpen, setIsOpen] = useState(false);
   const [options, setOptions] = useState<VariantOption[]>([]);
   const [isFetching, setIsFetching] = useState(false);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);
   const [isChanging, setIsChanging] = useState(false);

   // ← THÊM: cache key gồm cả storage để re-fetch khi storage thay đổi
   const cacheKey = `${productSlug}-${storageValue ?? storageLabel}`;
   const fetchedSlugRef = useRef<string | null>(null);

   const fetchVariants = useCallback(
      async (forceRefresh = false) => {
         if (!forceRefresh && fetchedSlugRef.current === cacheKey) return; // ← đổi productSlug → cacheKey
         fetchedSlugRef.current = cacheKey; // ← đổi productSlug → cacheKey

         setIsFetching(true);
         setErrorMessage(null);

         try {
            const opts = isAuthenticated
               ? {}
               : { noAuth: true, noRedirectOn401: true, silentAuth: true };

            const params: Record<string, string> = {};
            if (storageValue) {
               params.storage = storageValue; // "128gb"
            }

            const res = await apiRequest.get<{ data: VariantOption[] }>(
               `/products/slug/${productSlug}/variant-options`,
               {
                  ...opts,
                  ...(Object.keys(params).length > 0 ? { params } : {}),
               },
            );

            setOptions(res?.data ?? []);
         } catch {
            setErrorMessage("Có lỗi xảy ra, vui lòng thử lại");
            fetchedSlugRef.current = null;
         } finally {
            setIsFetching(false);
         }
      },
      [productSlug, storageValue, storageLabel, isAuthenticated, cacheKey], // ← thêm deps
   );

   const handleToggle = useCallback(() => {
      if (isChanging) return;
      const willOpen = !isOpen;
      setIsOpen(willOpen);
      if (willOpen && fetchedSlugRef.current !== cacheKey) {
         // ← đổi productSlug → cacheKey
         fetchVariants();
      }
   }, [isChanging, isOpen, cacheKey, fetchVariants]); // ← đổi productSlug → cacheKey

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

         // Dùng finalPrice nếu có sale, fallback về price
         const effectivePrice = variant.finalPrice ?? variant.price;

         onUpdateItem?.({
            productVariantId: variant.id,
            variantCode: `${variant.storageLabel} / ${variant.colorLabel}`,
            colorLabel: variant.colorLabel,
            storageLabel: variant.storageLabel,
            color: variant.colorLabel,
            colorValue:
               variant.colorValue ??
               variant.colorLabel.toLowerCase().replace(/\s+/g, "-"),
            unitPrice: effectivePrice, // giá sau sale
            originalPrice: variant.price, // giá gốc để hiện gạch ngang
            ...(variant.imageUrl ? { image: variant.imageUrl } : {}), // cập nhật ảnh
         });

         try {
            await changeVariant(cartItemId, {
               id: variant.id,
               colorLabel: variant.colorLabel,
               storageLabel: variant.storageLabel,
               price: effectivePrice, // giá sau sale
               originalPrice: variant.price, // giá gốc
               colorValue: variant.colorValue,
            } as NewVariantData);

            toast.success("Đã cập nhật phiên bản sản phẩm");
            onSuccess?.();
            setIsOpen(false);
         } catch (err) {
            console.error("[useVariantSelector] handleSelect error:", err);
            toast.error("Không thể đổi phiên bản, vui lòng thử lại");
            // Rollback
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
      [
         cartItemId,
         currentVariantId,
         colorLabel,
         storageLabel,
         changeVariant,
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
      hasFetched: fetchedSlugRef.current === cacheKey,
      handleToggle,
      handleRetry,
      handleSelect,
   };
}
