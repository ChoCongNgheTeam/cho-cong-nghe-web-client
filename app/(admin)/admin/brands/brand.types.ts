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

export interface BrandsResponse {
   data: Brand[];
   message: string;
}

export interface GetBrandsParams {
   search?: string;
   isFeatured?: boolean;
   isActive?: boolean;
   sortBy?: "name" | "createdAt" | "productCount";
   sortOrder?: "asc" | "desc";
}
