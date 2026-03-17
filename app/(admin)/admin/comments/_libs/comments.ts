import apiRequest from "@/lib/api";
import { Comment, CommentsResponse, GetCommentsParams } from "../comment.types";

interface GetCommentResponse {
  data: Comment;
  message: string;
}

interface MutateCommentResponse {
  data: Comment;
  message: string;
}

export const getAllComments = async (params?: GetCommentsParams): Promise<CommentsResponse> => {
  return apiRequest.get<CommentsResponse>("/comments/admin/all", { params });
};

export const getComment = async (id: string): Promise<GetCommentResponse> => {
  return apiRequest.get<GetCommentResponse>(`/comments/admin/${id}`);
};

export const updateComment = async (id: string, payload: { content?: string; isApproved?: boolean }): Promise<MutateCommentResponse> => {
  return apiRequest.patch<MutateCommentResponse>(`/comments/admin/${id}`, payload);
};

export const approveComment = async (id: string, isApproved: boolean): Promise<MutateCommentResponse> => {
  return apiRequest.patch<MutateCommentResponse>(`/comments/admin/${id}/approve`, { isApproved });
};

export const bulkApproveComments = async (commentIds: string[], isApproved: boolean): Promise<{ message: string }> => {
  return apiRequest.patch<{ message: string }>("/comments/admin/bulk/approve", { commentIds, isApproved });
};

export const deleteComment = async (id: string): Promise<void> => {
  await apiRequest.delete(`/comments/admin/${id}`);
};

export const getCommentReplies = async (id: string): Promise<{ data: Comment[]; message: string }> => {
  return apiRequest.get<{ data: Comment[]; message: string }>(`/comments/${id}/replies`);
};
