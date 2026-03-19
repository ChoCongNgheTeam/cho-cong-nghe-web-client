export interface Brand {
  id: string;
  name: string;
  description: string | null;
  imagePath: string | null;
  imageUrl: string | null;
  slug: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
}

export interface BrandsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BrandsResponse {
  data: Brand[];
  meta: BrandsMeta;
  message: string;
}

export interface GetBrandsParams {
  page?: number;
  limit?: number;
  search?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "name" | "createdAt" | "productCount";
  sortOrder?: "asc" | "desc";
}
