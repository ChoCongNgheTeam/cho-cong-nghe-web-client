import apiRequest, { getAccessToken } from "@/lib/api";
import { hasPersonalizationConsent } from "@/lib/cookie-consent";
import { getOrCreateAnonId } from "@/lib/anon-id";
import type { Product } from "@/components/product/types";
import type { RecommendationAlgorithm, RecommendationSource, ForYouResult } from "./types";

// ============================================================
// Module recommendation chỉ trả về ID (+ thuật toán) — KHÔNG tự tính giá/khuyến
// mãi/rating để tránh trùng lặp logic pricing đã có sẵn ở module product. FE
// dùng lại GET /products?ids=... (endpoint có sẵn, đã thêm filter `ids`) để lấy
// đầy đủ dữ liệu card đúng chuẩn ProductCard, rồi tự sắp lại theo đúng thứ tự
// gợi ý ban đầu (BE /products không đảm bảo giữ thứ tự ids truyền vào).
// ============================================================

interface RecommendedIdsResponse {
  data: { id: string; algorithm?: RecommendationAlgorithm }[];
  message: string;
}

interface ProductsByIdsResponse {
  data: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  message: string;
}

async function resolveProductCards(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  const res = await apiRequest.get<ProductsByIdsResponse>("/products", {
    params: { ids: ids.join(","), limit: ids.length },
    noAuth: true,
  });

  const byId = new Map(res.data.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);
}

/** "Sản phẩm tương tự" — trang chi tiết sản phẩm. */
export async function getSimilarProducts(productId: string, limit = 8): Promise<Product[]> {
  const res = await apiRequest.get<RecommendedIdsResponse>(`/recommendation/similar/${productId}`, { params: { limit } });
  return resolveProductCards(res.data.map((p) => p.id));
}

/** "Khách mua cùng" — trang chi tiết sản phẩm. */
export async function getBoughtTogetherProducts(productId: string, limit = 8): Promise<Product[]> {
  const res = await apiRequest.get<RecommendedIdsResponse>(`/recommendation/bought-together/${productId}`, { params: { limit } });
  return resolveProductCards(res.data.map((p) => p.id));
}

/**
 * "Có thể bạn thích" — trang chủ. Nếu khách chưa đăng nhập VÀ chưa đồng ý mục
 * cá nhân hoá trong cookie consent thì KHÔNG gửi sessionId — BE sẽ tự fallback
 * về gợi ý bán chạy chung (vẫn có nội dung hữu ích, chỉ là không cá nhân hoá).
 * Khách đã đăng nhập luôn được cá nhân hoá theo tài khoản (apiRequest tự đính
 * kèm Bearer token), không phụ thuộc cookie consent.
 */
export async function getForYouProducts(limit = 12): Promise<ForYouResult> {
  const sessionId = hasPersonalizationConsent() ? getOrCreateAnonId() : undefined;

  const res = await apiRequest.get<RecommendedIdsResponse>("/recommendation/for-you", { params: { limit, sessionId } });

  const ids = res.data.map((p) => p.id);
  const algorithmById: Record<string, RecommendationAlgorithm> = {};
  res.data.forEach((p) => {
    if (p.algorithm) algorithmById[p.id] = p.algorithm;
  });

  const products = await resolveProductCards(ids);
  return { products, algorithmById };
}

/**
 * "Đã xem gần đây" — widget sidebar trang chủ (dưới danh mục). Cùng quy tắc
 * cá nhân hoá như getForYouProducts: khách chưa đăng nhập + chưa đồng ý cookie
 * cá nhân hoá thì không gửi sessionId → BE trả về mảng rỗng (không có gì để
 * dựa vào) → component tự hiện banner fallback thay vào chỗ đó.
 */
export async function getRecentlyViewedProducts(limit = 4, excludeProductId?: string): Promise<Product[]> {
  const loggedIn = !!getAccessToken();
  const sessionId = !loggedIn && hasPersonalizationConsent() ? getOrCreateAnonId() : undefined;

  if (!loggedIn && !sessionId) return []; // guest chưa đồng ý cá nhân hoá — không có gì để tra, khỏi gọi BE

  const res = await apiRequest.get<RecommendedIdsResponse>("/recommendation/recently-viewed", { params: { limit, sessionId, excludeProductId } });
  return resolveProductCards(res.data.map((p) => p.id));
}

/**
 * Ghi nhận lượt xem sản phẩm — dùng làm tín hiệu cho "Có thể bạn thích".
 * - Khách ĐÃ đăng nhập: luôn ghi (đây là hoạt động gắn với tài khoản, không
 *   phải cookie tracking ẩn danh) — apiRequest tự đính Bearer token vì KHÔNG
 *   truyền noAuth, BE dùng req.user.id.
 * - Khách CHƯA đăng nhập: chỉ ghi nếu đã đồng ý mục "cá nhân hoá" trong cookie
 *   consent, dùng sessionId ẩn danh.
 */
export async function trackProductView(productId: string, source?: RecommendationSource): Promise<void> {
  const loggedIn = !!getAccessToken();
  if (!loggedIn && !hasPersonalizationConsent()) return;

  try {
    await apiRequest.post("/recommendation/view-event", { productId, sessionId: loggedIn ? undefined : getOrCreateAnonId(), source });
  } catch {
    // fire-and-forget — lỗi tracking không nên ảnh hưởng trải nghiệm xem sản phẩm
  }
}

/** Ghi nhận click vào 1 sản phẩm được gợi ý — dùng để tính CTR ở trang admin. Cùng quy tắc gate như trackProductView. */
export async function trackRecommendationClick(productId: string, algorithm: RecommendationAlgorithm): Promise<void> {
  const loggedIn = !!getAccessToken();
  if (!loggedIn && !hasPersonalizationConsent()) return;

  try {
    await apiRequest.post("/recommendation/click", { productId, algorithm });
  } catch {
    // fire-and-forget
  }
}

export type { RecommendationAlgorithm, RecommendationSource, ForYouResult } from "./types";
