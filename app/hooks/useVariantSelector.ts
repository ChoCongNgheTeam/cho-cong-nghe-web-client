import { useState, useCallback, useRef, useContext } from "react";
import apiRequest from "@/lib/api";
import toast from "react-hot-toast";
import { VariantOption } from "@/(client)/cart/components/VariantDropdown";
import { CartItemWithDetails } from "@/(client)/cart/types/cart.types";
import { useCart, NewVariantData } from "@/contexts/CartContext";
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
   const auth = useContext(AuthContext);
   const isAuthenticated = auth?.isAuthenticated ?? false;

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
            const availableOptions = await fetchProductOptions(
               productSlug,
               isAuthenticated,
            );

            const colorOptions = (availableOptions.find(
               (o) => o.type === "color",
            )?.values ?? []) as ColorOption[];
            const storageOptions = (availableOptions.find(
               (o) => o.type === "storage",
            )?.values ?? []) as StorageOption[];
            const enabledColors = colorOptions.filter((c) => c.enabled);
            const enabledStorages = storageOptions.filter((s) => s.enabled);

            console.log(
               "[useVariantSelector] colors:",
               enabledColors,
               "storages:",
               enabledStorages,
            );

            // Sản phẩm không có variant matrix
            if (enabledColors.length === 0 || enabledStorages.length === 0) {
               try {
                  const res = await fetchVariantApi(
                     productSlug,
                     {},
                     isAuthenticated,
                  );
                  const cv = res?.data?.currentVariant;
                  setOptions(
                     cv?.isActive
                        ? [
                             {
                                id: cv.id,
                                colorLabel: colorLabel || cv.color || "",
                                storageLabel: storageLabel || cv.code || "",
                                price: cv.price,
                                available: cv.available,
                                colorValue: cv.colorValue,
                             },
                          ]
                        : [],
                  );
               } catch {
                  setOptions([]);
               }
               return;
            }
            const combos = enabledColors.flatMap((c) =>
               enabledStorages.map((s) => ({
                  colorSlug: c.value,
                  storageSlug: s.value,
                  colorLabel: c.label,
                  storageLabel: s.label,
               })),
            );

            const results = await Promise.allSettled(
               combos.map((combo) =>
                  fetchVariantApi(
                     productSlug,
                     buildParams(combo.colorSlug, combo.storageSlug),
                     isAuthenticated,
                  )
                     .then((res) => ({
                        combo,
                        variant: res?.data?.currentVariant ?? null,
                     }))
                     .catch((e) => {
                        console.warn(
                           "[useVariantSelector] combo failed:",
                           combo,
                           e,
                        );
                        return { combo, variant: null };
                     }),
               ),
            );

            const seen = new Set<string>();
            const built: VariantOption[] = [];
            for (const r of results) {
               if (r.status !== "fulfilled") continue;
               const { combo, variant } = r.value;
               if (!variant || !variant.isActive || seen.has(variant.id))
                  continue;
               seen.add(variant.id);
               built.push({
                  id: variant.id,
                  colorLabel: combo.colorLabel,
                  storageLabel: combo.storageLabel,
                  price: variant.price,
                  available: variant.available,
                  colorValue: variant.colorValue ?? combo.colorSlug,
               });
            }

            console.log("[useVariantSelector] built options:", built);
            setOptions(built);
         } catch (err) {
            console.error("[useVariantSelector] unexpected error:", err);
            setErrorMessage("Có lỗi xảy ra, vui lòng thử lại");
            fetchedSlugRef.current = null;
         } finally {
            setIsFetching(false);
         }
      },
      [productSlug, colorLabel, storageLabel, isAuthenticated],
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

         // colorValue đã có sẵn trong variant object từ bước build
         onUpdateItem?.({
            productVariantId: variant.id,
            variantCode: `${variant.storageLabel} / ${variant.colorLabel}`,
            colorLabel: variant.colorLabel,
            storageLabel: variant.storageLabel,
            color: variant.colorLabel,
            colorValue:
               variant.colorValue ??
               variant.colorLabel.toLowerCase().replace(/\s+/g, "-"),
            unitPrice: variant.price,
            originalPrice: variant.price,
         });

         try {
            await changeVariant(cartItemId, {
               id: variant.id,
               colorLabel: variant.colorLabel,
               storageLabel: variant.storageLabel,
               price: variant.price,
               colorValue: variant.colorValue,
            } as NewVariantData);

            toast.success("Đã cập nhật phiên bản sản phẩm");
            onSuccess?.();
            setIsOpen(false);
         } catch (err) {
            console.error("[useVariantSelector] handleSelect error:", err);
            toast.error("Không thể đổi phiên bản, vui lòng thử lại");
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
         currentQuantity,
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
