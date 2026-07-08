import { ApiResponse, ApiCartData, ApiResult } from "./cart.types";
import apiRequest from "@/lib/api";

export async function getCartItems(): Promise<ApiResult> {
  try {
    const response = await apiRequest.get<ApiResponse<ApiCartData>>("/cart", {
      noRedirectOn401: true,
    });
    return { success: true, data: response.data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return { success: false, error: message };
  }
}

export async function addToCart(productVariantId: string, quantity: number): Promise<ApiResult> {
  try {
    await apiRequest.post<ApiResponse<unknown>>("/cart", {
      productVariantId,
      quantity,
    });
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return { success: false, error: message };
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<ApiResult> {
  try {
    await apiRequest.put<ApiResponse<unknown>>(`/cart/${cartItemId}/change-quantity`, {
      quantity,
    });
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return { success: false, error: message };
  }
}

export async function removeCartItem(cartItemId: string): Promise<ApiResult> {
  try {
    await apiRequest.delete<ApiResponse<unknown>>(`/cart/${cartItemId}`);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return { success: false, error: message };
  }
}

export async function removeCartItems(cartItemIds: string[]): Promise<ApiResult & { failedIds?: string[] }> {
  const results = await Promise.allSettled(cartItemIds.map(removeCartItem));

  const failedIds = cartItemIds.filter((_, i) => {
    const r = results[i];
    return r.status === "rejected" || (r.status === "fulfilled" && !r.value.success);
  });

  if (failedIds.length === 0) return { success: true };
  return {
    success: false,
    error: `Không xóa được ${failedIds.length}/${cartItemIds.length} sản phẩm`,
    failedIds,
  };
}

export async function clearCart(): Promise<ApiResult> {
  try {
    await apiRequest.delete<ApiResponse<unknown>>("/cart");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return { success: false, error: message };
  }
}

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
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return { success: false, error: message };
  }
}
