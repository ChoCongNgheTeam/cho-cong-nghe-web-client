"use client";
// ============================================================
// CART CONTEXT — unified logic cho Guest & Authenticated user
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";

import { getCartItems, addToCart as apiAddToCart, updateCartItemQuantity, removeCartItem, removeCartItems, syncGuestCart } from "@/(client)/cart/actions/cart.action";
import { AuthContext } from "@/contexts/AuthContext";
import apiRequest from "@/lib/api";
import { CartItemWithDetails } from "@/(client)/cart/types/cart.types";
import { buildSyncPayload, clearLocalCart, generateLocalId, readLocalCart, SyncCartPayload, writeLocalCart } from "@/(client)/cart/components/LocalCart";

// ── Types ─────────────────────────────────────────────────────────────────

export interface AddToCartMeta {
  productId?: string;
  productName?: string;
  productSlug?: string;
  brandName?: string;
  variantName?: string; // "128GB / Trắng"
  colorLabel?: string; // "Trắng"
  storageLabel?: string; // "128GB"
  color?: string; // alias colorLabel (backward compat)
  colorValue?: string; // "#fff" | "white"
  imageUrl?: string;
  price: number;
  originalPrice: number;
  discountPercentage?: number;
  availableQuantity?: number;
}

export interface CartContextValue {
  items: CartItemWithDetails[];
  isLoading: boolean;
  totalItemCount: number;
  selectAll: boolean;
  selectedItems: CartItemWithDetails[];

  addToCart: (variantId: string, quantity?: number, meta?: AddToCartMeta) => Promise<void>;
  updateQuantity: (cartItemId: string, delta: number) => Promise<boolean>;
  /** Optimistic patch — dùng sau khi đổi variant */
  updateItem: (cartItemId: string, patch: Partial<CartItemWithDetails>) => void;
  /** Đổi variant: replace variantId + update labels, tránh duplicate */
  changeVariant: (cartItemId: string, newVariant: NewVariantData) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  removeSelectedItems: () => Promise<void>;
  toggleSelectAll: () => void;
  toggleSelectItem: (id: string) => void;
  refetchCart: (silent?: boolean) => Promise<void>;
  syncLocalToDB: () => Promise<number>;

  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  rewardPoints: number;
}

export interface NewVariantData {
  id: string;
  colorLabel: string;
  storageLabel: string;
  price: number;
  originalPrice?: number;
  colorValue?: string; // ← thêm
}

// ── Transform API response → CartItemWithDetails ─────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformApiItem(raw: any): CartItemWithDetails {
  const now = Date.now();
  // BE trả color/storage, FE cần colorLabel/storageLabel
  const colorLabel = raw.colorLabel ?? raw.color ?? "";
  const storageLabel = raw.storageLabel ?? raw.storage ?? extractStorage(raw.variantCode ?? "");

  return {
    id: raw.id,
    productVariantId: raw.productVariantId,
    productId: raw.productId ?? "",
    productName: raw.productName ?? "Sản phẩm",
    productSlug: raw.productSlug ?? "",
    brandName: raw.brandName ?? "",
    variantCode: raw.variantCode ?? "Mặc định",
    colorLabel,
    storageLabel,
    color: colorLabel,
    colorValue: raw.colorValue ?? "",
    image: raw.image ?? "",
    // Ưu tiên price.final nếu có (từ getCartWithPricing)
    unitPrice: raw.price?.final ?? raw.unitPrice ?? 0,
    originalPrice: raw.price?.base ?? raw.originalPrice ?? raw.unitPrice ?? 0,
    totalPrice: raw.totalFinalPrice ?? raw.totalPrice ?? 0,
    quantity: raw.quantity,
    availableQuantity: raw.availableQuantity ?? 0,
    selected: true,
    addedAt: raw.addedAt ?? now,
    createdAt: raw.createdAt ?? new Date(now).toISOString(),
    updatedAt: raw.updatedAt ?? new Date(now).toISOString(),
  };
}

/** Trích storage từ variantCode nếu backend cũ chưa trả storageLabel */
function extractStorage(variantCode: string): string {
  const m = variantCode.match(/(\d+\s*(?:GB|TB))/i);
  return m ? m[1].replace(/\s+/g, "") : "";
}

