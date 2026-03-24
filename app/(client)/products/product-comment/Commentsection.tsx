"use client";
import { useEffect, useState, useCallback, useContext, useRef } from "react";
import { AiOutlineLike } from "react-icons/ai";
import { ChevronDown, ChevronUp } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import type { Comment, Reply, CommentUser } from "./Productreview";
import { formatRelativeDate } from "@/helpers/formatRelativeDate";
import Image from "next/image";
import { AuthContext } from "@/contexts/AuthContext";
import { useToasty } from "@/components/Toast";

const PAGE_SIZE = 5;

interface CommentSectionProps {
  productId: string;
  comments: Comment[];
  loading: boolean;
  onCommentSubmit: (content: string) => Promise<void>;
  onReplySubmit: (parentId: string, content: string) => Promise<void>;
  onFetchReplies: (commentId: string) => Promise<void>;
  onFetchNestedReplies: (
    replyId: string,
    parentCommentId: string,
  ) => Promise<void>;
}

const filterOptions = [
  { label: "Tất cả", value: "all" },
  { label: "5 ⭐", value: "5" },
  { label: "4 ⭐", value: "4" },
  { label: "3 ⭐", value: "3" },
  { label: "2 ⭐", value: "2" },
  { label: "1 ⭐", value: "1" },
];

const AVATAR_SIZES = [36, 32, 28];
const MAX_DEPTH = 2;

function Avatar({ user, size }: { user: CommentUser; size: number }) {
  const validAvatar =
    user?.avatarImage && !user.avatarImage.startsWith("./")
      ? user.avatarImage
      : undefined;
  return (
    <UserAvatar
      avatarImage={validAvatar}
      fullName={user?.fullName ?? ""}
      size={size}
    />
  );
}

function insertReplyRecursive(
  nodes: Reply[],
  parentId: string,
  newReply: Reply,
): Reply[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        replies: [...(node.replies ?? []), newReply],
        _repliesCount: (node._repliesCount ?? 0) + 1,
      };
    }
    if (node.replies?.length) {
      return {
        ...node,
        replies: insertReplyRecursive(node.replies, parentId, newReply),
      };
    }
    return node;
  });
}

function removeNodeRecursive(nodes: Reply[], targetId: string): Reply[] {
  return nodes
    .filter((n) => n.id !== targetId)
    .map((n) => ({
      ...n,
      replies: n.replies ? removeNodeRecursive(n.replies, targetId) : [],
    }));
}

function findTopLevelParent(
  comments: Comment[],
  replyId: string,
): string | undefined {
  function searchInReplies(replies: Reply[]): boolean {
    return replies.some(
      (r) => r.id === replyId || searchInReplies(r.replies ?? []),
    );
  }
  return comments.find((c) => searchInReplies(c.replies ?? []))?.id;
}

// ── CommentNode ───────────────────────────────────────────────────

interface CommentNodeProps {
  node: Reply | Comment;
  depth: number;
  replyTargetId: string | null;
  replyContents: Record<string, string>;
  replySubmitting: string | null;
  expandedIds: Record<string, boolean>;
  loadingIds: Record<string, boolean>;
  onToggleExpand: (id: string, node: Reply | Comment) => void;
  onSetReplyTarget: (id: string | null) => void;
  onReplyContentChange: (id: string, val: string) => void;
  onSubmitReply: (parentId: string) => void;
  onKeyPress: (
    e: React.KeyboardEvent<HTMLInputElement>,
    parentId: string,
  ) => void;
}

