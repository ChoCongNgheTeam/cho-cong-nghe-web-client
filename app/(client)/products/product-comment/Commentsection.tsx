"use client";
import { useEffect, useState, useCallback, useContext, useRef, memo } from "react";
import { AiOutlineLike } from "react-icons/ai";
import { ChevronDown, ChevronUp } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import type { Comment, Reply, CommentUser } from "./Productreview";
import { formatRelativeDate } from "@/helpers/formatRelativeDate";
import Image from "next/image";
import { AuthContext } from "@/contexts/AuthContext";
import { useToasty } from "@/components/Toast";

const PAGE_SIZE = 5;
const AVATAR_SIZES = [36, 32];

interface CommentSectionProps {
  productId: string;
  comments: Comment[];
  loading: boolean;
  onCommentSubmit: (content: string) => Promise<{ isApproved: boolean; status?: string } | undefined>;
  onReplySubmit: (parentId: string, content: string) => Promise<{ isApproved: boolean; status?: string } | undefined>;
  onFetchReplies: (commentId: string) => Promise<void>;
  onFetchNestedReplies: (replyId: string, parentCommentId: string) => Promise<void>;
}

// ── Sub-components ────────────────────────────────────────────────

function Avatar({ user, size }: { user: CommentUser; size: number }) {
  const validAvatar = user?.avatarImage && !user.avatarImage.startsWith("./") ? user.avatarImage : undefined;
  return <UserAvatar avatarImage={validAvatar} fullName={user?.fullName ?? ""} size={size} />;
}

function findTopLevelParent(comments: Comment[], replyId: string): string | undefined {
  return comments.find((c) => (c.replies ?? []).some((r) => r.id === replyId))?.id;
}

// ── CommentNode (Sử dụng memo để chống giật khi re-render) ────────
const CommentNode = memo(
  ({ node, depth, replyTargetId, replyContents, replySubmitting, expandedIds, loadingIds, onToggleExpand, onSetReplyTarget, onReplyContentChange, onSubmitReply, onKeyPress }: any) => {
    const avatarSize = AVATAR_SIZES[Math.min(depth, AVATAR_SIZES.length - 1)];
    const hasChildren = (node._repliesCount ?? node.replies?.length ?? 0) > 0;
    const isExpanded = expandedIds[node.id];
    const isLoading = loadingIds[node.id];
    const canReply = depth === 0;
    const isSubmittingReply = replySubmitting === node.id;

    return (
      <div className="flex gap-2 sm:gap-3">
        <Avatar user={node.user} size={avatarSize} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-xs sm:text-sm text-primary">{node.user?.fullName}</span>

            <span className="text-[11px] sm:text-xs text-neutral-darker">• {formatRelativeDate(node.createdAt)}</span>
          </div>

          <p className="text-neutral-darker mb-2 text-xs sm:text-sm wrap-break-word whitespace-pre-wrap">{node.content}</p>

          <div className="flex items-center gap-3 sm:gap-4 text-xs text-neutral-darker">
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <AiOutlineLike />
              <span>Thích</span>
            </button>

            {canReply && (
              <button onClick={() => onSetReplyTarget(replyTargetId === node.id ? null : node.id)} className="hover:text-primary transition-colors cursor-pointer">
                Trả lời
              </button>
            )}

            {canReply && hasChildren && (
              <button onClick={() => onToggleExpand(node.id, node)} disabled={isLoading} className="flex items-center gap-1 hover:text-primary transition-colors disabled:opacity-50 cursor-pointer">
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải...</span>
                  </>
                ) : (
                  <>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    <span>{node._repliesCount ?? node.replies?.length ?? 0} phản hồi</span>
                  </>
                )}
              </button>
            )}
          </div>

          {canReply && replyTargetId === node.id && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Nhập phản hồi..."
                value={replyContents[node.id] || ""}
                onChange={(e) => onReplyContentChange(node.id, e.target.value)}
                onKeyDown={(e) => onKeyPress(e, node.id)}
                maxLength={3000}
                autoFocus
                disabled={isSubmittingReply}
                className="flex-1 min-w-0 px-3 py-2 border border-neutral-dark rounded-lg text-xs sm:text-sm focus:outline-none focus:border-neutral-darker bg-neutral-light text-primary disabled:opacity-50"
              />
              <button
                onClick={() => onSubmitReply(node.id)}
                disabled={!replyContents[node.id]?.trim() || isSubmittingReply}
                className="shrink-0 px-3 sm:px-4 py-2 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isSubmittingReply ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  "Gửi"
                )}
              </button>
            </div>
          )}

          {depth === 0 && isExpanded && (node.replies?.length ?? 0) > 0 && (
            <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 pl-3 sm:pl-4 border-l-2 border-neutral">
              {node.replies!.map((child: any) => (
                <CommentNode
                  key={child.id}
                  node={child}
                  depth={1}
                  replyTargetId={replyTargetId}
                  replyContents={replyContents}
                  replySubmitting={replySubmitting}
                  expandedIds={expandedIds}
                  loadingIds={loadingIds}
                  onToggleExpand={onToggleExpand}
                  onSetReplyTarget={onSetReplyTarget}
                  onReplyContentChange={onReplyContentChange}
                  onSubmitReply={onSubmitReply}
                  onKeyPress={onKeyPress}
                />
              ))}
            </div>
          )}

          {depth === 0 && isSubmittingReply && (
            <div className="mt-3 pl-3 sm:pl-4 border-l-2 border-neutral flex items-center gap-2 text-xs text-neutral-darker">
              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Đang gửi phản hồi...</span>
            </div>
          )}
        </div>
      </div>
    );
  },
);
CommentNode.displayName = "CommentNode";

