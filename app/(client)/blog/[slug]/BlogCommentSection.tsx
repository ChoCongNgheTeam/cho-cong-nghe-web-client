"use client";

import { useState, useCallback, useContext, useRef, memo } from "react";
import { AiOutlineLike } from "react-icons/ai";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import UserAvatar from "@/components/ui/UserAvatar";
import { formatRelativeDate } from "@/helpers/formatRelativeDate";
import { AuthContext } from "@/contexts/AuthContext";
import { useToasty } from "@/components/Toast";
import type { BlogComment, BlogCommentUser, BlogReply } from "./blog-comment.types";

const PAGE_SIZE = 5;
const AVATAR_SIZES = [36, 32];

type SubmitResult = { isApproved: boolean; status?: string } | undefined;
type BlogCommentNodeData = BlogComment | BlogReply;

interface BlogCommentSectionProps {
  blogId: string;
  imageSrc: string;
  comments: BlogComment[];
  loading: boolean;
  onCommentSubmit: (content: string) => Promise<SubmitResult>;
  onReplySubmit: (parentId: string, content: string) => Promise<SubmitResult>;
  onFetchReplies: (commentId: string) => Promise<void>;
}

interface BlogCommentNodeProps {
  node: BlogCommentNodeData;
  depth: number;
  replyTargetId: string | null;
  replyContents: Record<string, string>;
  replySubmitting: string | null;
  expandedIds: Record<string, boolean>;
  loadingIds: Record<string, boolean>;
  onToggleExpand: (id: string, node: BlogCommentNodeData) => Promise<void>;
  onSetReplyTarget: (id: string | null) => void;
  onReplyContentChange: (id: string, value: string) => void;
  onSubmitReply: (id: string) => Promise<void>;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>, id: string) => void;
}

function Avatar({ user, size }: { user: BlogCommentUser; size: number }) {
  const validAvatar = user?.avatarImage && !user.avatarImage.startsWith("./") ? user.avatarImage : undefined;
  return <UserAvatar avatarImage={validAvatar} fullName={user?.fullName ?? ""} size={size} />;
}

