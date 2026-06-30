import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getCartItems, addToCart as apiAddToCart, updateCartItemQuantity, removeCartItem, removeCartItems, syncGuestCart } from "./cart.actions";
import { buildSyncPayload, clearLocalCart, generateLocalId, readLocalCart, writeLocalCart, SyncCartPayload } from "./local-cart";
import type { CartItemWithDetails, AddToCartMeta, NewVariantData } from "./cart.types";
import { clampQty, validateQtyChange, transformApiItem } from "./cart.helpers";

interface CartState {
  items: CartItemWithDetails[];
  rawItems: CartItemWithDetails[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface CartActions {
  _setAuth: (isAuth: boolean) => void;
  refetchCart: (silent?: boolean) => Promise<void>;
  syncLocalToDB: () => Promise<number>;
  addToCart: (variantId: string | undefined, quantity?: number, meta?: AddToCartMeta) => Promise<void>;
  updateQuantity: (cartItemId: string, delta: number) => Promise<boolean>;
  updateItem: (cartItemId: string, patch: Partial<CartItemWithDetails>) => void;
  changeVariant: (cartItemId: string, newVariant: NewVariantData) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  removeSelectedItems: () => Promise<void>;
  toggleSelectAll: () => void;
  toggleSelectItem: (id: string) => void;
}

type CartStore = CartState & CartActions;

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  failedIds?: string[];
}

export const useCartStore = create<CartStore>()(
  subscribeWithSelector((set, get) => ({
    items: [],
    rawItems: [],
    isLoading: true,
    isAuthenticated: false,

    _setAuth: (isAuth) => set({ isAuthenticated: isAuth }),

    // ── Fetch ──────────────────────────────────────────────────────────
    refetchCart: async (silent = false) => {
      if (!silent) set({ isLoading: true });
      const { isAuthenticated } = get();
      try {
        if (isAuthenticated) {
          const res = (await getCartItems()) as ApiResponse<{ items: CartItemWithDetails[] }>;
          if (res.success && Array.isArray(res.data?.items)) {
            const prev = get().items;
            set({
              items: res.data!.items.map((raw) => ({
                ...transformApiItem(raw),
                selected: prev.find((p) => p.id === raw.id)?.selected ?? true,
              })),
              rawItems: res.data!.items,
            });
          } else {
            set({ items: [], rawItems: [] });
          }
        } else {
          set({ items: readLocalCart() });
        }
      } catch {
        set({ items: isAuthenticated ? [] : readLocalCart() });
      } finally {
        if (!silent) set({ isLoading: false });
      }
    },

    // ── Sync guest → DB ────────────────────────────────────────────────
    syncLocalToDB: async () => {
      const local = readLocalCart();
      if (local.length === 0) return 0;
      try {
        const payload: SyncCartPayload[] = buildSyncPayload(local);
        const res = (await syncGuestCart(payload)) as ApiResponse;
        if (res.success) {
          clearLocalCart();
          await get().refetchCart();
          return local.length;
        }
      } catch {
        /* silent */
      }
      return 0;
    },

    // ── Add to cart ────────────────────────────────────────────────────
    addToCart: async (variantId, quantity = 1, meta) => {
      const avail = meta?.availableQuantity ?? 0;
      if (avail > 0 && quantity > avail) throw new Error(`Chỉ còn ${avail} sản phẩm`);
      if (meta?.availableQuantity != null && avail === 0) throw new Error("Sản phẩm đã hết hàng");

      const { isAuthenticated, items, refetchCart } = get();

      if (isAuthenticated) {
        if (!variantId) throw new Error("Thiếu variantId");
        const existing = items.find((i) => i.productVariantId === variantId);
        if (existing) {
          const err = validateQtyChange(existing.quantity, quantity, avail);
          if (err) throw new Error(err);
        }
        const res = (await apiAddToCart(variantId, quantity)) as ApiResponse;
        if (res.success) await refetchCart();
        return;
      }

      // Guest
      const local = readLocalCart();
      const existing = local.find((i) => i.productVariantId === variantId);
      const now = Date.now();

      if (existing) {
        const err = validateQtyChange(existing.quantity, quantity, avail);
        if (err) throw new Error(err);
        existing.quantity += quantity;
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
          brandId: "",
          categoryId: "",
          categoryPath: [],
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
      set({ items: [...local] });
    },

    // ── Update quantity ────────────────────────────────────────────────
    updateQuantity: async (cartItemId, delta) => {
      const { isAuthenticated, items } = get();
      const item = items.find((i) => i.id === cartItemId);
      if (!item) return false;

      const err = validateQtyChange(item.quantity, delta, item.availableQuantity);
      if (err) return false;

      const newQty = clampQty(item.quantity + delta, item.availableQuantity);
      const snapshot = items;

      set({ items: items.map((i) => (i.id === cartItemId ? { ...i, quantity: newQty, totalPrice: i.unitPrice * newQty } : i)) });

      if (isAuthenticated) {
        const res = (await updateCartItemQuantity(cartItemId, newQty)) as ApiResponse;
        if (!res.success) {
          set({ items: snapshot });
          return false;
        }
      } else {
        try {
          writeLocalCart(readLocalCart().map((i) => (i.id === cartItemId ? { ...i, quantity: newQty, totalPrice: i.unitPrice * newQty } : i)));
        } catch {
          set({ items: snapshot });
          return false;
        }
      }
      return true;
    },

    // ── Optimistic patch ───────────────────────────────────────────────
    updateItem: (cartItemId, patch) => {
      set((s) => ({ items: s.items.map((i) => (i.id === cartItemId ? { ...i, ...patch } : i)) }));
    },

    // ── Change variant ─────────────────────────────────────────────────
    changeVariant: async (cartItemId, newVariant) => {
      const { isAuthenticated, items } = get();
      const snapshot = items;
      const newVariantCode = [newVariant.storageLabel, newVariant.colorLabel].filter(Boolean).join(" / ");

      const buildNext = (prev: CartItemWithDetails[]) => {
        const cur = prev.find((i) => i.id === cartItemId);
        if (!cur) return prev;
        const dup = prev.find((i) => i.productVariantId === newVariant.id && i.id !== cartItemId);
        if (dup) {
          return prev.filter((i) => i.id !== cartItemId).map((i) => (i.id === dup.id ? { ...i, quantity: i.quantity + cur.quantity } : i));
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
                colorValue: newVariant.colorValue ?? "",
              },
        );
      };

      set((s) => ({ items: buildNext(s.items) }));

      if (isAuthenticated) {
        try {
          const cur = items.find((i) => i.id === cartItemId);
          await import("@/lib/api").then(({ default: api }) =>
            api.put(`/cart/${cartItemId}/change-variant`, {
              newVariantId: newVariant.id,
              quantity: cur?.quantity ?? 1,
            }),
          );
        } catch {
          set({ items: snapshot });
        }
      } else {
        try {
          set((s) => {
            writeLocalCart(s.items);
            return {};
          });
        } catch {
          set({ items: snapshot });
        }
      }
    },

    // ── Remove ─────────────────────────────────────────────────────────
    removeItem: async (cartItemId) => {
      const { isAuthenticated, items } = get();
      const snapshot = items;
      set({ items: items.filter((i) => i.id !== cartItemId) });
      if (isAuthenticated) {
        const res = (await removeCartItem(cartItemId)) as ApiResponse;
        if (!res.success) set({ items: snapshot });
      } else {
        try {
          writeLocalCart(readLocalCart().filter((i) => i.id !== cartItemId));
        } catch {
          set({ items: snapshot });
        }
      }
    },

    // ── Remove selected ────────────────────────────────────────────────
    removeSelectedItems: async () => {
      const { isAuthenticated, items } = get();
      const snapshot = items;
      const selectedIds = items.filter((i) => i.selected).map((i) => i.id);
      if (!selectedIds.length) return;

      set({ items: items.filter((i) => !i.selected) });

      if (isAuthenticated) {
        const res = (await removeCartItems(selectedIds)) as ApiResponse & { failedIds?: string[] };
        if (!res.success) {
          if (res.failedIds && res.failedIds.length < selectedIds.length) {
            const failedSet = new Set(res.failedIds);
            set((s) => ({
              items: [...s.items, ...snapshot.filter((i) => failedSet.has(i.id))].sort((a, b) => (a.addedAt ?? 0) - (b.addedAt ?? 0)),
            }));
          } else {
            set({ items: snapshot });
          }
        }
      } else {
        try {
          const sel = new Set(selectedIds);
          writeLocalCart(readLocalCart().filter((i) => !sel.has(i.id)));
        } catch {
          set({ items: snapshot });
        }
      }
    },

    // ── Selection ──────────────────────────────────────────────────────
    toggleSelectAll: () => {
      const allSelected = get().items.every((i) => i.selected);
      set((s) => ({ items: s.items.map((i) => ({ ...i, selected: !allSelected })) }));
    },

    toggleSelectItem: (id) => {
      set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)) }));
    },
  })),
);
