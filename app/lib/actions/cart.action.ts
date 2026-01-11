// app/lib/actions/cart.actions.ts
import { CartActionResponse } from "../types/cart.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/**
 * Get all cart items for the current user
 */
export async function getCartItems(): Promise<CartActionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to fetch cart items" };
    }

    const data = await response.json();
    return { success: true, data: data.items || data };
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return { success: false, error: "Failed to fetch cart items" };
  }
}

/**
 * Add item to cart or update quantity if already exists
 */
export async function addToCart(
  productVariantId: number,
  quantity: number = 1
): Promise<CartActionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        product_variant_id: productVariantId,
        quantity,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to add to cart" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, error: "Failed to add to cart" };
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number
): Promise<CartActionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to update cart item" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return { success: false, error: "Failed to update cart item" };
  }
}

/**
 * Remove single item from cart
 */
export async function removeCartItem(
  cartItemId: number
): Promise<CartActionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to remove cart item" };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error("Error removing cart item:", error);
    return { success: false, error: "Failed to remove cart item" };
  }
}

/**
 * Remove multiple items from cart
 */
export async function removeCartItems(
  cartItemIds: number[]
): Promise<CartActionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/batch`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ cart_item_ids: cartItemIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to remove cart items" };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error("Error removing cart items:", error);
    return { success: false, error: "Failed to remove cart items" };
  }
}

/**
 * Clear all cart items for user
 */
export async function clearCart(): Promise<CartActionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/clear`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to clear cart" };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}

/**
 * Get cart summary (total items, total price, etc.)
 */
export async function getCartSummary() {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to fetch cart summary" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching cart summary:", error);
    return { success: false, error: "Failed to fetch cart summary" };
  }
}

/**
 * Validate cart before checkout
 */
export async function validateCart() {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to validate cart" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error validating cart:", error);
    return { success: false, error: "Failed to validate cart" };
  }
}