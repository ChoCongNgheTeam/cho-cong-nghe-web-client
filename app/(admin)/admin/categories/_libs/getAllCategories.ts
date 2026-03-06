// get all category
import apiRequest from "@/lib/api";
import { CategoriesResponse, GetCategoriesParams } from "../category.types";

export const getAllCategories = async (
   params?: GetCategoriesParams,
): Promise<CategoriesResponse> => {
   return apiRequest.get<CategoriesResponse>("/categories/admin/all", {
      params,
   });
};
