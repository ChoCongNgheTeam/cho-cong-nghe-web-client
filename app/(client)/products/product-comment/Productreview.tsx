"use client";
import { useEffect, useState, useCallback } from "react";
import RatingSummary from "./Ratingsummary";
import CommentSection from "./Commentsection";
import apiRequest from "@/lib/api";
import { ProductDetail } from "@/lib/types/product";

// ── Types ──────────────────────────────────────────────────────────
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

interface CommentApiResponse {
  data: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

interface ReplyApiResponse {
  data: Reply[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

interface ProductReviewProps {
  productId: string;
  rating: {
    average: number;
    total: number;
    distribution: Record<string, number>;
  };
  slug: string;
  product: ProductDetail;
  currentVariant?: { name?: string; [key: string]: any };
}

// ── Component ─────────────────────────────────────────────────────
export default function ProductReview({
  productId,
  rating,
  slug,
  product,
  currentVariant
}: ProductReviewProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const result = await apiRequest.get<CommentApiResponse>("/comments", {
        params: { targetType: "PRODUCT", targetId: productId, limit: 50 },
      });

      const filtered = (result?.data ?? []).filter(
        (c) => c.targetId === productId && c.isApproved,
      );

      const tree = buildTree(filtered);
      setComments(tree);
    } catch (error) {
      console.error("Lỗi khi lấy comment:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Fetch replies for a top-level comment
  const fetchReplies = useCallback(async (commentId: string) => {
    try {
      const result = await apiRequest.get<ReplyApiResponse>(
        `/comments/${commentId}/replies`,
      );
      const replies = result?.data ?? [];
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, replies, _repliesCount: replies.length }
            : c,
        ),
      );
    } catch (error) {
      console.error("Lỗi khi lấy replies:", error);
    }
  }, []);

  // Fetch nested replies (reply của reply)
  const fetchNestedReplies = useCallback(
    async (replyId: string, parentCommentId: string) => {
      try {
        const result = await apiRequest.get<ReplyApiResponse>(
          `/comments/${replyId}/replies`,
        );
        const replies = result?.data ?? [];
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentCommentId
              ? {
                  ...c,
                  replies: c.replies?.map((r) =>
                    r.id === replyId
                      ? {
                          ...r,
                          replies,
                          _repliesCount: replies.length,
                        }
                      : r,
                  ),
                }
              : c,
          ),
        );
      } catch (error) {
        console.error("Lỗi khi lấy nested replies:", error);
      }
    },
    [],
  );
  const handleCommentSubmit = useCallback(
    async (content: string) => {
      await apiRequest.post("/comments", {
        content,
        targetType: "PRODUCT",
        targetId: productId,
      });
      await fetchComments();
    },
    [productId, fetchComments],
  );

  // Submit reply (có parentId)
  const handleReplySubmit = useCallback(
    async (parentId: string, content: string) => {
      await apiRequest.post("/comments", {
        content,
        targetType: "PRODUCT",
        targetId: productId,
        parentId,
      });
      await fetchReplies(parentId);
    },
    [productId, fetchReplies],
  );

  function buildTree(flatList: Comment[]): Comment[] {
    // Thêm parentId vào type để dùng được
    type RawItem = Comment & { parentId?: string };
    const raw = flatList as RawItem[];

    const map = new Map<string, RawItem>();
    const roots: RawItem[] = [];

    raw.forEach((item) => {
      map.set(item.id, { ...item, replies: [], _repliesCount: 0 });
    });

    raw.forEach((item) => {
      const node = map.get(item.id)!;
      if (item.parentId && map.has(item.parentId)) {
        const parent = map.get(item.parentId)!;
        parent.replies = [...(parent.replies ?? []), node];
        parent._repliesCount = (parent._repliesCount ?? 0) + 1;
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <div className=" ">
      <div className="bg-neutral-light   py-6 sm:py-4 lg:py-6 rounded-lg px-6">
        <RatingSummary rating={rating} slug={slug} product = {product} currentVariant={currentVariant}/>
      </div>
      <div className="bg-neutral-light   py-6 sm:py-4 lg:py-6 rounded-lg px-6 mt-6">
        <CommentSection
          productId={productId}
          comments={comments}
          loading={loading}
          onCommentSubmit={handleCommentSubmit}
          onReplySubmit={handleReplySubmit}
          onFetchReplies={fetchReplies}
          onFetchNestedReplies={fetchNestedReplies}
        />
      </div>
    </div>
  );
}
