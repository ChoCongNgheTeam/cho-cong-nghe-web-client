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
   _count: {
      children: number;
   };
}

export interface CategoriesResponse {
   data: Category[];
   total: number;
   message: string;
}

export interface GetCategoriesParams {
   search?: string;
   isActive?: boolean;
   isFeatured?: boolean;
   parentId?: string;
   sortBy?: "name" | "createdAt" | "position";
   sortOrder?: "asc" | "desc";
}
