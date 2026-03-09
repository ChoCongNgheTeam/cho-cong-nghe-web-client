import apiRequest from "@/lib/api";
import { ProductDetail } from "@/lib/types/product";

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const response = await apiRequest.get<{ data: ProductDetail }>(
    `/products/slug/${slug}`,
    { noAuth: true }
  );
  return response.data;
}