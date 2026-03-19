export type CommentTargetType = "BLOG" | "PRODUCT" | "PAGE";

export interface CommentUser {
  id: string;
  fullName?: string;
  email: string;
  avatarImage?: string;
}

export interface Comment {
  id: string;
  userId: string | null;
  content: string;
  targetType: CommentTargetType;
  targetId: string;
  parentId?: string;
  isApproved: boolean;
  createdAt: string;
  user: CommentUser | null;
  repliesCount?: number;
  deletedAt?: string;
  deletedBy?: string;
  replies?: Comment[];
}

export interface CommentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CommentsResponse {
  data: Comment[];
  pagination: CommentsPagination;
  message: string;
}

export interface GetCommentsParams {
  page?: number;
  limit?: number;
  targetType?: CommentTargetType;
  targetId?: string;
  isApproved?: boolean;
  parentId?: string | null;
  sortBy?: "createdAt";
  sortOrder?: "asc" | "desc";
  includeDeleted?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}