function CommentNode({
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
}: CommentNodeProps) {
  const avatarSize = AVATAR_SIZES[Math.min(depth, AVATAR_SIZES.length - 1)];
  const hasChildren = (node._repliesCount ?? node.replies?.length ?? 0) > 0;
  const isExpanded = expandedIds[node.id];
  const isLoading = loadingIds[node.id];

  return (
    <div className="flex gap-2 sm:gap-3">
      <Avatar user={node.user} size={avatarSize} />
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-xs sm:text-sm text-primary">
            {node.user?.fullName}
          </span>
          <span className="text-[11px] sm:text-xs text-neutral-darker">
            • {formatRelativeDate(node.createdAt)}
          </span>
        </div>

        {/* Content */}
        <p className="text-neutral-darker mb-2 text-xs sm:text-sm wrap-break-word whitespace-pre-wrap">
          {node.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs text-neutral-darker">
          <button className="flex items-center gap-1 hover:text-primary transition-colors">
            <AiOutlineLike />
            <span>Thích</span>
          </button>

          <button
            onClick={() =>
              onSetReplyTarget(replyTargetId === node.id ? null : node.id)
            }
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Trả lời
          </button>

          {hasChildren && (
            <button
              onClick={() => onToggleExpand(node.id, node)}
              disabled={isLoading}
              className="flex items-center gap-1 hover:text-primary transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  <span>
                    {node._repliesCount ?? node.replies?.length ?? 0} phản hồi
                  </span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Reply input */}
        {replyTargetId === node.id && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Nhập phản hồi..."
              value={replyContents[node.id] || ""}
              onChange={(e) => onReplyContentChange(node.id, e.target.value)}
              onKeyPress={(e) => onKeyPress(e, node.id)}
              maxLength={3000}
              autoFocus
              className="flex-1 min-w-0 px-3 py-2 border border-neutral-dark rounded-lg text-xs sm:text-sm focus:outline-none focus:border-neutral-darker bg-neutral-light text-primary"
            />
            <button
              onClick={() => onSubmitReply(node.id)}
              disabled={
                !replyContents[node.id]?.trim() || replySubmitting === node.id
              }
              className="shrink-0 px-3 sm:px-4 py-2 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {replySubmitting === node.id ? "Đang gửi..." : "Gửi"}
            </button>
          </div>
        )}

        {/* Children */}
        {isExpanded && (node.replies?.length ?? 0) > 0 && (
          <div
            className={`mt-3 sm:mt-4 space-y-3 sm:space-y-4 ${
              depth < MAX_DEPTH ? "pl-3 sm:pl-4 border-l-2 border-neutral" : ""
            }`}
          >
            {node.replies!.map((child) => (
              <CommentNode
                key={child.id}
                node={child}
                depth={Math.min(depth + 1, MAX_DEPTH)}
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
}

// ── Main ──────────────────────────────────────────────────────────
export default function CommentSection({
  productId,
  comments: initialComments,
  loading,
  onCommentSubmit,
  onReplySubmit,
  onFetchReplies,
  onFetchNestedReplies,
}: CommentSectionProps) {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const toast = useToasty();

  const [selectedRating, setSelectedRating] = useState("all");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyContents, setReplyContents] = useState<Record<string, string>>(
    {},
  );
  const [replySubmitting, setReplySubmitting] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [localComments, setLocalComments] =
    useState<Comment[]>(initialComments);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const commentListRef = useRef<HTMLDivElement>(null);

  const handleCollapse = () => {
    setVisibleCount(PAGE_SIZE);
    setTimeout(() => {
      commentListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedRating]);

  useEffect(() => {
    setLocalComments((prev) => {
      const optimisticNodes = prev.filter((c) =>
        c.id.startsWith("optimistic-"),
      );
      const merged = [...initialComments];
      optimisticNodes.forEach((opt) => {
        if (!merged.find((c) => c.id === opt.id)) merged.unshift(opt);
      });
      return merged;
    });
  }, [initialComments]);

  const filteredComments = localComments;
  const visibleComments = filteredComments.slice(0, visibleCount);
  const hasMore = visibleCount < filteredComments.length;
  const remaining = filteredComments.length - visibleCount;

  const handleLoadMore = () => setVisibleCount((prev) => prev + PAGE_SIZE);

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

    const content = comment;
    setComment("");
    setSubmitting(true);

    const optimisticId = `optimistic-${Date.now()}`;
    const optimistic: Comment = {
      id: optimisticId,
      userId: "",
      content,
      targetType: "PRODUCT",
      targetId: productId,
      isApproved: true,
      createdAt: new Date().toISOString(),
      user: { id: "", fullName: "Bạn", avatarImage: undefined },
      replies: [],
      _repliesCount: 0,
    };

    setLocalComments((prev) => [optimistic, ...prev]);
    setVisibleCount((prev) => Math.max(prev, PAGE_SIZE));

    try {
      await onCommentSubmit(content);
      toast.success("Câu hỏi của bạn đã được gửi thành công!", {
        title: "Gửi thành công",
        duration: 3000,
        showProgress: true,
      });
    } catch {
      setLocalComments((prev) => prev.filter((c) => c.id !== optimisticId));
      toast.error("Gửi câu hỏi thất bại, vui lòng thử lại.", {
        title: "Lỗi",
        duration: 3000,
        showProgress: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = useCallback(
    async (parentId: string) => {
      if (!isAuthenticated) {
        toast.warning("Vui lòng đăng nhập để trả lời", {
          title: "Chưa đăng nhập",
          duration: 3000,
          showProgress: true,
        });
        return;
      }

      const content = replyContents[parentId];
      if (!content?.trim() || replySubmitting === parentId) return;

      setReplyContents((prev) => ({ ...prev, [parentId]: "" }));
      setReplyTargetId(null);
      setReplySubmitting(parentId);

      const optimisticId = `optimistic-${Date.now()}`;
      const optimistic: Reply = {
        id: optimisticId,
        userId: "",
        content,
        targetType: "PRODUCT",
        targetId: productId,
        isApproved: true,
        createdAt: new Date().toISOString(),
        user: { id: "", fullName: "Bạn", avatarImage: undefined },
        replies: [],
        _repliesCount: 0,
      } as any;

      setLocalComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies ?? []), optimistic],
              _repliesCount: (c._repliesCount ?? 0) + 1,
            };
          }
          return {
            ...c,
            replies: insertReplyRecursive(
              c.replies ?? [],
              parentId,
              optimistic,
            ),
          };
        }),
      );

      setExpandedIds((prev) => ({ ...prev, [parentId]: true }));

      try {
        await onReplySubmit(parentId, content);
        toast.success("Phản hồi của bạn đã được gửi!", {
          title: "Gửi thành công",
          duration: 3000,
          showProgress: true,
        });
      } catch {
        setLocalComments((prev) =>
          prev.map((c) => ({
            ...c,
            replies: removeNodeRecursive(c.replies ?? [], optimisticId),
          })),
        );
        toast.error("Gửi phản hồi thất bại, vui lòng thử lại.", {
          title: "Lỗi",
          duration: 3000,
          showProgress: true,
        });
      } finally {
        setReplySubmitting(null);
      }
    },
    [
      replyContents,
      replySubmitting,
      productId,
      onReplySubmit,
      isAuthenticated,
      toast,
    ],
  );

  const handleToggleExpand = useCallback(
    async (id: string, node: Reply | Comment) => {
      if (expandedIds[id]) {
        setExpandedIds((prev) => ({ ...prev, [id]: false }));
        return;
      }
      if (!node.replies || node.replies.length === 0) {
        setLoadingIds((prev) => ({ ...prev, [id]: true }));
        const isTopLevel = localComments.some((c) => c.id === id);
        if (isTopLevel) {
          await onFetchReplies(id);
        } else {
          const parentId = findTopLevelParent(localComments, id);
          if (parentId) await onFetchNestedReplies(id, parentId);
        }
        setLoadingIds((prev) => ({ ...prev, [id]: false }));
      }
      setExpandedIds((prev) => ({ ...prev, [id]: true }));
    },
    [expandedIds, localComments, onFetchReplies, onFetchNestedReplies],
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

  const handleCommentKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <div ref={commentListRef}>
      {/* ── Title ─────────────────────────────────────────────────── */}
      <h4 className="text-lg sm:text-2xl font-semibold text-primary mb-6 sm:mb-8">
        Bình luận
      </h4>

      {/* ── Ask question block ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 pb-6 border-b border-neutral">
        {/* Ảnh — ẩn trên mobile rất nhỏ, thu nhỏ trên sm */}
        <div className="hidden xs:flex shrink-0 items-start justify-center sm:justify-start">
          <Image
            src="https://cdn2.cellphones.com.vn/insecure/rs:fill:160:0/q:90/plain/https://cellphones.com.vn/media/wysiwyg/ant-hello-2025.png"
            alt="Sản phẩm"
            width={100}
            height={100}
            className="sm:w-[120px] lg:w-[160px] h-auto object-contain"
          />
        </div>

        {/* Input area */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base sm:text-lg font-semibold text-primary mb-1 opacity-80">
            Hãy đặt câu hỏi cho chúng tôi
          </h4>
          <p className="text-xs sm:text-sm text-primary opacity-60 leading-relaxed">
            ChoCongNghe sẽ phản hồi trong vòng 1 giờ. Nếu Quý khách gửi câu hỏi
            sau 22h, chúng tôi sẽ trả lời vào sáng hôm sau.
          </p>

          {/* Input + button */}
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder={
                  isAuthenticated
                    ? "Viết câu hỏi của bạn tại đây..."
                    : "Đăng nhập để đặt câu hỏi..."
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={handleCommentKeyPress}
                disabled={submitting || !isAuthenticated}
                maxLength={3000}
                className="w-full px-3 py-2.5 border border-neutral-dark rounded-lg text-sm focus:outline-none focus:border-neutral-darker bg-neutral-light text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-darker pointer-events-none">
                {comment.length}/3000
              </span>
            </div>
            <button
              onClick={handleSubmitComment}
              disabled={!comment.trim() || submitting || !isAuthenticated}
              className="shrink-0 px-5 py-2.5 bg-neutral text-primary rounded-full text-xs sm:text-sm font-medium hover:bg-neutral-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {submitting ? "Đang gửi..." : "Gửi bình luận"}
            </button>
          </div>

          {!isAuthenticated && (
            <p className="text-xs text-neutral-darker mt-2">
              Bạn cần{" "}
              <a
                href="/account?login"
                className="text-primary underline hover:opacity-80 transition-opacity"
              >
                đăng nhập
              </a>{" "}
              để đặt câu hỏi hoặc trả lời bình luận.
            </p>
          )}
        </div>
      </div>

      {/* ── Filter bar ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h4 className="text-sm sm:text-base text-primary shrink-0">
          Có {filteredComments.length} bình luận
        </h4>
        {/* scroll ngang trên mobile */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedRating(option.value)}
              className={`
                shrink-0 px-3 sm:px-4 py-1 sm:py-1.5
                rounded-full text-xs sm:text-sm font-medium
                whitespace-nowrap cursor-pointer
                border transition-all duration-200
                ${
                  selectedRating === option.value
                    ? "border-accent text-accent bg-accent/10 shadow-sm shadow-accent/20"
                    : "border-neutral-dark text-neutral-darker bg-transparent hover:border-neutral-darker hover:bg-neutral-dark/10"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Comment list ──────────────────────────────────────────── */}
      <div className="space-y-5 sm:space-y-6 mt-5 sm:mt-6">
        {loading ? (
          <div className="text-center py-8 text-neutral-darker">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="mt-2 text-sm">Đang tải bình luận...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-8 text-neutral-darker">
            <p className="text-base sm:text-lg">Chưa có bình luận nào</p>
            <p className="text-xs sm:text-sm mt-1">
              Hãy là người đầu tiên bình luận!
            </p>
          </div>
        ) : (
          <>
            {visibleComments.map((c) => (
              <div
                key={c.id}
                className="pb-4 sm:pb-5 border-b border-neutral last:border-0"
              >
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
                  onReplyContentChange={(id, val) =>
                    setReplyContents((prev) => ({ ...prev, [id]: val }))
                  }
                  onSubmitReply={handleSubmitReply}
                  onKeyPress={handleKeyPress}
                />
              </div>
            ))}

            {/* Load more / Collapse */}
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
