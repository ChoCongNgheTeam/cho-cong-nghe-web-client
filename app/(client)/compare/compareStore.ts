import { create } from "zustand";
import { ProductDetail } from "@/lib/types/product";

const MAX_COMPARE = 3;

interface CompareStore {
  items: ProductDetail[];
  rootCategorySlug: string | null; // slug của root category của sản phẩm đầu tiên
  add: (product: ProductDetail, rootSlug?: string | null) => void;
  remove: (id: string) => void;
  toggle: (product: ProductDetail, rootSlug?: string | null) => void;
  clear: () => void;
  isInCompare: (id: string) => boolean;
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  items: [],
  rootCategorySlug: null,

  add: (product, rootSlug = null) => {
    const { items, isInCompare } = get();
    if (items.length >= MAX_COMPARE) return;
    if (isInCompare(product.id)) return;
    set((s) => ({
      items: [...s.items, product],
      // Chỉ set rootCategorySlug khi thêm sản phẩm đầu tiên
      rootCategorySlug: s.items.length === 0 ? rootSlug : s.rootCategorySlug,
    }));
  },

  remove: (id) =>
    set((s) => {
      const next = s.items.filter((p) => p.id !== id);
      return {
        items: next,
        // Reset slug khi xóa hết
        rootCategorySlug: next.length === 0 ? null : s.rootCategorySlug,
      };
    }),

  toggle: (product, rootSlug = null) =>
    get().isInCompare(product.id)
      ? get().remove(product.id)
      : get().add(product, rootSlug),

  clear: () => set({ items: [], rootCategorySlug: null }),

  isInCompare: (id) => get().items.some((p) => p.id === id),
}));