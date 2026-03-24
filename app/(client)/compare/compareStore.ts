import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductDetail } from "@/lib/types/product";

const MAX_COMPARE = 3;

function getRootSlug(category: any): string | null {
  if (!category) return null;
  // Cấu trúc 3 level: category.slug → parent.slug → parent.parent.slug (root)
  return (
    category?.parent?.parent?.slug ??
    category?.parent?.slug ??
    category?.slug ??
    null
  );
}

interface CompareStore {
  items: ProductDetail[];
  rootCategorySlug: string | null;
  add: (product: ProductDetail) => {
    success: boolean;
    reason?: "full" | "duplicate" | "wrong_category";
  };
  remove: (id: string) => void;
  toggle: (product: ProductDetail) => void;
  clear: () => void;
  isInCompare: (id: string) => boolean;
  isSameCategory: (product: ProductDetail) => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      rootCategorySlug: null,

      add: (product) => {
        const { items, isInCompare, rootCategorySlug } = get();

        if (items.length >= MAX_COMPARE)
          return { success: false, reason: "full" };

        if (isInCompare(product.id))
          return { success: false, reason: "duplicate" };

        const productRootSlug = getRootSlug(product.category);

        if (rootCategorySlug && productRootSlug !== rootCategorySlug)
          return { success: false, reason: "wrong_category" };

        set((s) => ({
          items: [...s.items, product],
          // dùng s.rootCategorySlug thay vì check s.items.length
          // vì items có thể đã được hydrate từ localStorage
          rootCategorySlug: s.rootCategorySlug ?? productRootSlug,
        }));

        return { success: true };
      },

      remove: (id) =>
        set((s) => {
          const next = s.items.filter((p) => p.id !== id);
          return {
            items: next,
            rootCategorySlug: next.length === 0 ? null : s.rootCategorySlug,
          };
        }),

      toggle: (product) => {
        const { isInCompare, remove, add } = get();
        isInCompare(product.id) ? remove(product.id) : add(product);
      },

      clear: () => set({ items: [], rootCategorySlug: null }),

      isInCompare: (id) => get().items.some((p) => p.id === id),

      isSameCategory: (product) => {
        const { rootCategorySlug } = get();
        if (!rootCategorySlug) return true;
        return getRootSlug(product.category) === rootCategorySlug;
      },
    }),
    {
      name: "compare-store",
      version: 3,
      migrate: (_persistedState: any) => {
        return { items: [], rootCategorySlug: null };
      },
      partialize: (state) => ({
        items: state.items,
        rootCategorySlug: state.rootCategorySlug,
      }),
    },
  ),
);