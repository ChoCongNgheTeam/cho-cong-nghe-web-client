"use client";
import { AiOutlineLike } from "react-icons/ai";
import { useState, useCallback, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import type { Comment, Reply, CommentUser } from "./Productreview";
import { formatRelativeDate } from "@/helpers/formatRelativeDate";

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
const MAX_DEPTH = 2; // cấp 0, 1, 2 — cấp 3+ render như cấp 2
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

   // Nếu ở maxDepth, reply vẫn gắn vào node hiện tại (không tạo thêm cấp UI)
   const effectiveReplyTarget = node.id;

   return (
      <div className="flex gap-3">
         <Avatar user={node.user} size={avatarSize} />
         <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
               <span className="font-semibold text-sm text-primary">
                  {node.user?.fullName}
               </span>
               <span className="text-xs text-neutral-darker">
                  • {formatRelativeDate(node.createdAt)}
               </span>
            </div>

            {/* Content */}
            <p className="text-neutral-darker mb-2 text-sm wrap-break-word whitespace-pre-wrap">
               {node.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-neutral-darker">
               <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <AiOutlineLike />
                  <span>Thích</span>
               </button>

               <button
                  onClick={() =>
                     onSetReplyTarget(
                        replyTargetId === node.id ? null : effectiveReplyTarget,
                     )
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
                              {node._repliesCount ?? node.replies?.length ?? 0}{" "}
                              phản hồi
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
                     onChange={(e) =>
                        onReplyContentChange(node.id, e.target.value)
                     }
                     onKeyPress={(e) => onKeyPress(e, node.id)}
                     maxLength={3000}
                     autoFocus
                     className="flex-1 px-3 py-2 border border-neutral-dark rounded-lg text-sm focus:outline-none focus:border-neutral-darker bg-neutral-light text-primary"
                  />
                  <button
                     onClick={() => onSubmitReply(node.id)}
                     disabled={
                        !replyContents[node.id]?.trim() ||
                        replySubmitting === node.id
                     }
                     className="px-4 py-2 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                     {replySubmitting === node.id ? "Đang gửi..." : "Gửi"}
                  </button>
               </div>
            )}

            {/* Children — đệ quy, cấp 3+ render phẳng tại cấp MAX_DEPTH */}
            {isExpanded && (node.replies?.length ?? 0) > 0 && (
               <div
                  className={`mt-4 space-y-4 ${depth < MAX_DEPTH ? "pl-4 border-l-2 border-neutral" : ""}`}
               >
                  {node.replies!.map((child) => (
                     <CommentNode
                        key={child.id}
                        node={child}
                        depth={Math.min(depth + 1, MAX_DEPTH)} // cấp 3+ vẫn render như cấp MAX_DEPTH
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

   // Sync khi parent fetch xong — merge để không mất optimistic node đang pending
   useEffect(() => {
      setLocalComments((prev) => {
         const optimisticNodes = prev.filter((c) =>
            c.id.startsWith("optimistic-"),
         );
         const merged = [...initialComments];
         // Giữ lại optimistic nodes chưa có trong data mới
         optimisticNodes.forEach((opt) => {
            if (!merged.find((c) => c.id === opt.id)) merged.unshift(opt);
         });
         return merged;
      });
   }, [initialComments]);

   // ── Submit top-level comment (optimistic) ─────────────────────
   const handleSubmitComment = async () => {
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

      // Hiện ngay lập tức
      setLocalComments((prev) => [optimistic, ...prev]);

      try {
         await onCommentSubmit(content);
         // onCommentSubmit gọi fetchComments → useEffect sync sẽ tự merge
      } catch {
         setLocalComments((prev) => prev.filter((c) => c.id !== optimisticId));
      } finally {
         setSubmitting(false);
      }
   };

   // ── Submit reply (optimistic, đệ quy insert) ──────────────────
   const handleSubmitReply = useCallback(
      async (parentId: string) => {
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

         // Insert đệ quy vào đúng vị trí trong tree
         setLocalComments((prev) =>
            prev.map((c) => {
               if (c.id === parentId) {
                  // parentId là top-level comment
                  return {
                     ...c,
                     replies: [...(c.replies ?? []), optimistic],
                     _repliesCount: (c._repliesCount ?? 0) + 1,
                  };
               }
               // parentId là nested reply — dùng đệ quy
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

         // Auto expand để user thấy reply vừa gửi
         setExpandedIds((prev) => ({ ...prev, [parentId]: true }));

         try {
            await onReplySubmit(parentId, content);
         } catch {
            // Rollback: xóa optimistic node khỏi tree
            setLocalComments((prev) =>
               prev.map((c) => ({
                  ...c,
                  replies: removeNodeRecursive(c.replies ?? [], optimisticId),
               })),
            );
         } finally {
            setReplySubmitting(null);
         }
      },
      [replyContents, replySubmitting, productId, onReplySubmit],
   );

   // ── Toggle expand / fetch replies ─────────────────────────────
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
               // Dùng hàm đệ quy tìm top-level parent
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
      <div className="border-t border-neutral-dark pt-4 sm:pt-6">
         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h4 className="text-lg sm:text-xl font-semibold text-primary">
               {localComments.length} Bình luận
            </h4>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
               {filterOptions.map((option) => (
                  <button
                     key={option.value}
                     onClick={() => setSelectedRating(option.value)}
                     className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm border whitespace-nowrap transition-colors cursor-pointer ${
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

         {/* Input */}
         <div className="mb-6">
            <div className="relative">
               <input
                  type="text"
                  placeholder="Nhập nội dung bình luận..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={handleCommentKeyPress}
                  disabled={submitting}
                  maxLength={3000}
                  className="w-full px-3 sm:px-4 py-3 border border-neutral-dark rounded-lg pr-3 sm:pr-36 focus:outline-none focus:border-neutral-darker text-sm sm:text-base bg-neutral-light text-primary disabled:opacity-50 disabled:cursor-not-allowed"
               />
               <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:absolute sm:right-3 sm:top-1/2 sm:-translate-y-1/2">
                  <span className="text-xs text-neutral-darker">
                     {comment.length}/3000
                  </span>
                  <button
                     onClick={handleSubmitComment}
                     disabled={!comment.trim() || submitting}
                     className="px-4 cursor-pointer sm:px-6 py-2 bg-neutral text-primary rounded-full text-xs sm:text-sm font-medium hover:bg-neutral-hover ml-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                     {submitting ? "Đang gửi..." : "Gửi bình luận"}
                  </button>
               </div>
            </div>
         </div>

         {/* List */}
         <div className="space-y-6">
            {loading ? (
               <div className="text-center py-8 text-neutral-darker">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <p className="mt-2">Đang tải bình luận...</p>
               </div>
            ) : localComments.length === 0 ? (
               <div className="text-center py-8 text-neutral-darker">
                  <p className="text-lg">Chưa có bình luận nào</p>
                  <p className="text-sm mt-1">
                     Hãy là người đầu tiên bình luận!
                  </p>
               </div>
            ) : (
               localComments.map((c) => (
                  <div key={c.id} className="pb-5">
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
               ))
            )}
         </div>
      </div>
   );
}
