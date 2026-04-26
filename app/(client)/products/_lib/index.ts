import apiRequest from "@/lib/api";
import { ProductDetail, SpecificationsData } from "@/lib/types/product";
import type { GalleryResponse, VariantResponse, RelatedProductsResponse } from "../types";

// ── Product ────────────────────────────────────────────────────────────────

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const response = await apiRequest.get<{ data: ProductDetail }>(`/products/slug/${slug}`, { noAuth: true });
  return response.data;
}

export async function getProductBySpecifications(slug: string): Promise<SpecificationsData> {
  const response = await apiRequest.get<{ data: SpecificationsData }>(`/products/slug/${slug}/specifications`, { noAuth: true });
  return response.data;
}

export async function getProductGallery(slug: string): Promise<GalleryResponse> {
  const response = await apiRequest.get<{ data: GalleryResponse }>(`/products/slug/${slug}/gallery`, { noAuth: true });
  return response.data;
}

export async function getProductVariant(slug: string, params: Record<string, string>): Promise<VariantResponse> {
  const response = await apiRequest.get<{ data: VariantResponse }>(`/products/slug/${slug}/variant`, { noAuth: true, params });
  return response.data;
}

export async function getRelatedProducts(slug: string): Promise<RelatedProductsResponse> {
  const response = await apiRequest.get<{ data: RelatedProductsResponse }>(`/products/slug/${slug}/related`, { noAuth: true });
  return response.data;
}

// ── Comments ───────────────────────────────────────────────────────────────

export interface PostCommentPayload {
  content: string;
  targetType: "PRODUCT" | "BLOG" | "PAGE";
  targetId: string;
  parentId?: string;
}

export async function getComments(targetType: "PRODUCT" | "BLOG" | "PAGE", targetId: string) {
  const response = await apiRequest.get<{
    data: import("../product-comment/Productreview").Comment[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    message: string;
  }>("/comments", {
    noAuth: true,
    params: { targetType, targetId, limit: 50 },
  });
  return response;
}

export async function getReplies(commentId: string) {
  const response = await apiRequest.get<{
    data: import("../product-comment/Productreview").Reply[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    message: string;
  }>(`/comments/${commentId}/replies`, {
    noAuth: true,
  });
  return response;
}

export async function postComment(payload: PostCommentPayload) {
  const response = await apiRequest.post<{ data: { isApproved: boolean; status?: string } }>("/comments", payload);
  return response;
}

// ── Rating / Review permission ─────────────────────────────────────────────

export async function getReviewPermission(slug: string): Promise<{
  canReview: boolean;
  orderItemId?: string;
  rating?: ProductDetail["rating"];
}> {
  const response = await apiRequest.get<{ data: ProductDetail }>(`/products/slug/${slug}`);
  const p = response.data;
  return {
    canReview: p.canReview,
    orderItemId: p.orderItemId ?? undefined,
    rating: p.rating,
  };
}
