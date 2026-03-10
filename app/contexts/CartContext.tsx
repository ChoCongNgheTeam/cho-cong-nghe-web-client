"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { CartItemWithDetails } from "@/(client)/cart/types/cart.types";
import { getCartItems, addToCart as apiAddToCart, updateCartItemQuantity, removeCartItem, removeCartItems, syncGuestCart } from "@/(client)/cart/actions/cart.action";
import { useToasty } from "@/components/Toast";
import { AuthContext } from "@/contexts/AuthContext";

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
  color?: string;
  colorValue?: string;
}

export interface GuestCartItem {
  productVariantId: string;
  quantity: number;
  addedAt: number;
}

export interface CartContextValue {
  items: CartItemWithDetails[];
  isLoading: boolean;
  totalItemCount: number;
  selectAll: boolean;
  selectedItems: CartItemWithDetails[];
  toggleSelectAll: () => void;
  toggleSelectItem: (id: string) => void;
  addToCart: (productVariantId: string, quantity?: number, meta?: CartItemMeta) => Promise<void>;
  updateQuantity: (cartItemId: string, delta: number) => Promise<void>;
  /** Optimistic update: patch 1 item trong state mà không fetch lại */
  updateItem: (cartItemId: string, patch: Partial<CartItemWithDetails>) => void;
  removeItem: (cartItemId: string) => Promise<void>;
  removeSelectedItems: () => Promise<void>;
  refetchCart: (silent?: boolean) => Promise<void>;
  syncLocalToDB: () => Promise<number>;
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  rewardPoints: number;
}

interface ApiCartItem {
  id: string;
  productVariantId: string;
  productId?: string;
  productName?: string;
  productSlug?: string;
  brandName?: string;
  variantCode?: string;
  image?: string;
  color?: string;
  colorValue?: string;
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

const LOCAL_KEY = "guest_cart";

function readLocalCart(): CartItemWithDetails[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]") as CartItemWithDetails[];
  } catch {
    return [];
  }
}

function readLocalCartForSync(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const items = readLocalCart();
    return items.map((i) => ({
      productVariantId: i.productVariantId,
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

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const hasSyncedRef = useRef(false);

  const toast = useToasty();

  // ── Fetch ─────────────────────────────────────────────────────────────────
  // silent=true → không set isLoading, tránh flash UI khi chỉ cần sync ngầm

  const refetchCart = useCallback(async (silent = false): Promise<void> => {
    if (!silent) setIsLoading(true);
    try {
      if (isAuthenticated) {
        const res = (await getCartItems()) as ApiResult;
        if (res.success && res.data?.items && Array.isArray(res.data.items)) {
          setItems((prev) => {
            const next = res.data!.items!.map(transformCartItem);
            // Giữ lại trạng thái selected từ state hiện tại
            return next.map((item) => ({
              ...item,
              selected: prev.find((p) => p.id === item.id)?.selected ?? true,
            }));
          });
        } else {
          setItems([]);
        }
      } else {
        setItems(readLocalCart());
      }
    } catch {
      setItems(isAuthenticated ? [] : readLocalCart());
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (auth?.loading === false) {
      refetchCart();
    }
  }, [auth?.loading, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync guest → DB ───────────────────────────────────────────────────────

  const syncLocalToDB = useCallback(async (): Promise<number> => {
    const guestItems = readLocalCartForSync();
    if (guestItems.length === 0) return 0;

    try {
      const res = (await syncGuestCart(guestItems)) as ApiResult;
      if (res.success) {
        clearLocalCart();
        res.warnings?.forEach((w) => toast.info(w));
        await refetchCart();
        return guestItems.length;
      }
    } catch {
      // silent
    }
    return 0;
  }, [refetchCart, toast]);

  useEffect(() => {
    if (!isAuthenticated) {
      hasSyncedRef.current = false;
      return;
    }
    if (hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    const run = async () => {
      const count = await syncLocalToDB();
      if (count > 0) {
        toast.success(`Đã đồng bộ ${count} sản phẩm vào giỏ hàng 🛒`, {
          duration: 3000,
        });
      }
    };

    run();
  }, [isAuthenticated, syncLocalToDB, toast]);

  // ── Add to cart ───────────────────────────────────────────────────────────

  const addToCart = useCallback(
    async (productVariantId: string, quantity = 1, meta?: CartItemMeta): Promise<void> => {
      if (isAuthenticated) {
        try {
          const res = (await apiAddToCart(productVariantId, quantity)) as ApiResult;
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
        const local = readLocalCart();
        const existing = local.find((i) => i.productVariantId === productVariantId);

        if (existing) {
          existing.quantity += quantity;
        } else {
          local.push({
            id: `local_${Date.now()}`,
            productVariantId,
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
    [isAuthenticated, refetchCart, toast],
  );

  // ── Update quantity ───────────────────────────────────────────────────────

  const updateQuantity = useCallback(
    async (cartItemId: string, delta: number): Promise<void> => {
      const item = items.find((i) => i.id === cartItemId);
      if (!item) return;
      const newQty = item.quantity + delta;
      if (newQty < 1) return;

      setItems((prev) => prev.map((i) => (i.id === cartItemId ? { ...i, quantity: newQty } : i)));

      if (isAuthenticated) {
        try {
          const res = (await updateCartItemQuantity(cartItemId, newQty)) as ApiResult;
          if (!res.success) {
            setItems((prev) => prev.map((i) => (i.id === cartItemId ? { ...i, quantity: item.quantity } : i)));
            toast.error(res.error ?? "Cập nhật thất bại");
          }
        } catch {
          setItems((prev) => prev.map((i) => (i.id === cartItemId ? { ...i, quantity: item.quantity } : i)));
          toast.error("Cập nhật thất bại");
        }
      } else {
        const local = readLocalCart().map((i) => (i.id === cartItemId ? { ...i, quantity: newQty } : i));
        writeLocalCart(local);
      }
    },
    [isAuthenticated, items, toast],
  );

  // ── Optimistic patch 1 item ───────────────────────────────────────────────

  const updateItem = useCallback(
    (cartItemId: string, patch: Partial<CartItemWithDetails>): void => {
      setItems((prev) =>
        prev.map((i) => (i.id === cartItemId ? { ...i, ...patch } : i))
      );
    },
    [],
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
    [isAuthenticated, items, toast],
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
      writeLocalCart(readLocalCart().filter((i) => !selectedIds.includes(i.id)));
      toast.success(`Đã xóa ${selectedIds.length} sản phẩm`);
    }
  }, [isAuthenticated, items, toast]);

  // ── Selection ─────────────────────────────────────────────────────────────

  const selectAll = items.length > 0 && items.every((i) => i.selected);
  const selectedItems = items.filter((i) => i.selected);

  const toggleSelectAll = useCallback((): void => {
    setItems((prev) => prev.map((i) => ({ ...i, selected: !selectAll })));
  }, [selectAll]);

  const toggleSelectItem = useCallback((id: string): void => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)));
  }, []);

  // ── Totals ────────────────────────────────────────────────────────────────

  const subtotal = selectedItems.reduce((sum, i) => sum + (i.originalPrice ?? i.unitPrice) * i.quantity, 0);
  const totalDiscount = selectedItems.reduce((sum, i) => sum + Math.max(0, (i.originalPrice ?? 0) - i.unitPrice) * i.quantity, 0);
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
    updateItem,
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