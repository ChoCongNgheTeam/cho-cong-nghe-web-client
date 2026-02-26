// cart/context/CartContext.tsx
"use client";

import {
   createContext,
   useContext,
   useState,
   useEffect,
   useCallback,
   ReactNode,
} from "react";
import { CartItemWithDetails } from "@/(client)/cart/types/cart.types";
import {
   getCartItems,
   addToCart as apiAddToCart,
   updateCartItemQuantity,
   removeCartItem,
   removeCartItems,
   syncGuestCart,
} from "@/(client)/cart/actions/cart.action";
import toast from "react-hot-toast";
import { AuthContext } from "@/contexts/AuthContext";

// ─── Meta khi guest addToCart ─────────────────────────────────────────────────

export interface CartItemMeta {
   productName?: string;
   variantName?: string;
   price?: number;
   originalPrice?: number;
   imageUrl?: string;
   productId?: string;
   productSlug?: string;
   brandName?: string;
   availableQuantity?: number;
   color?: string; // thêm
   colorValue?: string; // thêm
}
// ─── LocalStorage format (chỉ lưu minimal để sync) ───────────────────────────

export interface GuestCartItem {
   productVariantId: string;
   quantity: number;
   addedAt: number;
}

// ─── Context Value ────────────────────────────────────────────────────────────

export interface CartContextValue {
   items: CartItemWithDetails[];
   isLoading: boolean;
   totalItemCount: number;
   selectAll: boolean;
   selectedItems: CartItemWithDetails[];
   toggleSelectAll: () => void;
   toggleSelectItem: (id: string) => void;
   addToCart: (
      productVariantId: string,
      quantity?: number,
      meta?: CartItemMeta,
   ) => Promise<void>;
   updateQuantity: (cartItemId: string, delta: number) => Promise<void>;
   removeItem: (cartItemId: string) => Promise<void>;
   removeSelectedItems: () => Promise<void>;
   refetchCart: () => Promise<void>;
   syncLocalToDB: () => Promise<void>;
   subtotal: number;
   totalDiscount: number;
   finalTotal: number;
   rewardPoints: number;
}

// ─── API Types ────────────────────────────────────────────────────────────────

interface ApiCartItem {
   id: string;
   productVariantId: string;
   productId?: string;
   productName?: string;
   productSlug?: string;
   brandName?: string;
   variantCode?: string;
   image?: string;
   color?: string; // thêm
   colorValue?: string; // thêm
   quantity: number;
   unitPrice: number;
   totalPrice?: number;
   availableQuantity?: number;
   createdAt?: string;
   updatedAt?: string;
}
interface ApiCartData {
   items?: ApiCartItem[];
}

interface ApiResult {
   success: boolean;
   data?: ApiCartData;
   error?: string;
   warnings?: string[];
}

// ─── LocalStorage helpers ─────────────────────────────────────────────────────

const LOCAL_KEY = "guest_cart";

// Lưu dạng đầy đủ để hiển thị trên cart page khi chưa login
function readLocalCart(): CartItemWithDetails[] {
   if (typeof window === "undefined") return [];
   try {
      return JSON.parse(
         localStorage.getItem(LOCAL_KEY) ?? "[]",
      ) as CartItemWithDetails[];
   } catch {
      return [];
   }
}

// Đọc dạng minimal để sync lên DB sau khi login
function readLocalCartForSync(): GuestCartItem[] {
   if (typeof window === "undefined") return [];
   try {
      const items = readLocalCart();
      return items.map((i) => ({
         productVariantId: i.productVariantId, // fix
         quantity: i.quantity,
         addedAt: Date.now(),
      }));
   } catch {
      return [];
   }
}

