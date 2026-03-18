export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReviewUser {
  id: string;
  fullName?: string;
  avatarImage?: string;
}

export interface ReviewProduct {
  id: string;
  name: string;
  slug: string;
  img: Array<{
    id: string;
    color: string;
    imageUrl: string;
    altText?: string;
    position: number;
  }>;
}

export interface ReviewProductVariant {
  id: string;
  code: string;
  price: number;
  product: ReviewProduct;
}

export interface ReviewOrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  productVariant: ReviewProductVariant;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  isApproved: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser | null;
  orderItem: ReviewOrderItem;
  deletedAt?: string;
  deletedBy?: string;
}

export interface ReviewsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReviewsResponse {
  data: Review[];
  pagination: ReviewsPagination;
  message: string;
}

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  isApproved?: ReviewStatus;
  productId?: string;
  rating?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  includeDeleted?: boolean;
}
