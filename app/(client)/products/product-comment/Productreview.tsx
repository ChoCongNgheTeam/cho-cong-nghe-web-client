"use client";
import { useEffect, useState } from "react";
import RatingSummary from "./Ratingsummary";
import CommentSection from "./Commentsection";
import apiRequest from "@/lib/api";

interface User {
  fullName: string;
  avatarImage?: string;
}

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  user: User;
  replies?: Reply[];
  _repliesCount?: number;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
  replies?: Reply[];
  _repliesCount?: number;
}

interface ProductReviewProps {
  productId: string;
}

const ratingStats = {
  average: 4.7,
  total: 19,
  breakdown: [
    { stars: 5, count: 17 },
    { stars: 4, count: 10 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 1 },
  ],
};

export default function ProductReview({ productId }: ProductReviewProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const result = await apiRequest.get<{ success: boolean; data: Comment[] }>(
        `/comments`,
        { params: { targetType: "PRODUCT", targetId: productId } }
      );
      if (result.success) setComments(result.data);
    } catch (error) {
      console.error("Lỗi khi lấy comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (commentId: string) => {
    try {
      const result = await apiRequest.get<{ success: boolean; data: Reply[] }>(
        `/comments/${commentId}/replies`
      );
      if (result.success) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, replies: result.data, _repliesCount: result.data.length }
              : c,
          ),
        );
      }
    } catch (error) {
      console.error("Lỗi khi lấy replies:", error);
    }
  };

  const fetchNestedReplies = async (replyId: string, parentCommentId: string) => {
    try {
      const result = await apiRequest.get<{ success: boolean; data: Reply[] }>(
        `/comments/${replyId}/replies`
      );
      if (result.success) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentCommentId
              ? {
                  ...c,
                  replies: c.replies?.map((r) =>
                    r.id === replyId
                      ? { ...r, replies: result.data, _repliesCount: result.data.length }
                      : r,
                  ),
                }
              : c,
          ),
        );
      }
    } catch (error) {
      console.error("Lỗi khi lấy nested replies:", error);
    }
  };

  const handleCommentSubmit = async (content: string) => {
    try {
      const result = await apiRequest.post<{ success: boolean; message?: string }>(
        `/comments`,
        { content, targetType: "PRODUCT", targetId: productId }
      );
      if (result.success) {
        await fetchComments();
        alert("Bình luận của bạn đang chờ duyệt");
      } else {
        alert(result.message || "Có lỗi xảy ra khi gửi bình luận");
      }
    } catch (error: any) {
      alert(error?.message || "Có lỗi xảy ra khi gửi bình luận");
    }
  };

  const handleReplySubmit = async (parentId: string, content: string) => {
    try {
      const result = await apiRequest.post<{ success: boolean; message?: string }>(
        `/comments`,
        { content, targetType: "PRODUCT", targetId: productId, parentId }
      );
      if (result.success) {
        await fetchReplies(parentId);
        alert("Phản hồi của bạn đang chờ duyệt");
      } else {
        alert(result.message || "Có lỗi xảy ra khi gửi phản hồi");
      }
    } catch (error: any) {
      alert(error?.message || "Có lỗi xảy ra khi gửi phản hồi");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [productId]);

  return (
    <div className="container sm:px-6 lg:px-12 py-6 sm:py-4 lg:py-8 bg-neutral-light rounded-lg">
      <RatingSummary ratingStats={ratingStats} />
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
  );
}