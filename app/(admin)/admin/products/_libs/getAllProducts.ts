// _libs/getAllProduct.ts

import apiRequest from "@/lib/api";
import { GetAllProductParams, GetAllProductResponse } from "../product.types";

export async function getAllProduct(
   params: GetAllProductParams = {},
): Promise<GetAllProductResponse> {
   const { page = 1, limit = 12, ...rest } = params;

   return apiRequest.get<GetAllProductResponse>("/products/admin/all", {
      params: {
         page,
         limit,
         ...rest,
      },
   });
}
