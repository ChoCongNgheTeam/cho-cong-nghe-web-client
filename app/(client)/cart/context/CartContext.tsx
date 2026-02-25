"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { CartItemWithDetails } from "../types/cart.types";
import {
  getCartItems,
  addToCart as apiAddToCart,
  updateCartItemQuantity,
  removeCartItem,
  removeCartItems,
  syncGuestCart,
} from "../actions/cart.action";
import toast from "react-hot-toast";

// ─── Context Value Interface ──────────────────────────────────────────────────

interface CartContextValue {
  items: CartItemWithDetails[];
  isLoading: boolean;
  totalItemCount: number;
  selectAll: boolean;
  selectedItems: CartItemWithDetails[];
  toggleSelectAll: () => void;
  toggleSelectItem: (id: string) => void;
  addToCart: (productVariantId: string, quantity?: number) => Promise<void>;
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
  variantCode?: string;
  image?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
}

interface ApiCartData {
  items?: ApiCartItem[];
  totalItems?: number;
  totalQuantity?: number;
  subtotal?: number;
}

interface ApiResult {
  success: boolean;
  data?: ApiCartData;
  error?: string;
  warnings?: string[];
}

// ─── LocalStorage ────────────────────────────────────────────────────────────

const LOCAL_KEY = "guest_cart";

interface GuestCartItem {
  productVariantId: string;
  quantity: number;
  addedAt: number;
}

function readLocalCart(): CartItemWithDetails[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]") as CartItemWithDetails[];
  } catch {
    return [];
  }
}

function readLocalCartRaw(): GuestCartItem[] {
  try {
    const items = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]") as CartItemWithDetails[];
    return items.map((i) => ({
      productVariantId: i.product_variant_id,
      quantity: i.quantity,
      addedAt: Date.now(),
    }));
  } catch {
    return [];
  }
}

function writeLocalCart(items: CartItemWithDetails[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

// ─── Transform ────────────────────────────────────────────────────────────────

function transformCartItem(raw: ApiCartItem): CartItemWithDetails {
  return {
    id: raw.id,
    product_variant_id: raw.productVariantId,
    product_id: raw.productId,
    product_name: raw.productName ?? "Sản phẩm",
    variant_name: raw.color ?? raw.variantCode ?? "Mặc định",
    price: raw.unitPrice ?? 0,
    original_price: raw.unitPrice ?? 0,
    quantity: raw.quantity,
    image_url: raw.image ?? "",
    unit_price: raw.unitPrice ?? 0,
    discount_value: 0,
    selected: true,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const refetchCart = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await getCartItems() as ApiResult;
      if (res.success && res.data?.items && Array.isArray(res.data.items)) {
        setIsAuthenticated(true);
        setItems(res.data.items.map(transformCartItem));
      } else {
        setIsAuthenticated(false);
        setItems(readLocalCart());
      }
    } catch {
      setIsAuthenticated(false);
      setItems(readLocalCart());
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // dùng ref để gọi 1 lần duy nhất khi mount, tránh warning deps
  useEffect(() => {
    refetchCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync guest → DB ───────────────────────────────────────────────────────
  const syncLocalToDB = useCallback(async (): Promise<void> => {
    const guestItems = readLocalCartRaw();
    if (guestItems.length === 0) return;
    try {
      const res = await syncGuestCart(guestItems) as ApiResult;
      if (res.success) {
        localStorage.removeItem(LOCAL_KEY);
        res.warnings?.forEach((w) => toast(w, { icon: "⚠️" }));
        await refetchCart();
      }
    } catch {
      // silent
    }
  }, [refetchCart]);

  // ── Add ───────────────────────────────────────────────────────────────────
  const addToCart = useCallback(
    async (productVariantId: string, quantity = 1): Promise<void> => {
      if (isAuthenticated) {
        try {
          const res = await apiAddToCart(productVariantId, quantity) as ApiResult;
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
        const existing = local.find((i) => i.product_variant_id === productVariantId);
        if (existing) {
          existing.quantity += quantity;
        } else {
          local.push({
            id: `local_${Date.now()}`,
            product_variant_id: productVariantId,
            product_name: "Sản phẩm",
            variant_name: "Mặc định",
            price: 0,
            original_price: 0,
            quantity,
            image_url: "",
            unit_price: 0,
            discount_value: 0,
            selected: true,
          });
        }
        writeLocalCart(local);
        setItems([...local]);
        toast.success("Đã thêm vào giỏ hàng");
      }
    },
    [isAuthenticated, refetchCart]
  );

  // ── Update quantity ───────────────────────────────────────────────────────
  const updateQuantity = useCallback(
    async (cartItemId: string, delta: number): Promise<void> => {
      const item = items.find((i) => i.id === cartItemId);
      if (!item) return;
      const newQty = item.quantity + delta;
      if (newQty < 1) return;

      setItems((prev) =>
        prev.map((i) => (i.id === cartItemId ? { ...i, quantity: newQty } : i))
      );

      if (isAuthenticated) {
        try {
          const res = await updateCartItemQuantity(cartItemId, newQty) as ApiResult;
          if (!res.success) {
            setItems((prev) =>
              prev.map((i) => (i.id === cartItemId ? { ...i, quantity: item.quantity } : i))
            );
            toast.error(res.error ?? "Cập nhật thất bại");
          }
        } catch {
          setItems((prev) =>
            prev.map((i) => (i.id === cartItemId ? { ...i, quantity: item.quantity } : i))
          );
          toast.error("Cập nhật thất bại");
        }
      } else {
        writeLocalCart(
          readLocalCart().map((i) =>
            i.id === cartItemId ? { ...i, quantity: newQty } : i
          )
        );
      }
    },
    [isAuthenticated, items]
  );

  // ── Remove single ─────────────────────────────────────────────────────────
  const removeItem = useCallback(
    async (cartItemId: string): Promise<void> => {
      const prev = items;
      setItems((curr) => curr.filter((i) => i.id !== cartItemId));

      if (isAuthenticated) {
        try {
          const res = await removeCartItem(cartItemId) as ApiResult;
          if (!res.success) {
            setItems(prev);
            toast.error("Xóa thất bại");
          } else {
            toast.success("Đã xóa sản phẩm");
          }
        } catch {
          setItems(prev);
          toast.error("Xóa thất bại");
        }
      } else {
        writeLocalCart(readLocalCart().filter((i) => i.id !== cartItemId));
        toast.success("Đã xóa sản phẩm");
      }
    },
    [isAuthenticated, items]
  );

  // ── Remove selected ───────────────────────────────────────────────────────
  const removeSelectedItems = useCallback(async (): Promise<void> => {
    const selectedIds = items.filter((i) => i.selected).map((i) => i.id);
    if (selectedIds.length === 0) return;

    const prev = items;
    setItems((curr) => curr.filter((i) => !i.selected));

    if (isAuthenticated) {
      try {
        const res = await removeCartItems(selectedIds) as ApiResult;
        if (!res.success) {
          setItems(prev);
          toast.error("Xóa thất bại");
        } else {
          toast.success(`Đã xóa ${selectedIds.length} sản phẩm`);
        }
      } catch {
        setItems(prev);
        toast.error("Xóa thất bại");
      }
    } else {
      writeLocalCart(readLocalCart().filter((i) => !selectedIds.includes(i.id)));
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
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  }, []);

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal = selectedItems.reduce((sum, i) => sum + i.original_price * i.quantity, 0);
  const totalDiscount = selectedItems.reduce(
    (sum, i) => sum + Math.max(0, i.original_price - i.price) * i.quantity,
    0
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

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}