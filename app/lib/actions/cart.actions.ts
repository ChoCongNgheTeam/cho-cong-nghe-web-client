// app/lib/actions/cart.actions.ts
"use server";

// import { prisma } from "@/lib/prisma";
// import { auth } from "../../lib/auth/server/auth.server";
import { revalidatePath } from "next/cache";
import { CartActionResponse } from "../types/cart.types";

/**
 * Get all cart items for the current user
 */
export async function getCartItems(): Promise<CartActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const cartItems = await prisma.cart_item.findMany({
      where: {
        user_id: session.user.id,
      },
      include: {
        product_variant: {
          include: {
            product: true,
            product_variant_images: {
              orderBy: { position: "asc" },
              take: 1,
            },
            variants_attributes: {
              include: {
                attributes_option: {
                  include: {
                    attributes: true,
                  },
                },
              },
            },
            inventory: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return { success: true, data: cartItems };
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
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate quantity
    if (quantity < 1) {
      return { success: false, error: "Quantity must be at least 1" };
    }

    // Get product variant with inventory
    const variant = await prisma.products_variants.findUnique({
      where: { id: productVariantId },
      include: {
        product: true,
        inventory: true,
      },
    });

    if (!variant) {
      return { success: false, error: "Product variant not found" };
    }

    // Check if product is active
    if (!variant.product.is_active) {
      return { success: false, error: "Product is not available" };
    }

    // Check inventory
    const availableQty =
      (variant.inventory?.quantity || 0) -
      (variant.inventory?.reserved_quantity || 0);

    if (availableQty < quantity) {
      return {
        success: false,
        error: `Only ${availableQty} items available in stock`,
      };
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cart_item.findFirst({
      where: {
        user_id: session.user.id,
        product_variant_id: productVariantId,
      },
    });

    let cartItem;

    if (existingItem) {
      // Check total quantity against inventory
      const newQuantity = existingItem.quantity + quantity;
      if (availableQty < newQuantity) {
        return {
          success: false,
          error: `Only ${availableQty} items available in stock`,
        };
      }

      // Update quantity
      cartItem = await prisma.cart_item.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cart_item.create({
        data: {
          user_id: session.user.id,
          product_variant_id: productVariantId,
          quantity,
          unit_price: variant.price,
          discount_value: 0,
        },
      });
    }

    revalidatePath("/cart");
    return { success: true, data: cartItem };
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
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (quantity < 1) {
      return { success: false, error: "Quantity must be at least 1" };
    }

    // Get cart item with product variant
    const cartItem = await prisma.cart_item.findUnique({
      where: {
        id: cartItemId,
      },
      include: {
        product_variant: {
          include: {
            inventory: true,
          },
        },
      },
    });

    if (!cartItem) {
      return { success: false, error: "Cart item not found" };
    }

    // Verify ownership
    if (cartItem.user_id !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check inventory
    const availableQty =
      (cartItem.product_variant.inventory?.quantity || 0) -
      (cartItem.product_variant.inventory?.reserved_quantity || 0);

    if (availableQty < quantity) {
      return {
        success: false,
        error: `Only ${availableQty} items available in stock`,
      };
    }

    // Update quantity
    const updatedItem = await prisma.cart_item.update({
      where: {
        id: cartItemId,
      },
      data: { quantity },
    });

    revalidatePath("/cart");
    return { success: true, data: updatedItem };
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
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.cart_item.delete({
      where: {
        id: cartItemId,
        user_id: session.user.id,
      },
    });

    revalidatePath("/cart");
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
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.cart_item.deleteMany({
      where: {
        id: { in: cartItemIds },
        user_id: session.user.id,
      },
    });

    revalidatePath("/cart");
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
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.cart_item.deleteMany({
      where: {
        user_id: session.user.id,
      },
    });

    revalidatePath("/cart");
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
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const cartItems = await prisma.cart_item.findMany({
      where: {
        user_id: session.user.id,
      },
      include: {
        product_variant: true,
      },
    });

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const totalDiscount = cartItems.reduce(
      (sum, item) => sum + item.discount_value * item.quantity,
      0
    );

    return {
      success: true,
      data: {
        totalItems,
        subtotal,
        totalDiscount,
        total: subtotal - totalDiscount,
        rewardPoints: Math.floor((subtotal - totalDiscount) / 4000),
      },
    };
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
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const cartItems = await prisma.cart_item.findMany({
      where: {
        user_id: session.user.id,
      },
      include: {
        product_variant: {
          include: {
            product: true,
            inventory: true,
          },
        },
      },
    });

    const errors: string[] = [];

    for (const item of cartItems) {
      // Check if product is active
      if (!item.product_variant.product.is_active) {
        errors.push(`${item.product_variant.product.name} is no longer available`);
        continue;
      }

      // Check inventory
      const availableQty =
        (item.product_variant.inventory?.quantity || 0) -
        (item.product_variant.inventory?.reserved_quantity || 0);

      if (availableQty < item.quantity) {
        errors.push(
          `Only ${availableQty} of ${item.product_variant.product.name} available`
        );
      }

      // Check if price changed
      if (item.unit_price !== item.product_variant.price) {
        // Update cart item with new price
        await prisma.cart_item.update({
          where: { id: item.id },
          data: { unit_price: item.product_variant.price },
        });
      }
    }

    if (errors.length > 0) {
      return { success: false, error: errors.join(", ") };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error("Error validating cart:", error);
    return { success: false, error: "Failed to validate cart" };
  }
}