export interface ProductHighlight {
  key?: string;
  name: string;
  icon: string;
  value: string;
}

export interface ProductPrice {
  base: number;
  final?: number;
  discountAmount?: number;
  discountPercentage?: number;
  hasPromotion: boolean;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface ProductVariantOption {
  value: string;
  label: string;
}

export interface ProductVariant {
  type: string;
  options: ProductVariantOption[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  inStock: boolean;
  rating: ProductRating;
  isFeatured?: boolean;
  isNew: boolean;
  highlights: ProductHighlight[];
  variantOptions?: ProductVariant[];
  price: ProductPrice;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResponse {
  data: Product[];
  pagination: Pagination;
  message: string;
}

export interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export interface SubCategoryLink {
  href: string;
  label: string;
}

export interface BrandItem {
  href: string;
  label: string;
  color: string;
}

export interface BrandApiItem {
  id: string;
  name: string;
  slug: string;
  imagePath: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
}

export interface MediaApiItem {
  id: string;
  type: "SLIDER" | "BANNER";
  position: string;
  title: string | null;
  subTitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
}
