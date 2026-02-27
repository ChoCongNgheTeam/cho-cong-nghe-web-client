import apiRequest from "@/lib/api";
import { BrandsResponse, GetBrandsParams } from "../brand.types";

export const getAllBrands = async (
   params?: GetBrandsParams,
): Promise<BrandsResponse> => {
   return apiRequest.get<BrandsResponse>("/brands/admin/all", { params });
};
