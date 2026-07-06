"use client";

import { useEffect, useState, useCallback, startTransition } from "react";
import RatingSummary from "./RatingSummary";
import CommentSection from "./CommentSection";
import { getComments, getReplies, postComment } from "../../_lib";
import { ProductDetail } from "@/lib/types/product";
import type { ProductRating, MinimalVariant } from "../../types";
import { logError } from "@/lib/monitoring/log-error";

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
  rating: ProductRating;
  slug: string;
  product: ProductDetail;
  currentVariant?: MinimalVariant;
}

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

const ProductReview = ({ productId, rating, slug, product, currentVariant }: ProductReviewProps) => {
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
      logError("ProductReview: fetchComments failed", error, { productId });
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
      logError("ProductReview: fetchReplies failed", error, { commentId });
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
      logError("ProductReview: fetchNestedReplies failed", error, { replyId, parentCommentId });
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
    startTransition(() => {
      fetchComments();
    });
  }, [fetchComments]);

  return (
    <div>
      <div className="rounded-lg bg-neutral-light px-6 py-6 sm:py-4 lg:py-6">
        <RatingSummary rating={rating} slug={slug} product={product} currentVariant={currentVariant} />
      </div>
      <div className="mt-6 rounded-lg bg-neutral-light px-6 py-6 sm:py-4 lg:py-6">
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
};

export default ProductReview;
