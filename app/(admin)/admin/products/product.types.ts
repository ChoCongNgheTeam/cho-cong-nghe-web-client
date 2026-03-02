export interface ProductRating {
   average: number;
   count: number;
}

export interface ProductHighlight {
   key: string;
   name: string;
   icon: string;
   value: string;
}

export interface Product {
   id: string;
   name: string;
   priceOrigin: number;
   slug: string;
   thumbnail: string;
   rating: ProductRating;
   isNew: boolean;
   highlights: ProductHighlight[];
   inStock: boolean;
}

export interface Pagination {
   page: number;
   limit: number;
   total: number;
   totalPages: number;
}

export interface GetAllProductResponse {
   data: Product[];
   pagination: Pagination;
   message: string;
}

export interface GetAllProductParams {
   page?: number;
   limit?: number;
   search?: string;
   [key: string]: string | number | undefined;
}