// ── Context ───────────────────────────────────────────────────────────────

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const hasSyncedRef = useRef(false);

  // ── Fetch ───────────────────────────────────────────────────────────────

  const refetchCart = useCallback(
    async (silent = false): Promise<void> => {
      if (!silent) setIsLoading(true);
      try {
        if (isAuthenticated) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const res = (await getCartItems()) as any;
          if (res.success && Array.isArray(res.data?.items)) {
            setItems((prev) =>
              res.data.items.map((raw: CartItemWithDetails) => ({
                ...transformApiItem(raw),
                // Giữ lại trạng thái selected
                selected: prev.find((p) => p.id === raw.id)?.selected ?? true,
              })),
            );
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
    },
    [isAuthenticated],
  );

  useEffect(() => {
    if (auth?.loading === false) refetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.loading, isAuthenticated]);

  // ── Sync guest → server khi login ───────────────────────────────────────

  const syncLocalToDB = useCallback(async (): Promise<number> => {
    const local = readLocalCart();
    if (local.length === 0) return 0;

    const payload: SyncCartPayload[] = buildSyncPayload(local);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = (await syncGuestCart(payload)) as any;
      if (res.success) {
        clearLocalCart();
        await refetchCart();
        return local.length;
      }
    } catch {
      // silent — không crash app
    }
    return 0;
  }, [refetchCart]);

  useEffect(() => {
    if (!isAuthenticated) {
      hasSyncedRef.current = false;
      return;
    }
    if (hasSyncedRef.current) return;
    hasSyncedRef.current = true;
    syncLocalToDB().then((count) => {
      if (count > 0) {
        // toast.success(`Đã đồng bộ ${count} sản phẩm vào giỏ hàng 🛒`);
        console.info(`[Cart] synced ${count} guest items`);
      }
    });
  }, [isAuthenticated, syncLocalToDB]);

  // ── Add to cart ─────────────────────────────────────────────────────────

  const addToCart = useCallback(
    async (variantId: string, quantity = 1, meta?: AddToCartMeta): Promise<void> => {
      if (isAuthenticated) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = (await apiAddToCart(variantId, quantity)) as any;
        if (res.success) await refetchCart();
        return;
      }

      // ── Guest ──
      const local = readLocalCart();
      const existing = local.find((i) => i.productVariantId === variantId);
      const now = Date.now();

      if (existing) {
        const newQty = existing.quantity + quantity;
        if (meta?.availableQuantity && newQty > meta.availableQuantity) {
          throw new Error(`Chỉ còn ${meta.availableQuantity} sản phẩm`);
        }
        existing.quantity = newQty;
        existing.totalPrice = existing.unitPrice * existing.quantity;
        existing.updatedAt = new Date(now).toISOString();
      } else {
        const colorLabel = meta?.colorLabel ?? meta?.color ?? "";
        const storageLabel = meta?.storageLabel ?? "";
        local.push({
          id: generateLocalId(),
          productVariantId: variantId,
          productId: meta?.productId ?? "",
          productName: meta?.productName ?? "Sản phẩm",
          productSlug: meta?.productSlug ?? "",
          brandName: meta?.brandName ?? "",
          variantCode: (meta?.variantName ?? [storageLabel, colorLabel].filter(Boolean).join(" / ")) || "Mặc định",
          colorLabel,
          storageLabel,
          color: colorLabel,
          colorValue: meta?.colorValue ?? "",
          image: meta?.imageUrl ?? "",
          unitPrice: meta?.price ?? 0,
          originalPrice: meta?.originalPrice ?? meta?.price ?? 0,
          totalPrice: (meta?.price ?? 0) * quantity,
          quantity,
          availableQuantity: meta?.availableQuantity ?? 0,
          selected: true,
          addedAt: now,
          createdAt: new Date(now).toISOString(),
          updatedAt: new Date(now).toISOString(),
        });
      }

      writeLocalCart(local);
      setItems([...local]);
    },
    [isAuthenticated, refetchCart],
  );

  // ── Change variant ──────────────────────────────────────────────────────
  /**
   * Đổi variant của 1 cart item.
   * - Nếu variantId mới đã tồn tại trong cart → merge quantity, xóa item cũ.
   * - Nếu chưa → replace in-place.
   * - Auth: gọi API /cart/:id/change-variant
   * - Guest: update localStorage
   */
  const changeVariant = useCallback(
    async (cartItemId: string, newVariant: NewVariantData): Promise<void> => {
      const newVariantCode = [newVariant.storageLabel, newVariant.colorLabel].filter(Boolean).join(" / ");

      // ── Optimistic update ──
      setItems((prev) => {
        const currentItem = prev.find((i) => i.id === cartItemId);
        if (!currentItem) return prev;

        const duplicate = prev.find((i) => i.productVariantId === newVariant.id && i.id !== cartItemId);

        if (duplicate) {
          return prev.filter((i) => i.id !== cartItemId).map((i) => (i.id === duplicate.id ? { ...i, quantity: i.quantity + currentItem.quantity, updatedAt: new Date().toISOString() } : i));
        }

        // Replace in-place — GIỮ NGUYÊN unitPrice/originalPrice cũ
        // Chỉ update labels + image để UI không bị NaN
        return prev.map((i) =>
          i.id !== cartItemId
            ? i
            : {
                ...i,
                productVariantId: newVariant.id,
                variantCode: newVariantCode,
                colorLabel: newVariant.colorLabel,
                storageLabel: newVariant.storageLabel,
                color: newVariant.colorLabel,
                colorValue: newVariant.colorValue ?? newVariant.colorLabel.toLowerCase().replace(/\s+/g, "-"),
                // ← GIỮ NGUYÊN: unitPrice, originalPrice, totalPrice
                // Price sẽ được update đúng sau refetchCart
                updatedAt: new Date().toISOString(),
              },
        );
      });

      if (isAuthenticated) {
        try {
          const currentItem = items.find((i) => i.id === cartItemId);
          await apiRequest.put(`/cart/${cartItemId}/change-variant`, {
            newVariantId: newVariant.id,
            quantity: currentItem?.quantity ?? 1,
          });
          // ← KHÔNG gọi refetchCart ở đây
          // onSuccess trong useVariantSelector sẽ gọi refetchCart
        } catch {
          await refetchCart(true); // chỉ refetch khi lỗi để rollback
        }
        return;
      }
      // ── Guest: persist localStorage ──
      // Đọc lại từ state hiện tại (sau optimistic update)
      setItems((prev) => {
        writeLocalCart(prev);
        return prev;
      });
    },
    [isAuthenticated, items, refetchCart],
  );

  // ── Update quantity ─────────────────────────────────────────────────────

  const updateQuantity = useCallback(
    async (cartItemId: string, delta: number): Promise<boolean> => {
      const item = items.find((i) => i.id === cartItemId);
      if (!item) return false;

      if (item.quantity + delta > item.availableQuantity) {
        return false; // ❗ báo cho UI biết
      }

      const newQty = Math.min(item.availableQuantity, Math.max(1, item.quantity + delta));

      setItems((prev) =>
        prev.map((i) =>
          i.id === cartItemId
            ? {
                ...i,
                quantity: newQty,
                totalPrice: i.unitPrice * newQty,
              }
            : i,
        ),
      );

      if (isAuthenticated) {
        const res = (await updateCartItemQuantity(cartItemId, newQty)) as any;

        if (!res.success) {
          setItems((prev) =>
            prev.map((i) =>
              i.id === cartItemId
                ? {
                    ...i,
                    quantity: item.quantity,
                    totalPrice: item.unitPrice * item.quantity,
                  }
                : i,
            ),
          );
          return false;
        }
      } else {
        const local = readLocalCart().map((i) =>
          i.id === cartItemId
            ? {
                ...i,
                quantity: newQty,
                totalPrice: i.unitPrice * newQty,
              }
            : i,
        );

        writeLocalCart(local);
      }

      return true;
    },
    [isAuthenticated, items],
  );

  // ── Optimistic patch ────────────────────────────────────────────────────

  const updateItem = useCallback((cartItemId: string, patch: Partial<CartItemWithDetails>): void => {
    setItems((prev) => prev.map((i) => (i.id === cartItemId ? { ...i, ...patch } : i)));
  }, []);

  // ── Remove ──────────────────────────────────────────────────────────────

  const removeItem = useCallback(
    async (cartItemId: string): Promise<void> => {
      const prev = items;
      setItems((curr) => curr.filter((i) => i.id !== cartItemId));

      if (isAuthenticated) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = (await removeCartItem(cartItemId)) as any;
        if (!res.success) setItems(prev);
      } else {
        writeLocalCart(readLocalCart().filter((i) => i.id !== cartItemId));
      }
    },
    [isAuthenticated, items],
  );

  const removeSelectedItems = useCallback(async (): Promise<void> => {
    const selectedIds = items.filter((i) => i.selected).map((i) => i.id);
    if (!selectedIds.length) return;

    const prev = items;
    setItems((curr) => curr.filter((i) => !i.selected));

    if (isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = (await removeCartItems(selectedIds)) as any;
      if (!res.success) setItems(prev);
    } else {
      writeLocalCart(readLocalCart().filter((i) => !selectedIds.includes(i.id)));
    }
  }, [isAuthenticated, items]);

  // ── Selection ───────────────────────────────────────────────────────────

  const selectAll = items.length > 0 && items.every((i) => i.selected);
  const selectedItems = items.filter((i) => i.selected);

  const toggleSelectAll = useCallback(() => {
    setItems((prev) => prev.map((i) => ({ ...i, selected: !selectAll })));
  }, [selectAll]);

  const toggleSelectItem = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)));
  }, []);

  // ── Totals ──────────────────────────────────────────────────────────────

  const subtotal = selectedItems.reduce((s, i) => s + (i.originalPrice ?? i.unitPrice) * i.quantity, 0);
  const totalDiscount = selectedItems.reduce((s, i) => s + Math.max(0, (i.originalPrice ?? 0) - i.unitPrice) * i.quantity, 0);
  const finalTotal = Math.max(0, subtotal - totalDiscount);
  const rewardPoints = Math.floor(finalTotal / 1_000);
  const totalItemCount = items.reduce((s, i) => s + i.quantity, 0);

  // ── Value ───────────────────────────────────────────────────────────────

  const value: CartContextValue = {
    items,
    isLoading,
    totalItemCount,
    selectAll,
    selectedItems,
    addToCart,
    updateQuantity,
    updateItem,
    changeVariant,
    removeItem,
    removeSelectedItems,
    toggleSelectAll,
    toggleSelectItem,
    refetchCart,
    syncLocalToDB,
    subtotal,
    totalDiscount,
    finalTotal,
    rewardPoints,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
