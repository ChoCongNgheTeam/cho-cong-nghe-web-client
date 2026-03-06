// lấy chi tiết brand
import apiRequest from "@/lib/api";
import { Brand } from "../brand.types";

interface GetBrandResponse {
   data: Brand;
   message: string;
}

export const getBrand = async (id: string): Promise<GetBrandResponse> => {
   return apiRequest.get<GetBrandResponse>(`/brands/admin/${id}`);
};
