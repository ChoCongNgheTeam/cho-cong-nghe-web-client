import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductCard from "../ProductCard";
import type { Product } from "../types";

// ProductCard gọi useRouter()/useAuth()/useWishlist() nội bộ — cần mock next/navigation
// vì RTL render() không tự cung cấp App Router context. Chỉ mock phần ProductCard THỰC
// SỰ dùng (router.push không được gọi trong các test này), không mock quá tay.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
}));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: false }) }));
vi.mock("@/hooks/useWishlist", () => ({ useWishlist: () => ({ likedIds: new Set(), toggleLiked: vi.fn() }) }));

/**
 * SECURITY/STABILITY REGRESSION: production đã crash thật với
 * `TypeError: Cannot read properties of undefined (reading 'toLocaleString')`
 * vì `product.price` tồn tại nhưng `product.price.final` là undefined/null cho
 * 1 số sản phẩm edge-case (BE trả thiếu field dù type ProductPrice khai báo bắt
 * buộc — type chỉ đúng lúc compile, không đảm bảo runtime). Test này ép dữ liệu
 * "sai type" y hệt tình huống thật xảy ra (dùng `as Product` để bypass compiler,
 * mô phỏng đúng những gì BE có thể trả), đảm bảo component KHÔNG crash nữa.
 */
const baseProduct = {
  id: "p1",
  name: "iPhone 15",
  priceOrigin: 20000000,
  slug: "iphone-15",
  thumbnail: "https://res.cloudinary.com/demo/image/upload/iphone.jpg",
  rating: { average: 4.5, count: 10 },
  inStock: true,
  price: { base: 20000000, final: 18000000, discountAmount: 2000000, discountPercentage: 10, hasPromotion: true },
} satisfies Product;

describe("ProductCard — price rendering resilience", () => {
  it("renders formatted price normally when price data is complete", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText(/18.000.000/)).toBeInTheDocument();
  });

  it("does not crash when price.final is undefined (malformed BE response) — shows fallback instead", () => {
    const malformed = {
      ...baseProduct,
      price: { ...baseProduct.price, final: undefined as unknown as number },
    } satisfies Product;

    expect(() => render(<ProductCard product={malformed} />)).not.toThrow();
    expect(screen.getByText("Liên hệ")).toBeInTheDocument();
  });

  it("does not crash when the whole price object is missing (malformed BE response)", () => {
    const malformed = { ...baseProduct, price: undefined as unknown as Product["price"] } satisfies Product;

    expect(() => render(<ProductCard product={malformed} />)).not.toThrow();
    expect(screen.getByText("Liên hệ")).toBeInTheDocument();
  });

  it("does not crash when price.base is undefined but not on promotion", () => {
    const malformed = {
      ...baseProduct,
      price: { ...baseProduct.price, hasPromotion: false, base: undefined as unknown as number },
    } satisfies Product;

    expect(() => render(<ProductCard product={malformed} />)).not.toThrow();
  });
});
