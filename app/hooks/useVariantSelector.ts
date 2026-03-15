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

   const fetchedSlugRef = useRef<string | null>(null);

   const fetchVariants = useCallback(
      async (forceRefresh = false) => {
         if (!forceRefresh && fetchedSlugRef.current === productSlug) return;
         fetchedSlugRef.current = productSlug;

         setIsFetching(true);
         setErrorMessage(null);

         try {
            const opts = isAuthenticated
               ? {}
               : { noAuth: true, noRedirectOn401: true, silentAuth: true };

            const res = await apiRequest.get<{ data: VariantOption[] }>(
               `/products/slug/${productSlug}/variant-options`,
               opts,
            );

            setOptions(res?.data ?? []);
         } catch {
            setErrorMessage("Có lỗi xảy ra, vui lòng thử lại");
            fetchedSlugRef.current = null;
         } finally {
            setIsFetching(false);
         }
      },
      [productSlug, isAuthenticated],
   );
   const handleToggle = useCallback(() => {
      if (isChanging) return;
      const willOpen = !isOpen;
      setIsOpen(willOpen);
      if (willOpen && fetchedSlugRef.current !== productSlug) {
         fetchVariants();
      }
   }, [isChanging, isOpen, productSlug, fetchVariants]);

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
      hasFetched: fetchedSlugRef.current === productSlug,
      handleToggle,
      handleRetry,
      handleSelect,
   };
}
