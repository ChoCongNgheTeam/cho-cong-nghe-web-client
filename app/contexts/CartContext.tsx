"use client";
// ============================================================
// CART CONTEXT — unified logic cho Guest & Authenticated user
//
// PATTERN chuẩn hóa cho mọi mutation:
//   1. Validate (qty bounds, availableQty) — cả Guest lẫn Auth
//   2. Snapshot state hiện tại để rollback
//   3. Optimistic setState
//   4. Persist: Auth → gọi API, Guest → writeLocalCart
//   5. Nếu lỗi → rollback về snapshot
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
  rawItems: CartItemWithDetails[];
  isLoading: boolean;
  totalItemCount: number;
  selectAll: boolean;
  selectedItems: CartItemWithDetails[];

addToCart: (variantId: string | undefined, quantity?: number, meta?: AddToCartMeta) => Promise<void>;
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
  colorValue?: string;
}

// ── Response types ────────────────────────────────────────────────────────

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

interface CartItemsResponse {
  items: CartItemWithDetails[];
}

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Clamp quantity theo availableQuantity.
 * Nếu availableQty = 0 (không track) thì chỉ clamp min = 1.
 */
function clampQty(desired: number, availableQty: number): number {
  const clamped = Math.max(1, desired);
  return availableQty > 0 ? Math.min(availableQty, clamped) : clamped;
}

/**
 * Validate xem có thể thêm `delta` vào quantity hiện tại không.
 * Trả về null nếu OK, hoặc message lỗi nếu không hợp lệ.
 */
function validateQtyChange(current: number, delta: number, availableQty: number): string | null {
  const next = current + delta;
  if (next < 1) return "Số lượng tối thiểu là 1";
  if (availableQty > 0 && next > availableQty) {
    return `Chỉ còn ${availableQty} sản phẩm trong kho`;
  }
  return null;
}

// ── Transform API response → CartItemWithDetails ─────────────────────────

