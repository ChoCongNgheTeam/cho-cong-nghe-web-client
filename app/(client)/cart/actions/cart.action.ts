// cart/actions/cart.action.ts
// Tên file khớp với file hiện có của bạn: cart.action.ts (không có 's')

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

interface ApiResult {
  success: boolean;
  data?: unknown;
  error?: string;
  warnings?: string[];
}

async function apiFetch(
  path: string,
  options?: RequestInit
): Promise<ApiResult> {
  try {
    const res = await fetch(`${API}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    const json = await res.json().catch(() => ({})) as Record<string, unknown>;
  // console.log(`[API] ${options?.method ?? "GET"} ${path}`, {
  //     status: res.status,
  //     ok: res.ok,
  //     response: json,
  //   });
    if (!res.ok) {
      return {
        success: false,
        error:
          (json?.message as string) ??
          (json?.error as string) ??
          `Lỗi ${res.status}`,
      };
    }

    return {
      success: true,
      data: json.data,
      warnings: json.warnings as string[] | undefined,
    };
  } catch {
    return { success: false, error: "Không thể kết nối server" };
  }
}

// GET /cart
export async function getCartItems(): Promise<ApiResult> {
  return apiFetch("/cart");
}

// POST /cart  – body: { productVariantId, quantity }
export async function addToCart(
  productVariantId: string,
  quantity: number
): Promise<ApiResult> {
  return apiFetch("/cart", {
    method: "POST",
    body: JSON.stringify({ productVariantId, quantity }),
  });
}

// PUT /cart/:cartItemId  – body: { quantity }
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<ApiResult> {
  return apiFetch(`/cart/${cartItemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

// DELETE /cart/:cartItemId
export async function removeCartItem(cartItemId: string): Promise<ApiResult> {
  return apiFetch(`/cart/${cartItemId}`, { method: "DELETE" });
}

// Batch delete – gọi tuần tự vì BE không có batch endpoint
export async function removeCartItems(
  cartItemIds: string[]
): Promise<ApiResult> {
  const results = await Promise.all(cartItemIds.map(removeCartItem));
  const failed = results.find((r) => !r.success);
  return failed ?? { success: true };
}

// DELETE /cart  – xóa toàn bộ
export async function clearCart(): Promise<ApiResult> {
  return apiFetch("/cart", { method: "DELETE" });
}

// POST /cart/sync  – đồng bộ localStorage → DB sau khi login
export async function syncGuestCart(
  items: Array<{ productVariantId: string; quantity: number; addedAt?: number }>
): Promise<ApiResult> {
  return apiFetch("/cart/sync", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

// POST /cart/validate-item  – check tồn kho cho guest
export async function validateCartItem(
  productVariantId: string,
  quantity: number
): Promise<ApiResult> {
  return apiFetch("/cart/validate-item", {
    method: "POST",
    body: JSON.stringify({ productVariantId, quantity }),
  });
}