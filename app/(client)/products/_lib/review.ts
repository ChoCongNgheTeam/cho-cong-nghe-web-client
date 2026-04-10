import apiRequest from "@/lib/api";

export interface CommentUser {
  id: string;
  fullName: string;
  email?: string;
  avatarImage?: string;
}

export interface Reply {
  id: string;
  userId: string;
  content: string;
  targetType: string;
  targetId: string;
  isApproved: boolean;
  createdAt: string;
  user: CommentUser;
  replies?: Reply[];
  _repliesCount?: number;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  targetType: "PRODUCT" | "BLOG" | "PAGE";
  targetId: string;
  isApproved: boolean;
  createdAt: string;
  user: CommentUser;
  replies?: Reply[];
  _repliesCount?: number;
}

export interface CommentApiResponse {
  data: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

export interface ReplyApiResponse {
  data: Reply[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

export const reviewApi = {
  getComments: (productId: string) =>
    apiRequest.get<CommentApiResponse>("/comments", {
      params: {
        targetType: "PRODUCT",
        targetId: productId,
        limit: 50,
      },
    }),

  getReplies: (commentId: string) =>
    apiRequest.get<ReplyApiResponse>(`/comments/${commentId}/replies`),

  postComment: (productId: string, content: string) =>
    apiRequest.post<any>("/comments", {
      content,
      targetType: "PRODUCT",
      targetId: productId,
    }),

  postReply: (productId: string, parentId: string, content: string) =>
    apiRequest.post<any>("/comments", {
      content,
      targetType: "PRODUCT",
      targetId: productId,
      parentId,
    }),
};
