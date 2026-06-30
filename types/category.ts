export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl?: string;
  imagePath?: string;
  position?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  description?: string;
  children?: Category[];
  _count?: null | { children: number; products: number };
}