function transformApiItem(raw: CartItemWithDetails): CartItemWithDetails {
  const now = Date.now();
  const colorLabel = (raw as CartItemWithDetails & { color?: string }).colorLabel ?? (raw as CartItemWithDetails & { color?: string }).color ?? "";
  const storageLabel = raw.storageLabel ?? extractStorage((raw as CartItemWithDetails & { variantCode?: string }).variantCode ?? "");

  return {
    id: raw.id,
    productVariantId: raw.productVariantId,
    productId: raw.productId ?? "",
    brandId: raw.brandId ?? "",
    categoryId: raw.categoryId ?? "",
    categoryPath: raw.categoryPath ?? [],
    productName: raw.productName ?? "Sản phẩm",
    productSlug: raw.productSlug ?? "",
    brandName: raw.brandName ?? "",
    variantCode: raw.variantCode ?? "Mặc định",
    colorLabel,
    storageLabel,
    color: colorLabel,
    colorValue: raw.colorValue ?? "",
    image: raw.image ?? "",
    unitPrice: (raw as CartItemWithDetails & { price?: { final?: number } }).price?.final ?? raw.unitPrice ?? 0,
    originalPrice: (raw as CartItemWithDetails & { price?: { base?: number } }).price?.base ?? raw.originalPrice ?? raw.unitPrice ?? 0,
    totalPrice: (raw as CartItemWithDetails & { totalFinalPrice?: number }).totalFinalPrice ?? raw.totalPrice ?? 0,
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
  const [rawItems, setRawItems] = useState<CartItemWithDetails[]>([]);

  // Ref luôn trỏ vào items mới nhất — tránh stale closure trong callbacks
  const itemsRef = useRef<CartItemWithDetails[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // ── Fetch ───────────────────────────────────────────────────────────────

  const refetchCart = useCallback(
    async (silent = false): Promise<void> => {
      if (!silent) setIsLoading(true);
      try {
        if (isAuthenticated) {
          const res = (await getCartItems()) as ApiResponse<CartItemsResponse>;
          if (res.success && Array.isArray(res.data?.items)) {
            setItems((prev) =>
              res.data!.items.map((raw) => ({
                ...transformApiItem(raw),
                selected: prev.find((p) => p.id === raw.id)?.selected ?? true,
              })),
            );
            setRawItems(res.data!.items);
          } else {
            setItems([]);
            setRawItems([]);
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
      const res = (await syncGuestCart(payload)) as ApiResponse;
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
        console.info(`[Cart] synced ${count} guest items`);
      }
    });
  }, [isAuthenticated, syncLocalToDB]);

  // ── Add to cart ─────────────────────────────────────────────────────────
  //
  // Cải tiến Guest: check availableQuantity cho cả item MỚI (không chỉ existing).

  const addToCart = useCallback(
   async (variantId: string | undefined, quantity = 1, meta?: AddToCartMeta): Promise<void> => {
      // ── Validate chung (cả Auth và Guest) ──
      const avail = meta?.availableQuantity ?? 0;
      if (avail > 0 && quantity > avail) {
        throw new Error(`Chỉ còn ${avail} sản phẩm trong kho`);
      }

      const hasStockInfo = meta?.availableQuantity != null; // undefined → không track
      if (hasStockInfo && avail > 0 && quantity > avail) {
        throw new Error(`Chỉ còn ${avail} sản phẩm trong kho`);
      }
      // Nếu avail = 0 mà hasStockInfo = true → hết hàng
      if (hasStockInfo && avail === 0) {
        throw new Error(`Sản phẩm đã hết hàng`);
      }

      if (isAuthenticated) {
        if (!variantId) throw new Error("Thiếu variantId");
       const res = (await apiAddToCart(variantId, quantity)) as ApiResponse;
        if (res.success) await refetchCart();
        return;
      }

      // ── Guest ──
      const local = readLocalCart();
      const existing = local.find((i) => i.productVariantId === variantId);
      const now = Date.now();

      if (existing) {
        const newQty = existing.quantity + quantity;
        // Validate tổng qty sau khi cộng
        const err = validateQtyChange(existing.quantity, quantity, avail);
        if (err) throw new Error(err);

        existing.quantity = newQty;
        existing.totalPrice = existing.unitPrice * existing.quantity;
        existing.updatedAt = new Date(now).toISOString();
      } else {
         if (!variantId) throw new Error("Thiếu variantId"); 
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
          availableQuantity: avail,
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
  //
  // Cải tiến Guest: persist → rollback nếu writeLocalCart throw (disk full v.v.)
  // Auth: giữ nguyên — rollback nếu API fail.

  const changeVariant = useCallback(
    async (cartItemId: string, newVariant: NewVariantData): Promise<void> => {
      const newVariantCode = [newVariant.storageLabel, newVariant.colorLabel].filter(Boolean).join(" / ");
      const snapshot = itemsRef.current;

      // ── Optimistic update (dùng chung cho cả Guest và Auth) ──
      const buildNext = (prev: CartItemWithDetails[]): CartItemWithDetails[] => {
        const currentItem = prev.find((i) => i.id === cartItemId);
        if (!currentItem) return prev;

        const duplicate = prev.find((i) => i.productVariantId === newVariant.id && i.id !== cartItemId);

        if (duplicate) {
          return prev.filter((i) => i.id !== cartItemId).map((i) => (i.id === duplicate.id ? { ...i, quantity: i.quantity + currentItem.quantity, updatedAt: new Date().toISOString() } : i));
        }

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
                updatedAt: new Date().toISOString(),
              },
        );
      };

      setItems((prev) => buildNext(prev));

      if (isAuthenticated) {
        try {
          const currentItem = itemsRef.current.find((i) => i.id === cartItemId);
          await apiRequest.put(`/cart/${cartItemId}/change-variant`, {
            newVariantId: newVariant.id,
            quantity: currentItem?.quantity ?? 1,
          });
        } catch {
          // Rollback về snapshot nếu API fail
          setItems(snapshot);
        }
        return;
      }

      // ── Guest: persist vào localStorage, rollback nếu lỗi ──
      try {
        setItems((prev) => {
          const next = buildNext(prev);
          writeLocalCart(next);
          return next;
        });
      } catch {
        setItems(snapshot);
      }
    },
    [isAuthenticated],
  );

  // ── Update quantity ─────────────────────────────────────────────────────
  //
  // Cải tiến Guest: dùng cùng validate + rollback pattern như Auth.

  const updateQuantity = useCallback(
    async (cartItemId: string, delta: number): Promise<boolean> => {
      const item = itemsRef.current.find((i) => i.id === cartItemId);
      if (!item) return false;

      // ── Validate chung (cả Guest và Auth) ──
      const err = validateQtyChange(item.quantity, delta, item.availableQuantity);
      if (err) return false;

      const newQty = clampQty(item.quantity + delta, item.availableQuantity);
      const snapshot = itemsRef.current;

      // Optimistic update
      setItems((prev) => prev.map((i) => (i.id === cartItemId ? { ...i, quantity: newQty, totalPrice: i.unitPrice * newQty } : i)));

      if (isAuthenticated) {
        const res = (await updateCartItemQuantity(cartItemId, newQty)) as ApiResponse;
        if (!res.success) {
          setItems(snapshot);
          return false;
        }
      } else {
        // ── Guest: persist, rollback nếu lỗi ──
        try {
          writeLocalCart(readLocalCart().map((i) => (i.id === cartItemId ? { ...i, quantity: newQty, totalPrice: i.unitPrice * newQty } : i)));
        } catch {
          setItems(snapshot);
          return false;
        }
      }

      return true;
    },
    [isAuthenticated],
  );

  // ── Optimistic patch ────────────────────────────────────────────────────

  const updateItem = useCallback((cartItemId: string, patch: Partial<CartItemWithDetails>): void => {
    setItems((prev) => prev.map((i) => (i.id === cartItemId ? { ...i, ...patch } : i)));
  }, []);

  // ── Remove ──────────────────────────────────────────────────────────────
  //
  // Cải tiến Guest: rollback nếu writeLocalCart throw.

  const removeItem = useCallback(
    async (cartItemId: string): Promise<void> => {
      const snapshot = itemsRef.current;
      setItems((curr) => curr.filter((i) => i.id !== cartItemId));

      if (isAuthenticated) {
        const res = (await removeCartItem(cartItemId)) as ApiResponse;
        if (!res.success) setItems(snapshot);
      } else {
        try {
          writeLocalCart(readLocalCart().filter((i) => i.id !== cartItemId));
        } catch {
          setItems(snapshot);
        }
      }
    },
    [isAuthenticated],
  );

  // ── Remove selected ─────────────────────────────────────────────────────
  //
  // Cải tiến Auth: dùng failedIds từ action để rollback chỉ item thực sự lỗi,
  // không rollback toàn bộ.
  // Cải tiến Guest: rollback nếu writeLocalCart throw.

  const removeSelectedItems = useCallback(async (): Promise<void> => {
    const snapshot = itemsRef.current;
    const selectedIds = snapshot.filter((i) => i.selected).map((i) => i.id);
    if (!selectedIds.length) return;

    setItems((curr) => curr.filter((i) => !i.selected));

    if (isAuthenticated) {
      const res = (await removeCartItems(selectedIds)) as ApiResponse & { failedIds?: string[] };
      if (!res.success) {
        if (res.failedIds && res.failedIds.length < selectedIds.length) {
          // Partial rollback: chỉ khôi phục những item thực sự fail
          const failedSet = new Set(res.failedIds);
          setItems((curr) => {
            const failedItems = snapshot.filter((i) => failedSet.has(i.id));
            return [...curr, ...failedItems].sort((a, b) => (a.addedAt ?? 0) - (b.addedAt ?? 0));
          });
        } else {
          // Toàn bộ fail → rollback hết
          setItems(snapshot);
        }
      }
    } else {
      try {
        const selectedSet = new Set(selectedIds);
        writeLocalCart(readLocalCart().filter((i) => !selectedSet.has(i.id)));
      } catch {
        setItems(snapshot);
      }
    }
  }, [isAuthenticated]);

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
    rawItems,
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