// ── Main ──────────────────────────────────────────────────────────
export default function CommentSection({ productId, comments: initialComments, loading, onCommentSubmit, onReplySubmit, onFetchReplies }: CommentSectionProps) {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const toast = useToasty();

  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [replySubmitting, setReplySubmitting] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const commentListRef = useRef<HTMLDivElement>(null);

  // Layout gốc của bạn sử dụng initialComments trực tiếp sẽ mượt hơn là sync qua useEffect
  const visibleComments = initialComments.slice(0, visibleCount);
  const hasMore = visibleCount < initialComments.length;
  const remaining = initialComments.length - visibleCount;

  const handleLoadMore = () => setVisibleCount((prev) => prev + PAGE_SIZE);

  const handleCollapse = () => {
    setVisibleCount(PAGE_SIZE);
    setTimeout(() => {
      commentListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      toast.warning("Vui lòng đăng nhập để đặt câu hỏi", {
        title: "Chưa đăng nhập",
        duration: 3000,
        showProgress: true,
      });
      return;
    }
    if (!comment.trim() || submitting) return;

    setSubmitting(true);
    try {
      // 1. Hứng kết quả trả về từ server
      const result: any = await onCommentSubmit(comment);
      setComment("");

      // 2. Kiểm tra logic duyệt
      if (result === false || result?.isApproved === false || result?.status === "pending") {
        toast.info("Bình luận của bạn đã được gửi và đang chờ quản trị viên phê duyệt.", {
          title: "Đang chờ duyệt",
          duration: 5000,
        });
      } else {
        toast.success("Câu hỏi của bạn đã được gửi thành công!", {
          title: "Gửi thành công",
          duration: 3000,
        });
      }
    } catch {
      toast.error("Gửi câu hỏi thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = useCallback(
    async (parentId: string) => {
      if (!isAuthenticated) {
        toast.warning("Vui lòng đăng nhập để trả lời");
        return;
      }

      const content = replyContents[parentId];
      if (!content?.trim() || replySubmitting === parentId) return;

      const isTopLevel = initialComments.some((c) => c.id === parentId);
      const actualParentId = isTopLevel ? parentId : (findTopLevelParent(initialComments, parentId) ?? parentId);

      setReplySubmitting(actualParentId);

      try {
        // 1. Hứng kết quả trả về từ file cha (ProductReview)
        const result: any = await onReplySubmit(actualParentId, content);

        setReplyContents((prev) => ({ ...prev, [parentId]: "" }));
        setReplyTargetId(null);
        setExpandedIds((prev) => ({ ...prev, [actualParentId]: true }));

        // 2. Logic kiểm tra để hiển thị Toast phù hợp
        if (result === false || result?.isApproved === false || result?.status === "pending") {
          toast.info("Phản hồi của bạn đã được gửi và đang chờ quản trị viên phê duyệt.", {
            title: "Đang chờ duyệt",
            duration: 5000,
          });
        } else {
          toast.success("Phản hồi của bạn đã được gửi thành công!", {
            title: "Thành công",
            duration: 3000,
          });
        }
      } catch {
        toast.error("Gửi phản hồi thất bại, vui lòng thử lại.");
      } finally {
        setReplySubmitting(null);
      }
    },
    [replyContents, replySubmitting, initialComments, onReplySubmit, isAuthenticated, toast],
  );

  const handleToggleExpand = useCallback(
    async (id: string, node: any) => {
      if (expandedIds[id]) {
        setExpandedIds((prev) => ({ ...prev, [id]: false }));
        return;
      }
      if (!node.replies || node.replies.length === 0) {
        setLoadingIds((prev) => ({ ...prev, [id]: true }));
        await onFetchReplies(id);
        setLoadingIds((prev) => ({ ...prev, [id]: false }));
      }
      setExpandedIds((prev) => ({ ...prev, [id]: true }));
    },
    [expandedIds, onFetchReplies],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, parentId: string) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmitReply(parentId);
      }
    },
    [handleSubmitReply],
  );

  return (
    <div ref={commentListRef}>
      <h4 className="text-lg sm:text-2xl font-semibold text-primary mb-6 sm:mb-8">Bình luận</h4>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 pb-6 border-b border-neutral">
        <div className="hidden xs:flex shrink-0 items-start justify-center sm:justify-start">
          <Image
            src="https://cdn2.cellphones.com.vn/insecure/rs:fill:160:0/q:90/plain/https://cellphones.com.vn/media/wysiwyg/ant-hello-2025.png"
            alt="Sản phẩm"
            width={100}
            height={100}
            className="sm:w-[120px] lg:w-[160px] h-auto object-contain"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-base sm:text-lg font-semibold text-primary mb-1 opacity-80">Hãy đặt câu hỏi cho chúng tôi</h4>
          <p className="text-xs sm:text-sm text-primary opacity-60 leading-relaxed">
            ChoCongNghe sẽ phản hồi trong vòng 1 giờ. Nếu Quý khách gửi câu hỏi sau 22h, chúng tôi sẽ trả lời vào sáng hôm sau.
          </p>

          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder={isAuthenticated ? "Viết câu hỏi của bạn tại đây..." : "Đăng nhập để đặt câu hỏi..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                disabled={submitting || !isAuthenticated}
                maxLength={3000}
                className="w-full px-3 py-2.5 border border-neutral-dark rounded-lg text-sm focus:outline-none focus:border-neutral-darker bg-neutral-light text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-darker pointer-events-none">{comment.length}/3000</span>
            </div>
            <button
              onClick={handleSubmitComment}
              disabled={!comment.trim() || submitting || !isAuthenticated}
              className="shrink-0 px-5 py-2.5 bg-neutral text-primary rounded-full text-xs sm:text-sm font-medium hover:bg-neutral-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                "Gửi bình luận"
              )}
            </button>
          </div>

          {!isAuthenticated && (
            <p className="text-xs text-neutral-darker mt-2">
              Bạn cần{" "}
              <a href="/account?login" className="text-primary underline hover:opacity-80 transition-opacity">
                đăng nhập
              </a>{" "}
              để đặt câu hỏi hoặc trả lời bình luận.
            </p>
          )}
        </div>
      </div>

      <h4 className="text-sm sm:text-base text-primary">Có {initialComments.length} bình luận</h4>

      <div className="space-y-5 sm:space-y-6 mt-5 sm:mt-6">
        {loading && initialComments.length === 0 ? (
          <div className="text-center py-8 text-neutral-darker">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="mt-2 text-sm">Đang tải bình luận...</p>
          </div>
        ) : initialComments.length === 0 ? (
          <div className="text-center py-8 text-neutral-darker">
            <p className="text-base sm:text-lg">Chưa có bình luận nào</p>
          </div>
        ) : (
          <>
            {visibleComments.map((c) => (
              <div key={c.id} className="pb-4 sm:pb-5 border-b border-neutral last:border-0">
                <CommentNode
                  node={c}
                  depth={0}
                  replyTargetId={replyTargetId}
                  replyContents={replyContents}
                  replySubmitting={replySubmitting}
                  expandedIds={expandedIds}
                  loadingIds={loadingIds}
                  onToggleExpand={handleToggleExpand}
                  onSetReplyTarget={setReplyTargetId}
                  onReplyContentChange={(id: string, val: string) => setReplyContents((prev) => ({ ...prev, [id]: val }))}
                  onSubmitReply={handleSubmitReply}
                  onKeyPress={handleKeyPress}
                />
              </div>
            ))}

            <div className="flex justify-center gap-2 sm:gap-3 pt-2">
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  className="flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 border border-neutral-dark rounded-full text-xs sm:text-sm text-primary hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Xem thêm {Math.min(remaining, PAGE_SIZE)} bình luận
                </button>
              )}
              {visibleCount > PAGE_SIZE && (
                <button
                  onClick={handleCollapse}
                  className="flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 border border-neutral-dark rounded-full text-xs sm:text-sm text-primary hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Thu gọn
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
