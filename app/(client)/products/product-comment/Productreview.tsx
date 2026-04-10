"use client";
import { useEffect, useState, useCallback } from "react";
import RatingSummary from "./Ratingsummary";
import CommentSection from "./Commentsection";
import { ProductDetail } from "@/lib/types/product";
import { reviewApi, Comment, Reply } from "../_lib/review";

// ── Types ──────────────────────────────────────────────────────────
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

// ── Helpers ────────────────────────────────────────────────────────
function buildTree(flatList: Comment[]): Comment[] {
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

// ── Component ──────────────────────────────────────────────────────
export default function ProductReview({
  productId,
  rating,
  slug,
  product,
  currentVariant,
}: ProductReviewProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch comments ─────────────────────────────────────────────
  const fetchComments = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const result = await reviewApi.getComments(productId);
      const relevant = (result?.data ?? []).filter(
        (c) => c.targetId === productId,
      );
      setComments(buildTree(relevant));
    } catch (error) {
      console.error("Lỗi khi lấy comment:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // ── Fetch replies ──────────────────────────────────────────────
  const fetchReplies = useCallback(async (commentId: string) => {
    try {
      const result = await reviewApi.getReplies(commentId);
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

  // ── Fetch nested replies ───────────────────────────────────────
  const fetchNestedReplies = useCallback(
    async (replyId: string, parentCommentId: string) => {
      try {
        const result = await reviewApi.getReplies(replyId);
        const replies = result?.data ?? [];
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentCommentId
              ? {
                  ...c,
                  replies: c.replies?.map((r) =>
                    r.id === replyId
                      ? { ...r, replies, _repliesCount: replies.length }
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

  // ── Submit comment ─────────────────────────────────────────────
  const handleCommentSubmit = useCallback(
    async (content: string) => {
      const response = await reviewApi.postComment(productId, content);
      await fetchComments();
      return response?.data || response;
    },
    [productId, fetchComments],
  );

  // ── Submit reply ───────────────────────────────────────────────
  const handleReplySubmit = useCallback(
    async (parentId: string, content: string) => {
      const response = await reviewApi.postReply(productId, parentId, content);
      await fetchReplies(parentId);
      return response?.data || response;
    },
    [productId, fetchReplies],
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <div>
      <div className="bg-neutral-light py-6 sm:py-4 lg:py-6 rounded-lg px-6">
        <RatingSummary
          rating={rating}
          slug={slug}
          product={product}
          currentVariant={currentVariant}
        />
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