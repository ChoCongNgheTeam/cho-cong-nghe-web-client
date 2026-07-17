import { create } from "zustand";
import { fetchRootCategories } from "@/lib/api/header/header.api";
import { Category } from "@/types/category";

interface CategoryMenuStore {
  isOpen: boolean;
  categories: Category[];
  categoriesLoaded: boolean;
  categoriesLoading: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  fetchCategoriesOnce: () => Promise<void>;
}

export const useCategoryMenuStore = create<CategoryMenuStore>((set, get) => ({
  isOpen: false,
  categories: [],
  categoriesLoaded: false,
  categoriesLoading: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  // Chỉ fetch 1 lần, cache lại trong store — dùng cho các trang không có
  // sẵn rootCategories từ SSR (khác trang Home)
  fetchCategoriesOnce: async () => {
    const { categoriesLoaded, categoriesLoading } = get();
    if (categoriesLoaded || categoriesLoading) return;

    set({ categoriesLoading: true });
    try {
      const data = await fetchRootCategories();
      set({ categories: data, categoriesLoaded: true });
    } catch (error) {
      console.error("Failed to load root categories:", error);
    } finally {
      set({ categoriesLoading: false });
    }
  },
}));
