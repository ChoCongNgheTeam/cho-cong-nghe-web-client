export type RecommendationAlgorithm = "VECTOR_SIMILAR" | "BOUGHT_TOGETHER" | "CATEGORY_MATCH" | "TRENDING" | "FALLBACK";

export type RecommendationSource = "HOME" | "DETAIL" | "SEARCH";

export interface ForYouResult {
  products: import("@/components/product/types").Product[];
  /** Map productId -> thuật toán đã gợi ý ra nó — dùng để track click đúng thuật toán (for-you trộn nhiều nguồn). */
  algorithmById: Record<string, RecommendationAlgorithm>;
}
