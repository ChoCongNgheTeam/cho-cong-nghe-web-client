"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductDetail } from "@/lib/types/product";

function getRootSlug(category: any): string | null {
  if (!category) return null;
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
  maxCompare: (isMobile: boolean) => number;
  add: (
    product: ProductDetail,
    isMobile?: boolean,
  ) => {
    success: boolean;
    reason?: "full" | "duplicate" | "wrong_category";
  };
  remove: (id: string) => void;
  toggle: (product: ProductDetail, isMobile?: boolean) => void;
  clear: () => void;
  isInCompare: (id: string) => boolean;
  isSameCategory: (product: ProductDetail) => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      rootCategorySlug: null,

      maxCompare: (isMobile: boolean) => (isMobile ? 2 : 3),

      add: (product, isMobile = false) => {
        const { items, isInCompare, rootCategorySlug, maxCompare } = get();
        const MAX = maxCompare(isMobile);

        if (items.length >= MAX) return { success: false, reason: "full" };

        if (isInCompare(product.id))
          return { success: false, reason: "duplicate" };

        const productRootSlug = getRootSlug(product.category);

        if (rootCategorySlug && productRootSlug !== rootCategorySlug)
          return { success: false, reason: "wrong_category" };

        set((s) => ({
          items: [...s.items, product],
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

      toggle: (product, isMobile = false) => {
        const { isInCompare, remove, add } = get();
        isInCompare(product.id) ? remove(product.id) : add(product, isMobile);
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
      version: 4,
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