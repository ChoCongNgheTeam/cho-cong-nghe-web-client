import apiRequest from "@/lib/api";
import { Comment, CommentsResponse, GetCommentsParams } from "../comment.types";
import { createResourceApi, type ResourceEnvelope } from "@/lib/admin/createResourceApi";

interface UpdateCommentPayload {
  content?: string;
  isApproved?: boolean;
}

const commentApi = createResourceApi<CommentsResponse, Comment, never, UpdateCommentPayload, GetCommentsParams>("/comments/admin");

export const getAllComments = commentApi.getAll;
export const getComment = (id: string) => commentApi.getOne(id);
export const updateComment = commentApi.update;
export const deleteComment = commentApi.remove;

export const approveComment = async (id: string, isApproved: boolean): Promise<ResourceEnvelope<Comment>> => {
  return apiRequest.patch<ResourceEnvelope<Comment>>(`/comments/admin/${id}/approve`, { isApproved });
};

export const bulkApproveComments = async (commentIds: string[], isApproved: boolean): Promise<{ message: string }> => {
  return apiRequest.patch<{ message: string }>("/comments/admin/bulk/approve", { commentIds, isApproved });
};

export const getCommentReplies = async (id: string): Promise<{ data: Comment[]; message: string }> => {
  return apiRequest.get<{ data: Comment[]; message: string }>(`/comments/${id}/replies`);
};

export const createCommentReply = async (parentId: string, payload: { content: string; targetId: string; targetType: string }): Promise<ResourceEnvelope<Comment>> => {
  return apiRequest.post<ResourceEnvelope<Comment>>("/comments", {
    content: payload.content,
    parentId,
    targetId: payload.targetId,
    targetType: payload.targetType,
  });
};
