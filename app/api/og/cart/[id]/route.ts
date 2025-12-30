// app/api/cart/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  updateCartItemQuantity,
  removeCartItem,
} from "../../../../lib/actions/cart.actions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cartItemId = parseInt(params.id);
    if (isNaN(cartItemId)) {
      return NextResponse.json({ error: "Invalid cart item ID" }, { status: 400 });
    }

    const body = await request.json();
    const { quantity } = body;

    if (typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be a positive number" },
        { status: 400 }
      );
    }

    const result = await updateCartItemQuantity(cartItemId, quantity);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Unauthorized" ? 401 : 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("PATCH /api/cart/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cartItemId = parseInt(params.id);
    if (isNaN(cartItemId)) {
      return NextResponse.json({ error: "Invalid cart item ID" }, { status: 400 });
    }

    const result = await removeCartItem(cartItemId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Unauthorized" ? 401 : 500 }
      );
    }

    return NextResponse.json({ message: "Cart item removed successfully" });
  } catch (error) {
    console.error("DELETE /api/cart/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}