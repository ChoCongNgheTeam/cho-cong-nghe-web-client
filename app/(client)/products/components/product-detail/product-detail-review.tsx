"use client";
import { AiOutlineLike } from "react-icons/ai";
import { useEffect, useState } from "react";
import { Star, Image, Video, ChevronDown, ChevronUp } from "lucide-react";

interface User {
  fullName: string;
  avatarImage?: string;
}

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  user: User;
  replies?: Reply[]; // ⭐ Nested replies
  _repliesCount?: number; // ⭐ Count nested replies
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

export default function ProductReview({ productId }: ProductReviewProps) {
  const [selectedRating, setSelectedRating] = useState("all");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyContents, setReplyContents] = useState<Record<string, string>>(
    {},
  );
  const [replySubmitting, setReplySubmitting] = useState<string | null>(null);

  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedComments, setExpandedComments] = useState<
    Record<string, boolean>
  >({});

  // ⭐ State mới cho nested replies
  const [loadingNestedReplies, setLoadingNestedReplies] = useState<
    Record<string, boolean>
  >({});
  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, boolean>
  >({});

  // Fetch comments from API
  const fetchComments = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/v1/comments?targetType=PRODUCT&targetId=${productId}`,
        {
          credentials: "include",
        },
      );
      const result = await res.json();

      if (result.success) {
        setComments(result.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy comment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch replies cho comment
  const fetchReplies = async (commentId: string) => {
    console.log("🔍 Fetching replies for comment ID:", commentId);
    try {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));

      const res = await fetch(
        `http://localhost:5000/api/v1/comments/${commentId}/replies`,
        {
          credentials: "include",
        },
      );
      const result = await res.json();

      if (result.success) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  replies: result.data,
                  _repliesCount: result.data.length,
                }
              : c,
          ),
        );
        setExpandedComments((prev) => ({ ...prev, [commentId]: true }));
      }
    } catch (error) {
      console.error("Lỗi khi lấy replies:", error);
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // ⭐ Fetch nested replies cho một reply cụ thể
  const fetchNestedReplies = async (
    replyId: string,
    parentCommentId: string,
  ) => {
    console.log("🔍 Fetching nested replies for reply ID:", replyId);
    try {
      setLoadingNestedReplies((prev) => ({ ...prev, [replyId]: true }));

      const res = await fetch(
        `http://localhost:5000/api/v1/comments/${replyId}/replies`,
        {
          credentials: "include",
        },
      );
      const result = await res.json();

      if (result.success) {
        // Update nested replies trong comment cha
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentCommentId
              ? {
                  ...c,
                  replies: c.replies?.map((r) =>
                    r.id === replyId
                      ? {
                          ...r,
                          replies: result.data,
                          _repliesCount: result.data.length,
                        }
                      : r,
                  ),
                }
              : c,
          ),
        );
        setExpandedReplies((prev) => ({ ...prev, [replyId]: true }));
      }
    } catch (error) {
      console.error("Lỗi khi lấy nested replies:", error);
    } finally {
      setLoadingNestedReplies((prev) => ({ ...prev, [replyId]: false }));
    }
  };

  // Toggle replies của comment
  const toggleReplies = async (commentId: string, hasReplies: boolean) => {
    if (expandedComments[commentId]) {
      setExpandedComments((prev) => ({ ...prev, [commentId]: false }));
      return;
    }

    if (!hasReplies) return;

    const comment = comments.find((c) => c.id === commentId);
    if (!comment?.replies || comment.replies.length === 0) {
      await fetchReplies(commentId);
    } else {
      setExpandedComments((prev) => ({ ...prev, [commentId]: true }));
    }
  };

  // ⭐ Toggle nested replies của một reply
  const toggleNestedReplies = async (
    replyId: string,
    parentCommentId: string,
    hasReplies: boolean,
  ) => {
    if (expandedReplies[replyId]) {
      setExpandedReplies((prev) => ({ ...prev, [replyId]: false }));
      return;
    }

    if (!hasReplies) return;

    const comment = comments.find((c) => c.id === parentCommentId);
    const reply = comment?.replies?.find((r) => r.id === replyId);

    if (!reply?.replies || reply.replies.length === 0) {
      await fetchNestedReplies(replyId, parentCommentId);
    } else {
      setExpandedReplies((prev) => ({ ...prev, [replyId]: true }));
    }
  };

  useEffect(() => {
    fetchComments();
  }, [productId]);

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

  const filterOptions = [
    { label: "Tất cả", value: "all" },
    { label: "5 ⭐", value: "5" },
    { label: "4 ⭐", value: "4" },
    { label: "3 ⭐", value: "3" },
    { label: "2 ⭐", value: "2" },
    { label: "1 ⭐", value: "1" },
  ];

  const getBarWidth = (count: number) => {
    const maxCount = Math.max(...ratingStats.breakdown.map((r) => r.count));
    return (count / maxCount) * 100;
  };

  const handleSubmitComment = async () => {
    if (!comment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const res = await fetch("http://localhost:5000/api/v1/comments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: comment,
          targetType: "PRODUCT",
          targetId: productId,
        }),
      });

      const result = await res.json();

      if (result.success) {
        await fetchComments();
        setComment("");
        alert("Bình luận của bạn đang chờ duyệt");
      } else {
        alert(result.message || "Có lỗi xảy ra khi gửi bình luận");
      }
    } catch (error) {
      console.error("Lỗi khi gửi comment:", error);
      alert("Có lỗi xảy ra khi gửi bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    const content = replyContents[parentId];
    if (!content?.trim() || replySubmitting === parentId) return;

    try {
      setReplySubmitting(parentId);
      const res = await fetch("http://localhost:5000/api/v1/comments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          targetType: "PRODUCT",
          targetId: productId,
          parentId: parentId,
        }),
      });

      const result = await res.json();

      if (result.success) {
        await fetchReplies(parentId);

        setReplyContents((prev) => ({
          ...prev,
          [parentId]: "",
        }));
        setReplyingId(null);

        alert("Phản hồi của bạn đang chờ duyệt");
      } else {
        alert(result.message || "Có lỗi xảy ra khi gửi phản hồi");
      }
    } catch (error) {
      console.error("Lỗi khi gửi reply:", error);
      alert("Có lỗi xảy ra khi gửi phản hồi");
    } finally {
      setReplySubmitting(null);
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    isReply: boolean,
    parentId?: string,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isReply && parentId) {
        handleSubmitReply(parentId);
      } else {
        handleSubmitComment();
      }
    }
  };

  return (
    <div className="container sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-neutral-light rounded-lg">
      <div>
        {/* Rating Summary Section - GIỮ NGUYÊN */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">
            Đánh giá và bình luận
          </h2>

          <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-12 mb-6">
            <div className="flex flex-col items-center w-full sm:w-auto">
              <div className="text-5xl sm:text-6xl font-bold mb-2 text-primary">
                {ratingStats.average}
              </div>
              <div className="flex gap-1 mb-2 flex-wrap justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 sm:w-5 sm:h-5 fill-accent text-accent"
                  />
                ))}
              </div>
              <div className="text-sm text-neutral-darker mb-3">
                {ratingStats.total} lượt đánh giá
              </div>
              <button className="px-6 py-2 bg-promotion text-white rounded-full font-medium hover:bg-promotion-hover text-sm sm:text-base">
                Đánh giá sản phẩm
              </button>
            </div>

            <div className="flex-1 w-full">
              {ratingStats.breakdown.map((rating) => (
                <div
                  key={rating.stars}
                  className="flex items-center gap-2 sm:gap-3 mb-2"
                >
                  <span className="text-xs sm:text-sm w-7 sm:w-8 text-neutral-darker">
                    {rating.stars} ⭐
                  </span>
                  <div className="flex-1 h-2 bg-neutral rounded-full overflow-hidden">
                    <div
                      className="h-full bg-promotion rounded-full transition-all duration-300"
                      style={{
                        width: `${getBarWidth(rating.count)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm text-neutral-darker w-6 sm:w-8 text-right">
                    {rating.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-neutral-dark pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h4 className="text-lg sm:text-xl font-semibold text-primary">
              {comments.length} Bình luận
            </h4>

            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedRating(option.value)}
                  className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm border whitespace-nowrap transition-colors ${
                    selectedRating === option.value
                      ? "border-promotion text-promotion bg-promotion/10"
                      : "border-neutral-dark text-neutral-darker hover:border-neutral-darker"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment Input */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập nội dung bình luận..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, false)}
                disabled={submitting}
                className="w-full px-3 sm:px-4 py-3 border border-neutral-dark rounded-lg pr-3 sm:pr-32 focus:outline-none focus:border-neutral-darker text-sm sm:text-base bg-neutral-light text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                maxLength={3000}
              />
              <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:absolute sm:right-3 sm:top-1/2 sm:-translate-y-1/2">
                <span className="text-xs text-neutral-darker">
                  {comment.length}/3000
                </span>
                <button
                  onClick={handleSubmitComment}
                  disabled={!comment.trim() || submitting}
                  className="px-4 sm:px-6 py-2 bg-primary text-white rounded-full text-xs sm:text-sm font-medium hover:bg-primary-hover ml-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Đang gửi..." : "Gửi bình luận"}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-accent">
              <Image className="w-3 h-3 sm:w-4 sm:h-4" />
              <Video className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Thêm tối đa 5 ảnh và 1 video</span>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8 text-neutral-darker">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2">Đang tải bình luận...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-neutral-darker">
                <p className="text-lg">Chưa có bình luận nào</p>
                <p className="text-sm mt-1">Hãy là người đầu tiên bình luận!</p>
              </div>
            ) : (
              comments.map((review) => {
                const hasReplies = review._repliesCount
                  ? review._repliesCount > 0
                  : review.replies && review.replies.length > 0;
                const isExpanded = expandedComments[review.id];
                const isLoadingReplies = loadingReplies[review.id];

                return (
                  <div
                    key={review.id}
                    className="border-b border-neutral-dark pb-5 last:border-b-0"
                  >
                    <div className="flex gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full overflow-hidden flex-shrink-0">
                        {review.user?.avatarImage ? (
                          <img
                            src={review.user.avatarImage}
                            alt={review.user.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm">
                            {review.user?.fullName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-sm text-primary">
                            {review.user?.fullName}
                          </span>
                          <span className="text-xs text-neutral-darker">
                            •{" "}
                            {new Date(review.createdAt).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>

                        <p className="text-neutral-darker mb-2 text-sm break-words whitespace-pre-wrap">
                          {review.content}
                        </p>

                        <div className="flex items-center gap-4 text-xs sm:text-sm text-neutral-darker">
                          <button className="flex items-center gap-1 hover:text-primary transition-colors">
                            <AiOutlineLike />
                            <span>Thích</span>
                          </button>

                          <button
                            onClick={() =>
                              setReplyingId(
                                replyingId === review.id ? null : review.id,
                              )
                            }
                            className="hover:text-primary transition-colors"
                          >
                            Trả lời
                          </button>

                          {hasReplies && (
                            <button
                              onClick={() =>
                                toggleReplies(review.id, hasReplies)
                              }
                              disabled={isLoadingReplies}
                              className="flex items-center gap-1 hover:text-primary transition-colors disabled:opacity-50"
                            >
                              {isLoadingReplies ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                  <span>Đang tải...</span>
                                </>
                              ) : (
                                <>
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                  <span>
                                    {review._repliesCount ||
                                      review.replies?.length ||
                                      0}{" "}
                                    phản hồi
                                  </span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {replyingId === review.id && (
                          <div className="mt-3 ml-2 border-l-2 border-neutral-dark pl-3 animate-fadeIn">
                            <div className="flex gap-2">
                              <input
                                autoFocus
                                type="text"
                                value={replyContents[review.id] || ""}
                                onChange={(e) =>
                                  setReplyContents((prev) => ({
                                    ...prev,
                                    [review.id]: e.target.value,
                                  }))
                                }
                                onKeyPress={(e) =>
                                  handleKeyPress(e, true, review.id)
                                }
                                placeholder="Nhập phản hồi..."
                                disabled={replySubmitting === review.id}
                                className="flex-1 border border-neutral-dark rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                maxLength={1000}
                              />

                              <button
                                onClick={() => handleSubmitReply(review.id)}
                                disabled={
                                  !replyContents[review.id]?.trim() ||
                                  replySubmitting === review.id
                                }
                                className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity whitespace-nowrap"
                              >
                                {replySubmitting === review.id
                                  ? "Đang gửi..."
                                  : "Gửi"}
                              </button>

                              <button
                                onClick={() => {
                                  setReplyingId(null);
                                  setReplyContents((prev) => ({
                                    ...prev,
                                    [review.id]: "",
                                  }));
                                }}
                                className="text-neutral-darker hover:text-primary px-2 text-sm transition-colors"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ⭐ Render Replies */}
                        {isExpanded &&
                          review.replies &&
                          review.replies.length > 0 && (
                            <div className="mt-4 space-y-4 border-l-2 border-neutral-dark pl-4 ml-2">
                              {review.replies.map((reply) => {
                                const hasNestedReplies = reply._repliesCount
                                  ? reply._repliesCount > 0
                                  : reply.replies && reply.replies.length > 0;
                                const isNestedExpanded =
                                  expandedReplies[reply.id];
                                const isLoadingNestedReplies =
                                  loadingNestedReplies[reply.id];

                                return (
                                  <div key={reply.id} className="flex gap-3">
                                    <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-full overflow-hidden flex-shrink-0">
                                      {reply.user?.avatarImage ? (
                                        <img
                                          src={reply.user.avatarImage}
                                          alt={reply.user.fullName}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold">
                                          {reply.user?.fullName
                                            ?.charAt(0)
                                            .toUpperCase()}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="font-semibold text-xs text-primary">
                                          {reply.user?.fullName}
                                        </span>
                                        <span className="text-xs text-neutral-darker">
                                          •{" "}
                                          {new Date(
                                            reply.createdAt,
                                          ).toLocaleDateString("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                          })}
                                        </span>
                                      </div>

                                      <p className="text-sm text-neutral-darker break-words whitespace-pre-wrap mb-2">
                                        {reply.content}
                                      </p>

                                      {/* ⭐ Action buttons cho reply */}
                                      <div className="flex items-center gap-3 text-xs text-neutral-darker">
                                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                          <AiOutlineLike className="w-3 h-3" />
                                          <span>Thích</span>
                                        </button>

                                        <button
                                          onClick={() =>
                                            setReplyingId(
                                              replyingId === reply.id
                                                ? null
                                                : reply.id,
                                            )
                                          }
                                          className="hover:text-primary transition-colors"
                                        >
                                          Trả lời
                                        </button>

                                        {/* ⭐ Button phản hồi cho reply */}
                                        {hasNestedReplies && (
                                          <button
                                            onClick={() =>
                                              toggleNestedReplies(
                                                reply.id,
                                                review.id,
                                                hasNestedReplies,
                                              )
                                            }
                                            disabled={isLoadingNestedReplies}
                                            className="flex items-center gap-1 hover:text-primary transition-colors disabled:opacity-50"
                                          >
                                            {isLoadingNestedReplies ? (
                                              <>
                                                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                <span>Đang tải...</span>
                                              </>
                                            ) : (
                                              <>
                                                {isNestedExpanded ? (
                                                  <ChevronUp className="w-3 h-3" />
                                                ) : (
                                                  <ChevronDown className="w-3 h-3" />
                                                )}
                                                <span>
                                                  {reply._repliesCount ||
                                                    reply.replies?.length ||
                                                    0}{" "}
                                                  phản hồi
                                                </span>
                                              </>
                                            )}
                                          </button>
                                        )}
                                      </div>

                                      {/* ⭐ Reply input cho reply */}
                                      {replyingId === reply.id && (
                                        <div className="mt-2 ml-2 border-l-2 border-neutral-dark pl-3">
                                          <div className="flex gap-2">
                                            <input
                                              autoFocus
                                              type="text"
                                              value={
                                                replyContents[reply.id] || ""
                                              }
                                              onChange={(e) =>
                                                setReplyContents((prev) => ({
                                                  ...prev,
                                                  [reply.id]: e.target.value,
                                                }))
                                              }
                                              onKeyPress={(e) =>
                                                handleKeyPress(
                                                  e,
                                                  true,
                                                  reply.id,
                                                )
                                              }
                                              placeholder="Nhập phản hồi..."
                                              disabled={
                                                replySubmitting === reply.id
                                              }
                                              className="flex-1 border border-neutral-dark rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                              maxLength={1000}
                                            />

                                            <button
                                              onClick={() =>
                                                handleSubmitReply(reply.id)
                                              }
                                              disabled={
                                                !replyContents[
                                                  reply.id
                                                ]?.trim() ||
                                                replySubmitting === reply.id
                                              }
                                              className="bg-primary text-white px-3 py-1.5 rounded-md text-xs hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity whitespace-nowrap"
                                            >
                                              {replySubmitting === reply.id
                                                ? "Gửi..."
                                                : "Gửi"}
                                            </button>

                                            <button
                                              onClick={() => {
                                                setReplyingId(null);
                                                setReplyContents((prev) => ({
                                                  ...prev,
                                                  [reply.id]: "",
                                                }));
                                              }}
                                              className="text-neutral-darker hover:text-primary px-1.5 text-xs transition-colors"
                                            >
                                              Hủy
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* ⭐ Render nested replies */}
                                      {isNestedExpanded &&
                                        reply.replies &&
                                        reply.replies.length > 0 && (
                                          <div className="mt-3 space-y-3 border-l-2 border-neutral-dark pl-3 ml-2">
                                            {reply.replies.map(
                                              (nestedReply) => (
                                                <div
                                                  key={nestedReply.id}
                                                  className="flex gap-2"
                                                >
                                                  <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full overflow-hidden flex-shrink-0">
                                                    {nestedReply.user
                                                      ?.avatarImage ? (
                                                      <img
                                                        src={
                                                          nestedReply.user
                                                            .avatarImage
                                                        }
                                                        alt={
                                                          nestedReply.user
                                                            .fullName
                                                        }
                                                        className="w-full h-full object-cover"
                                                      />
                                                    ) : (
                                                      <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold">
                                                        {nestedReply.user?.fullName
                                                          ?.charAt(0)
                                                          .toUpperCase()}
                                                      </div>
                                                    )}
                                                  </div>

                                                  <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                      <span className="font-semibold text-xs text-primary">
                                                        {
                                                          nestedReply.user
                                                            ?.fullName
                                                        }
                                                      </span>
                                                      <span className="text-xs text-neutral-darker">
                                                        •{" "}
                                                        {new Date(
                                                          nestedReply.createdAt,
                                                        ).toLocaleDateString(
                                                          "vi-VN",
                                                          {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                          },
                                                        )}
                                                      </span>
                                                    </div>

                                                    <p className="text-xs text-neutral-darker break-words whitespace-pre-wrap">
                                                      {nestedReply.content}
                                                    </p>
                                                  </div>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
