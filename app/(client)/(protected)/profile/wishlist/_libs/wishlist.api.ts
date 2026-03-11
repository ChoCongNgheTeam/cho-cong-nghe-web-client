// _libs/wishlist.api.ts
import apiRequest from "@/lib/api";
import { WishlistResponse } from "../types/wishlist";

export interface GetWishlistParams {
   page?: number;
   limit?: number;
}

export async function getWishlist(
   params: GetWishlistParams = {},
): Promise<WishlistResponse> {
   return apiRequest.get<WishlistResponse>("/wishlist", {
      params: { page: params.page ?? 1, limit: params.limit ?? 10 },
   });
}

export async function addToWishlist(productId: string): Promise<void> {
   await apiRequest.post("/wishlist/add", { productId });
}

export async function removeFromWishlist(productId: string): Promise<void> {
   await apiRequest.delete("/wishlist/remove", { productId });
}

export async function checkWishlist(productId: string): Promise<boolean> {
   try {
      const res = await apiRequest.get<{ data: { isWishlisted: boolean } }>(
         `/wishlist/check/${productId}`,
      );
      return res.data?.isWishlisted ?? false;
   } catch {
      return false;
   }
}
