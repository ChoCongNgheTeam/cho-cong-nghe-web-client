import apiRequest from "@/lib/api";
import { Review, ReviewsResponse, GetReviewsParams, ReviewStatus } from "../review.types";

interface GetReviewResponse {
  data: Review;
  message: string;
}

export const getAllReviews = async (params?: GetReviewsParams): Promise<ReviewsResponse> => {
  return apiRequest.get<ReviewsResponse>("/reviews/admin/all", { params });
};

export const getReview = async (id: string): Promise<GetReviewResponse> => {
  return apiRequest.get<GetReviewResponse>(`/reviews/admin/${id}`);
};

export const approveReview = async (id: string, isApproved: ReviewStatus): Promise<GetReviewResponse> => {
  return apiRequest.patch<GetReviewResponse>(`/reviews/admin/${id}/approve`, { isApproved });
};

export const bulkApproveReviews = async (reviewIds: string[], isApproved: ReviewStatus): Promise<{ message: string }> => {
  return apiRequest.patch<{ message: string }>("/reviews/admin/bulk/approve", { reviewIds, isApproved });
};

export const deleteReview = async (id: string): Promise<void> => {
  await apiRequest.delete(`/reviews/admin/${id}`);
};

export const bulkDeleteReviews = async (reviewIds: string[]): Promise<{ message: string }> => {
  return apiRequest.delete<{ message: string }>("/reviews/admin/bulk", { data: { reviewIds } });
};