function writeLocalCart(items: CartItemWithDetails[]): void {
   if (typeof window === "undefined") return;
   localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

function clearLocalCart(): void {
   if (typeof window === "undefined") return;
   localStorage.removeItem(LOCAL_KEY);
}

function transformCartItem(raw: ApiCartItem): CartItemWithDetails {
   return {
      id: raw.id,
      productVariantId: raw.productVariantId,
      productId: raw.productId ?? "",
      productName: raw.productName ?? "Sản phẩm",
      productSlug: raw.productSlug ?? "",
      brandName: raw.brandName ?? "",
      variantCode: raw.variantCode ?? "Mặc định",
      image: raw.image ?? "",
      color: raw.color ?? "",
      colorValue: raw.colorValue ?? "",
      quantity: raw.quantity,
      unitPrice: raw.unitPrice ?? 0,
      totalPrice: raw.totalPrice ?? 0,
      availableQuantity: raw.availableQuantity ?? 0,
      createdAt: raw.createdAt ?? "",
      updatedAt: raw.updatedAt ?? "",
      selected: true,
      originalPrice: raw.unitPrice ?? 0,
   };
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const CartContext = createContext<CartContextValue | undefined>(
   undefined,
);

export function CartProvider({ children }: { children: ReactNode }) {
   const [items, setItems] = useState<CartItemWithDetails[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   const auth = useContext(AuthContext);
   const isAuthenticated = auth?.isAuthenticated ?? false;

   // ── Fetch ─────────────────────────────────────────────────────────────────

   const refetchCart = useCallback(async (): Promise<void> => {
      setIsLoading(true);
      try {
         if (isAuthenticated) {
            // Đã login → lấy từ DB
            const res = (await getCartItems()) as ApiResult;
            if (
               res.success &&
               res.data?.items &&
               Array.isArray(res.data.items)
            ) {
               setItems(res.data.items.map(transformCartItem));
            } else {
               setItems([]);
            }
         } else {
            // Chưa login → đọc từ localStorage (đã có đầy đủ thông tin)
            setItems(readLocalCart());
         }
      } catch {
         setItems(isAuthenticated ? [] : readLocalCart());
      } finally {
         setIsLoading(false);
      }
   }, [isAuthenticated]);

   // Fetch khi AuthContext resolve xong
   useEffect(() => {
      if (auth?.loading === false) {
         refetchCart();
      }
   }, [auth?.loading, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

   // ── Sync guest → DB (gọi sau khi login thành công) ────────────────────────

   const syncLocalToDB = useCallback(async (): Promise<void> => {
      const guestItems = readLocalCartForSync();
      if (guestItems.length === 0) return;

      try {
         const res = (await syncGuestCart(guestItems)) as ApiResult;
         if (res.success) {
            clearLocalCart();
            res.warnings?.forEach((w) => toast(w, { icon: "⚠️" }));
            // Fetch lại cart từ DB sau khi merge
            await refetchCart();
            toast.success("Đã đồng bộ giỏ hàng");
         }
      } catch {
         // silent - không block login flow
      }
   }, [refetchCart]);

   // ── Add to cart ───────────────────────────────────────────────────────────

   const addToCart = useCallback(
      async (
         productVariantId: string,
         quantity = 1,
         meta?: CartItemMeta,
      ): Promise<void> => {
         if (isAuthenticated) {
            // Đã login → gọi API
            try {
               const res = (await apiAddToCart(
                  productVariantId,
                  quantity,
               )) as ApiResult;
               if (res.success) {
                  await refetchCart();
                  toast.success("Đã thêm vào giỏ hàng");
               } else {
                  toast.error(res.error ?? "Không thể thêm vào giỏ hàng");
               }
            } catch {
               toast.error("Không thể thêm vào giỏ hàng");
            }
         } else {
            // Chưa login → lưu vào localStorage với đầy đủ thông tin để hiển thị
            const local = readLocalCart();
            const existing = local.find(
               (i) => i.productVariantId === productVariantId,
            );

            if (existing) {
               existing.quantity += quantity;
            } else {
               local.push({
                  id: `local_${Date.now()}`,
                  productVariantId: productVariantId,
                  productId: meta?.productId ?? "",
                  productName: meta?.productName ?? "Sản phẩm",
                  productSlug: meta?.productSlug ?? "",
                  brandName: meta?.brandName ?? "",
                  variantCode: meta?.variantName ?? "Mặc định",
                  image: meta?.imageUrl ?? "",
                  color: meta?.color ?? "",
                  colorValue: meta?.colorValue ?? "",
                  quantity,
                  unitPrice: meta?.price ?? 0,
                  totalPrice: (meta?.price ?? 0) * quantity,
                  availableQuantity: meta?.availableQuantity ?? 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  selected: true,
                  originalPrice: meta?.originalPrice ?? meta?.price ?? 0,
               });
            }

            writeLocalCart(local);
            setItems([...local]);
            toast.success("Đã thêm vào giỏ hàng");
         }
      },
      [isAuthenticated, refetchCart],
   );

   useEffect(() => {
      const handleLoginSuccess = async () => {
         await syncLocalToDB();
      };

      window.addEventListener("auth-login-success", handleLoginSuccess);
      return () =>
         window.removeEventListener("auth-login-success", handleLoginSuccess);
   }, [syncLocalToDB]);

   // ── Update quantity ───────────────────────────────────────────────────────

   const updateQuantity = useCallback(
      async (cartItemId: string, delta: number): Promise<void> => {
         const item = items.find((i) => i.id === cartItemId);
         if (!item) return;
         const newQty = item.quantity + delta;
         if (newQty < 1) return;

         // Optimistic update
         setItems((prev) =>
            prev.map((i) =>
               i.id === cartItemId ? { ...i, quantity: newQty } : i,
            ),
         );

         if (isAuthenticated) {
            try {
               const res = (await updateCartItemQuantity(
                  cartItemId,
                  newQty,
               )) as ApiResult;
               if (!res.success) {
                  // Rollback
                  setItems((prev) =>
                     prev.map((i) =>
                        i.id === cartItemId
                           ? { ...i, quantity: item.quantity }
                           : i,
                     ),
                  );
                  toast.error(res.error ?? "Cập nhật thất bại");
               }
            } catch {
               setItems((prev) =>
                  prev.map((i) =>
                     i.id === cartItemId
                        ? { ...i, quantity: item.quantity }
                        : i,
                  ),
               );
               toast.error("Cập nhật thất bại");
            }
         } else {
            // Cập nhật localStorage
            const local = readLocalCart().map((i) =>
               i.id === cartItemId ? { ...i, quantity: newQty } : i,
            );
            writeLocalCart(local);
         }
      },
      [isAuthenticated, items],
   );

   // ── Remove single ─────────────────────────────────────────────────────────

   const removeItem = useCallback(
      async (cartItemId: string): Promise<void> => {
         const prevItems = items;
         setItems((curr) => curr.filter((i) => i.id !== cartItemId));

         if (isAuthenticated) {
            try {
               const res = (await removeCartItem(cartItemId)) as ApiResult;
               if (!res.success) {
                  setItems(prevItems);
                  toast.error("Xóa thất bại");
               } else {
                  toast.success("Đã xóa sản phẩm");
               }
            } catch {
               setItems(prevItems);
               toast.error("Xóa thất bại");
            }
         } else {
            writeLocalCart(readLocalCart().filter((i) => i.id !== cartItemId));
            toast.success("Đã xóa sản phẩm");
         }
      },
      [isAuthenticated, items],
   );

   // ── Remove selected ───────────────────────────────────────────────────────

   const removeSelectedItems = useCallback(async (): Promise<void> => {
      const selectedIds = items.filter((i) => i.selected).map((i) => i.id);
      if (selectedIds.length === 0) return;

      const prevItems = items;
      setItems((curr) => curr.filter((i) => !i.selected));

      if (isAuthenticated) {
         try {
            const res = (await removeCartItems(selectedIds)) as ApiResult;
            if (!res.success) {
               setItems(prevItems);
               toast.error("Xóa thất bại");
            } else {
               toast.success(`Đã xóa ${selectedIds.length} sản phẩm`);
            }
         } catch {
            setItems(prevItems);
            toast.error("Xóa thất bại");
         }
      } else {
         writeLocalCart(
            readLocalCart().filter((i) => !selectedIds.includes(i.id)),
         );
         toast.success(`Đã xóa ${selectedIds.length} sản phẩm`);
      }
   }, [isAuthenticated, items]);

   // ── Selection ─────────────────────────────────────────────────────────────

   const selectAll = items.length > 0 && items.every((i) => i.selected);
   const selectedItems = items.filter((i) => i.selected);

   const toggleSelectAll = useCallback((): void => {
      const next = !selectAll;
      setItems((prev) => prev.map((i) => ({ ...i, selected: next })));
   }, [selectAll]);

   const toggleSelectItem = useCallback((id: string): void => {
      setItems((prev) =>
         prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)),
      );
   }, []);

   // ── Totals ────────────────────────────────────────────────────────────────

   const subtotal = selectedItems.reduce(
      (sum, i) => sum + (i.originalPrice ?? i.unitPrice) * i.quantity,
      0,
   );
   const totalDiscount = selectedItems.reduce(
      (sum, i) =>
         sum + Math.max(0, (i.originalPrice ?? 0) - i.unitPrice) * i.quantity,
      0,
   );
   const finalTotal = Math.max(0, subtotal - totalDiscount);
   const rewardPoints = Math.floor(finalTotal / 1000);
   const totalItemCount = items.reduce((s, i) => s + i.quantity, 0);

   const value: CartContextValue = {
      items,
      isLoading,
      totalItemCount,
      selectAll,
      selectedItems,
      toggleSelectAll,
      toggleSelectItem,
      addToCart,
      updateQuantity,
      removeItem,
      removeSelectedItems,
      refetchCart,
      syncLocalToDB,
      subtotal,
      totalDiscount,
      finalTotal,
      rewardPoints,
   };

   return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