const BlogCommentNode = memo(function BlogCommentNode({
  node,
  depth,
  replyTargetId,
  replyContents,
  replySubmitting,
  expandedIds,
  loadingIds,
  onToggleExpand,
  onSetReplyTarget,
  onReplyContentChange,
  onSubmitReply,
  onKeyPress,
}: BlogCommentNodeProps) {
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
        <div className="mb-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-semibold text-primary sm:text-sm">{node.user?.fullName}</span>
          <span className="text-[11px] text-neutral-darker sm:text-xs">• {formatRelativeDate(node.createdAt)}</span>
        </div>

        <p className="mb-2 whitespace-pre-wrap text-xs text-neutral-darker wrap-break-word sm:text-sm">{node.content}</p>

        <div className="flex items-center gap-3 text-xs text-neutral-darker sm:gap-4">
          <button className="flex items-center gap-1 transition-colors hover:text-primary">
            <AiOutlineLike />
            <span>Thích</span>
          </button>

          {canReply && (
            <button onClick={() => onSetReplyTarget(replyTargetId === node.id ? null : node.id)} className="cursor-pointer transition-colors hover:text-primary">
              Trả lời
            </button>
          )}

          {canReply && hasChildren && (
            <button onClick={() => onToggleExpand(node.id, node)} disabled={isLoading} className="flex cursor-pointer items-center gap-1 transition-colors hover:text-primary disabled:opacity-50">
              {isLoading ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
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
              placeholder="Viết phản hồi của bạn..."
              value={replyContents[node.id] || ""}
              onChange={(e) => onReplyContentChange(node.id, e.target.value)}
              onKeyDown={(e) => onKeyPress(e, node.id)}
              maxLength={3000}
              autoFocus
              disabled={isSubmittingReply}
              className="min-w-0 flex-1 rounded-lg border border-neutral-dark bg-neutral-light px-3 py-2 text-xs text-primary focus:border-neutral-darker focus:outline-none disabled:opacity-50 sm:text-sm"
            />
            <button
              onClick={() => onSubmitReply(node.id)}
              disabled={!replyContents[node.id]?.trim() || isSubmittingReply}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
            >
              {isSubmittingReply ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                "Gửi"
              )}
            </button>
          </div>
        )}

        {depth === 0 && isExpanded && (node.replies?.length ?? 0) > 0 && (
          <div className="mt-3 space-y-3 border-l-2 border-neutral pl-3 sm:mt-4 sm:space-y-4 sm:pl-4">
            {node.replies?.map((child) => (
              <BlogCommentNode
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
      </div>
    </div>
  );
});

BlogCommentNode.displayName = "BlogCommentNode";

export default function BlogCommentSection({ blogId, imageSrc, comments: initialComments, loading, onCommentSubmit, onReplySubmit, onFetchReplies }: BlogCommentSectionProps) {
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
      toast.warning("Vui lòng đăng nhập để tham gia thảo luận", {
        title: "Chưa đăng nhập",
        duration: 3000,
        showProgress: true,
      });
      return;
    }
    if (!comment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const result = await onCommentSubmit(comment);
      setComment("");

      if (result?.isApproved === false || result?.status === "pending") {
        toast.info("Bình luận của bạn đã được gửi và đang chờ kiểm duyệt.", {
          title: "Đang chờ duyệt",
          duration: 5000,
        });
      } else {
        toast.success("Bình luận của bạn đã được gửi thành công.", {
          title: "Gửi thành công",
          duration: 3000,
        });
      }
    } catch {
      toast.error("Gửi bình luận thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = useCallback(
    async (parentId: string) => {
      if (!isAuthenticated) {
        toast.warning("Vui lòng đăng nhập để tham gia thảo luận");
        return;
      }

      const content = replyContents[parentId];
      if (!content?.trim() || replySubmitting === parentId) return;

      setReplySubmitting(parentId);

      try {
        const result = await onReplySubmit(parentId, content);

        setReplyContents((prev) => ({ ...prev, [parentId]: "" }));
        setReplyTargetId(null);
        setExpandedIds((prev) => ({ ...prev, [parentId]: true }));

        if (result?.isApproved === false || result?.status === "pending") {
          toast.info("Phản hồi của bạn đã được gửi và đang chờ kiểm duyệt.", {
            title: "Đang chờ duyệt",
            duration: 5000,
          });
        } else {
          toast.success("Phản hồi của bạn đã được gửi thành công.", {
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
    [isAuthenticated, onReplySubmit, replyContents, replySubmitting, toast],
  );

  const handleToggleExpand = useCallback(
    async (id: string, node: BlogCommentNodeData) => {
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
        void handleSubmitReply(parentId);
      }
    },
    [handleSubmitReply],
  );

  return (
    <div ref={commentListRef} data-blog-id={blogId}>
      <h4 className="mb-6 text-lg font-semibold text-primary sm:mb-8 sm:text-2xl">Thảo luận</h4>

      <div className="mb-6 flex flex-col gap-4 border-b border-neutral pb-6 sm:flex-row sm:gap-6">
        <div className="hidden shrink-0 items-start justify-center xs:flex sm:justify-start">
          <Image src={imageSrc} alt="Bài viết" width={100} height={100} className="h-auto object-contain sm:w-[120px] lg:w-[160px]" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="mb-1 text-base font-semibold text-primary opacity-80 sm:text-lg">Chia sẻ ý kiến của bạn về bài viết này</h4>
          <p className="text-xs leading-relaxed text-primary opacity-60 sm:text-sm">
            Bình luận của bạn giúp cuộc thảo luận rõ hơn. Nội dung sẽ hiển thị sau khi được kiểm duyệt.
          </p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <input
                type="text"
                placeholder={isAuthenticated ? "Viết bình luận của bạn..." : "Đăng nhập để tham gia thảo luận..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleSubmitComment()}
                disabled={submitting || !isAuthenticated}
                maxLength={3000}
                className="w-full rounded-lg border border-neutral-dark bg-neutral-light px-3 py-2.5 text-sm text-primary focus:border-neutral-darker focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-darker">{comment.length}/3000</span>
            </div>
            <button
              onClick={() => void handleSubmitComment()}
              disabled={!comment.trim() || submitting || !isAuthenticated}
              className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-neutral px-5 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-neutral-hover disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              {submitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                "Gửi bình luận"
              )}
            </button>
          </div>

          {!isAuthenticated && (
            <p className="mt-2 text-xs text-neutral-darker">
              <a href="/account?login" className="text-primary underline transition-opacity hover:opacity-80">
                Đăng nhập
              </a>{" "}
              để tham gia thảo luận về bài viết này.
            </p>
          )}
        </div>
      </div>

      <h4 className="text-sm text-primary sm:text-base">Có {initialComments.length} bình luận</h4>

      <div className="mt-5 space-y-5 sm:mt-6 sm:space-y-6">
        {loading && initialComments.length === 0 ? (
          <div className="py-8 text-center text-neutral-darker">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-2 text-sm">Đang tải bình luận...</p>
          </div>
        ) : initialComments.length === 0 ? (
          <div className="py-8 text-center text-neutral-darker">
            <p className="text-base sm:text-lg">Chưa có bình luận nào cho bài viết này</p>
          </div>
        ) : (
          <>
            {visibleComments.map((item) => (
              <div key={item.id} className="border-b border-neutral pb-4 last:border-0 sm:pb-5">
                <BlogCommentNode
                  node={item}
                  depth={0}
                  replyTargetId={replyTargetId}
                  replyContents={replyContents}
                  replySubmitting={replySubmitting}
                  expandedIds={expandedIds}
                  loadingIds={loadingIds}
                  onToggleExpand={handleToggleExpand}
                  onSetReplyTarget={setReplyTargetId}
                  onReplyContentChange={(id, value) => setReplyContents((prev) => ({ ...prev, [id]: value }))}
                  onSubmitReply={handleSubmitReply}
                  onKeyPress={handleKeyPress}
                />
              </div>
            ))}

            <div className="flex justify-center gap-2 pt-2 sm:gap-3">
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-dark px-4 py-2 text-xs text-primary transition-all hover:border-primary hover:bg-primary/5 sm:px-6 sm:py-2.5 sm:text-sm"
                >
                  <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Xem thêm {Math.min(remaining, PAGE_SIZE)} bình luận
                </button>
              )}
              {visibleCount > PAGE_SIZE && (
                <button
                  onClick={handleCollapse}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-dark px-4 py-2 text-xs text-primary transition-all hover:border-primary hover:bg-primary/5 sm:px-6 sm:py-2.5 sm:text-sm"
                >
                  <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
