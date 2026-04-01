import apiRequest from "@/lib/api";
import { CategoryWithAttributes, AttributeSimple } from "../category-variant-attribute.types";

interface ListResponse {
  data: CategoryWithAttributes[];
  message: string;
}

interface DetailResponse {
  data: CategoryWithAttributes;
  message: string;
}

interface AttributesResponse {
  data: AttributeSimple[];
  message: string;
}

export const getAllCategoryAttributes = (): Promise<ListResponse> => apiRequest.get("/category-variant-attributes");

export const getCategoryAttributes = (categoryId: string): Promise<DetailResponse> => apiRequest.get(`/category-variant-attributes/${categoryId}`);

export const getAttributeOptions = (): Promise<AttributesResponse> => apiRequest.get("/category-variant-attributes/attributes");

export const updateCategoryAttributes = (categoryId: string, attributeIds: string[]): Promise<DetailResponse> => apiRequest.put(`/category-variant-attributes/${categoryId}`, { attributeIds });
