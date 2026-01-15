import { ProductDetail } from "@/lib/types/product";
const gAPI_URL = "http://localhost:5000/api/v1/";

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const res = await fetch(gAPI_URL + `products/slug/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch product by slug");
  }
  const response = await res.json();
  return response.data; // Lấy data từ response
}
