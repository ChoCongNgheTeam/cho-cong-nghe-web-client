export interface Category {
   id: string;
   name: string;
   slug: string;
   parentId: string | null;
   imageUrl: string | null;
   imagePath: string | null;
   position: number;
   isFeatured: boolean;
   isActive: boolean;
   description: string | null;
   createdAt: string;
   updatedAt: string;
   deletedAt: string | null;
   deletedBy: string | null;
   _count: {
      children: number;
      products: number;
   };
}
export interface CategoryParent {
   id: string;
   name: string;
   slug: string;
   parentId: string | null;
   position: number;
}
export interface CategoryChild {
   id: string;
   name: string;
   slug: string;
   parentId: string | null;
   imageUrl: string | null;
   imagePath: string | null;
   position: number;
   isActive: boolean;
   isFeatured: boolean;
   _count: { children: number };
}
export interface CategoryDetail extends Category {
   parent: CategoryParent | null;
   children: CategoryChild[];
}
export interface CategoryStatusCounts {
   ALL: number;
   active: number;
   inactive: number;
   featured: number;
}
export interface CategoryMeta {
   page: number;
   limit: number;
   total: number;
   totalPages: number;
   statusCounts: CategoryStatusCounts;
}
export interface CategoriesAdminResponse {
   data: Category[];
   meta: CategoryMeta;
   message: string;
}
export interface CategoriesResponse {
   data: Category[];
   total: number;
   message: string;
}
export interface GetCategoriesParams {
   page?: number;
   limit?: number;
   search?: string;
   isActive?: boolean;
   isFeatured?: boolean;
   parentId?: string;
   rootOnly?: boolean;
   sortBy?: "name" | "createdAt" | "position";
   sortOrder?: "asc" | "desc";
   includeDeleted?: boolean;
}
