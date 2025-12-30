// app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getCartItems,
  addToCart,
  clearCart,
  getCartSummary,
} from "../../../../app/lib/actions/cart.actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isSummary = searchParams.get("summary") === "true";

    if (isSummary) {
      const result = await getCartSummary();
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: result.error === "Unauthorized" ? 401 : 500 }
        );
      }
      return NextResponse.json(result.data);
    }

    const result = await getCartItems();
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Unauthorized" ? 401 : 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_variant_id, quantity = 1 } = body;

    if (!product_variant_id) {
      return NextResponse.json(
        { error: "product_variant_id is required" },
        { status: 400 }
      );
    }

    const result = await addToCart(product_variant_id, quantity);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Unauthorized" ? 401 : 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const result = await clearCart();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Unauthorized" ? 401 : 500 }
      );
    }

    return NextResponse.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}