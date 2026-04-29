import apiRequest from "@/lib/api";
import type { BlogComment, BlogReply } from "../[slug]/blog-comment.types";

export async function getBlogComments(blogId: string) {
  return apiRequest.get<{
    data: BlogComment[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    message: string;
  }>("/comments", {
    noAuth: true,
    params: { targetType: "BLOG", targetId: blogId, limit: 50 },
  });
}

export async function getBlogReplies(commentId: string) {
  return apiRequest.get<{
    data: BlogReply[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    message: string;
  }>(`/comments/${commentId}/replies`, {
    noAuth: true,
  });
}

export async function postBlogComment(blogId: string, content: string, parentId?: string) {
  return apiRequest.post<{ data: { isApproved: boolean; status?: string } }>("/comments", {
    content,
    targetType: "BLOG",
    targetId: blogId,
    parentId,
  });
}
