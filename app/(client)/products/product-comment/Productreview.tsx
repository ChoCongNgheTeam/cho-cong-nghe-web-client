"use client";

import { useEffect, useState, useCallback } from "react";
import RatingSummary from "./Ratingsummary";
import CommentSection from "./Commentsection";
import { getComments, getReplies, postComment } from "../_lib";
import { ProductDetail } from "@/lib/types/product";

// ── Types ──────────────────────────────────────────────────────────────────

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
  parentId?: string;
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
  parentId?: string;
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
  currentVariant?: { name?: string; [key: string]: unknown };
}

// ── Helper ─────────────────────────────────────────────────────────────────

function buildTree(flatList: Comment[]): Comment[] {
  const map = new Map<string, Comment>();
  const roots: Comment[] = [];

  flatList.forEach((item) => {
    map.set(item.id, { ...item, replies: [], _repliesCount: 0 });
  });

  flatList.forEach((item) => {
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

// ── Component ──────────────────────────────────────────────────────────────

export default function ProductReview({ productId, rating, slug, product, currentVariant }: ProductReviewProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const result = await getComments("PRODUCT", productId);
      const relevant = (result?.data ?? []).filter((c) => c.targetId === productId);
      setComments(buildTree(relevant));
    } catch (error) {
      console.error("Lỗi khi lấy comment:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const fetchReplies = useCallback(async (commentId: string) => {
    try {
      const result = await getReplies(commentId);
      const replies = result?.data ?? [];
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, replies, _repliesCount: replies.length } : c)));
    } catch (error) {
      console.error("Lỗi khi lấy replies:", error);
    }
  }, []);

  const fetchNestedReplies = useCallback(async (replyId: string, parentCommentId: string) => {
    try {
      const result = await getReplies(replyId);
      const replies = result?.data ?? [];
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentCommentId
            ? {
                ...c,
                replies: c.replies?.map((r) => (r.id === replyId ? { ...r, replies, _repliesCount: replies.length } : r)),
              }
            : c,
        ),
      );
    } catch (error) {
      console.error("Lỗi khi lấy nested replies:", error);
    }
  }, []);

  const handleCommentSubmit = useCallback(
    async (content: string) => {
      const response = await postComment({ content, targetType: "PRODUCT", targetId: productId });
      await fetchComments();
      return response?.data;
    },
    [productId, fetchComments],
  );

  const handleReplySubmit = useCallback(
    async (parentId: string, content: string) => {
      const response = await postComment({
        content,
        targetType: "PRODUCT",
        targetId: productId,
        parentId,
      });
      await fetchReplies(parentId);
      return response?.data;
    },
    [productId, fetchReplies],
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <div>
      <div className="bg-neutral-light py-6 sm:py-4 lg:py-6 rounded-lg px-6">
        <RatingSummary rating={rating} slug={slug} product={product} currentVariant={currentVariant} />
      </div>
      <div className="bg-neutral-light py-6 sm:py-4 lg:py-6 rounded-lg px-6 mt-6">
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
