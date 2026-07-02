import { Category } from "@/types/category";
import { SearchProduct, TrendingKeyword } from "../../../components/layout/header/type";

export interface CategoryResponse {
  data: Category[];
  message: string;
}

export interface TrendingResponse {
  data: TrendingKeyword[];
  total: number;
  message: string;
}

export interface SearchResponse {
  data: SearchProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

export interface RootCategoryResponse {
  data: Category[];
  message: string;
}
