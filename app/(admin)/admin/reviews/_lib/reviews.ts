import apiRequest from "@/lib/api";
import { Review, ReviewsResponse, GetReviewsParams, ReviewStatus } from "../review.types";
import { createResourceApi, type ResourceEnvelope } from "@/lib/admin/createResourceApi";

const reviewApi = createResourceApi<ReviewsResponse, Review, never, never, GetReviewsParams>("/reviews/admin");

export const getAllReviews = reviewApi.getAll;
export const getReview = (id: string) => reviewApi.getOne(id);
export const deleteReview = reviewApi.remove;

export const approveReview = async (id: string, isApproved: ReviewStatus): Promise<ResourceEnvelope<Review>> => {
  return apiRequest.patch<ResourceEnvelope<Review>>(`/reviews/admin/${id}/approve`, { isApproved });
};

export const bulkApproveReviews = async (reviewIds: string[], isApproved: ReviewStatus): Promise<{ message: string }> => {
  return apiRequest.patch<{ message: string }>("/reviews/admin/bulk/approve", { reviewIds, isApproved });
};

export const bulkDeleteReviews = async (reviewIds: string[]): Promise<{ message: string }> => {
  return apiRequest.delete<{ message: string }>("/reviews/admin/bulk", { data: { reviewIds } });
};
