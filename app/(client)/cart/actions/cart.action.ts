// cart/actions/cart.action.ts
import apiRequest from "@/lib/api";
import { ApiCartData, ApiResponse, ApiResult } from "../types/cart.types";

// GET /cart
export async function getCartItems(): Promise<ApiResult> {
   try {
      const response = await apiRequest.get<ApiResponse<ApiCartData>>("/cart", {
         noRedirectOn401: true,
      });
      return { success: true, data: response.data };
   } catch (error: unknown) {
      const message =
         error instanceof Error ? error.message : "Lỗi không xác định";
      return { success: false, error: message };
   }
}

// POST /cart
export async function addToCart(
   productVariantId: string,
   quantity: number,
): Promise<ApiResult> {
   try {
      await apiRequest.post<ApiResponse<unknown>>("/cart", {
         productVariantId,
         quantity,
      });
      return { success: true };
   } catch (error: unknown) {
      const message =
         error instanceof Error ? error.message : "Lỗi không xác định";
      return { success: false, error: message };
   }
}

// PUT /cart/:cartItemId
export async function updateCartItemQuantity(
   cartItemId: string,
   quantity: number,
): Promise<ApiResult> {
   try {
      await apiRequest.put<ApiResponse<unknown>>(`/cart/${cartItemId}/change-quantity`, {
         quantity,
      });
      return { success: true };
   } catch (error: unknown) {
      const message =
         error instanceof Error ? error.message : "Lỗi không xác định";
      return { success: false, error: message };
   }
}

// DELETE /cart/:cartItemId
export async function removeCartItem(cartItemId: string): Promise<ApiResult> {
   try {
      await apiRequest.delete<ApiResponse<unknown>>(`/cart/${cartItemId}`);
      return { success: true };
   } catch (error: unknown) {
      const message =
         error instanceof Error ? error.message : "Lỗi không xác định";
      return { success: false, error: message };
   }
}

// Batch delete
export async function removeCartItems(
   cartItemIds: string[],
): Promise<ApiResult> {
   const results = await Promise.all(cartItemIds.map(removeCartItem));
   const failed = results.find((r) => !r.success);
   return failed ?? { success: true };
}

// DELETE /cart
export async function clearCart(): Promise<ApiResult> {
   try {
      await apiRequest.delete<ApiResponse<unknown>>("/cart");
      return { success: true };
   } catch (error: unknown) {
      const message =
         error instanceof Error ? error.message : "Lỗi không xác định";
      return { success: false, error: message };
   }
}

// POST /cart/sync
export async function syncGuestCart(
   items: Array<{
      productVariantId: string;
      quantity: number;
      addedAt?: number;
   }>,
): Promise<ApiResult> {
   try {
      await apiRequest.post<ApiResponse<unknown>>("/cart/sync", { items });
      return { success: true };
   } catch (error: unknown) {
      const message =
         error instanceof Error ? error.message : "Lỗi không xác định";
      return { success: false, error: message };
   }
}

// POST /cart/validate-item
export async function validateCartItem(
   productVariantId: string,
   quantity: number,
): Promise<ApiResult> {
   try {
      await apiRequest.post<ApiResponse<unknown>>("/cart/${cartItemId}/change-variant", {
         productVariantId,
         quantity,
      });
      return { success: true };
   } catch (error: unknown) {
      const message =
         error instanceof Error ? error.message : "Lỗi không xác định";
      return { success: false, error: message };
   }
}
