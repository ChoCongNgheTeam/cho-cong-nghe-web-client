"use client";
import { AiOutlineLike } from "react-icons/ai";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

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

interface CommentSectionProps {
   productId: string;
   comments: Comment[];
   loading: boolean;
   onCommentSubmit: (content: string) => Promise<void>;
   onReplySubmit: (parentId: string, content: string) => Promise<void>;
   onFetchReplies: (commentId: string) => Promise<void>;
   onFetchNestedReplies: (replyId: string, parentCommentId: string) => Promise<void>;
}

const filterOptions = [
   { label: "Tất cả", value: "all" },
   { label: "5 ⭐", value: "5" },
   { label: "4 ⭐", value: "4" },
   { label: "3 ⭐", value: "3" },
   { label: "2 ⭐", value: "2" },
   { label: "1 ⭐", value: "1" },
];

export default function CommentSection({
   productId,
   comments,
   loading,
   onCommentSubmit,
   onReplySubmit,
   onFetchReplies,
   onFetchNestedReplies,
}: CommentSectionProps) {
   const [selectedRating, setSelectedRating] = useState("all");
   const [comment, setComment] = useState("");
   const [submitting, setSubmitting] = useState(false);
   const [replyingId, setReplyingId] = useState<string | null>(null);
   const [replyContents, setReplyContents] = useState<Record<string, string>>({});
   const [replySubmitting, setReplySubmitting] = useState<string | null>(null);
   const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
   const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
   const [loadingNestedReplies, setLoadingNestedReplies] = useState<Record<string, boolean>>({});
   const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

   const handleSubmitComment = async () => {
      if (!comment.trim() || submitting) return;
      try {
         setSubmitting(true);
         await onCommentSubmit(comment);
         setComment("");
      } finally {
         setSubmitting(false);
      }
   };

   const handleSubmitReply = async (parentId: string) => {
      const content = replyContents[parentId];
      if (!content?.trim() || replySubmitting === parentId) return;
      try {
         setReplySubmitting(parentId);
         await onReplySubmit(parentId, content);
         setReplyContents((prev) => ({ ...prev, [parentId]: "" }));
         setReplyingId(null);
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
         if (isReply && parentId) handleSubmitReply(parentId);
         else handleSubmitComment();
      }
   };

   const toggleReplies = async (commentId: string, hasReplies: boolean) => {
      if (expandedComments[commentId]) {
         setExpandedComments((prev) => ({ ...prev, [commentId]: false }));
         return;
      }
      if (!hasReplies) return;
      const c = comments.find((c) => c.id === commentId);
      if (!c?.replies || c.replies.length === 0) {
         setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
         await onFetchReplies(commentId);
         setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
      }
      setExpandedComments((prev) => ({ ...prev, [commentId]: true }));
   };

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
      const c = comments.find((c) => c.id === parentCommentId);
      const reply = c?.replies?.find((r) => r.id === replyId);
      if (!reply?.replies || reply.replies.length === 0) {
         setLoadingNestedReplies((prev) => ({ ...prev, [replyId]: true }));
         await onFetchNestedReplies(replyId, parentCommentId);
         setLoadingNestedReplies((prev) => ({ ...prev, [replyId]: false }));
      }
      setExpandedReplies((prev) => ({ ...prev, [replyId]: true }));
   };

   return (
      <div className="border-t border-neutral-dark pt-4 sm:pt-6">
         {/* HEADER */}
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

         {/* INPUT */}
         <div className="mb-6">
            <div className="relative">
               <input
                  type="text"
                  placeholder="Nhập nội dung bình luận..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, false)}
                  disabled={submitting}
                  maxLength={3000}
                  className="w-full px-3 sm:px-4 py-3 border border-neutral-dark rounded-lg pr-3 sm:pr-32 focus:outline-none focus:border-neutral-darker text-sm sm:text-base bg-neutral-light text-primary disabled:opacity-50 disabled:cursor-not-allowed"
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

         {/* LIST */}
         <div className="space-y-6">
            {loading ? (
               <div className="text-center py-8 text-neutral-darker">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
                     : (review.replies && review.replies.length > 0) ?? false;

                  const isExpanded = expandedComments[review.id];
                  const isLoadingReplies = loadingReplies[review.id];

                  return (
                     <div
                        key={review.id}
                        className="border-b border-neutral-dark pb-5 last:border-b-0"
                     >
                        <div className="flex gap-3">
                           {/* AVATAR */}
                           <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full overflow-hidden shrink-0">
                              {review.user?.avatarImage ? (
                                 <Image
                                    src={review.user.avatarImage || "/default-avatar.png"}
                                    alt={review.user.fullName}
                                    className="w-full h-full object-cover"
                                    width={36}
                                    height={36}
                                 />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm">
                                    {review.user?.fullName?.charAt(0).toUpperCase()}
                                 </div>
                              )}
                           </div>

                           {/* CONTENT */}
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                 <span className="font-semibold text-sm text-primary">
                                    {review.user?.fullName}
                                 </span>
                                 <span className="text-xs text-neutral-darker">
                                    •{" "}
                                    {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                                       day: "2-digit",
                                       month: "2-digit",
                                       year: "numeric",
                                    })}
                                 </span>
                              </div>

                              <p className="text-neutral-darker mb-2 text-sm break-words whitespace-pre-wrap">
                                 {review.content}
                              </p>

                              {/* ACTIONS */}
                              <div className="flex items-center gap-4 text-xs sm:text-sm text-neutral-darker">
                                 <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                    <AiOutlineLike />
                                    <span>Thích</span>
                                 </button>

                                 <button
                                    onClick={() =>
                                       setReplyingId(replyingId === review.id ? null : review.id)
                                    }
                                    className="hover:text-primary transition-colors"
                                 >
                                    Trả lời
                                 </button>

                                 {hasReplies && (
                                    <button
                                       onClick={() => toggleReplies(review.id, hasReplies)}
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
                                                {review._repliesCount || review.replies?.length || 0}{" "}
                                                phản hồi
                                             </span>
                                          </>
                                       )}
                                    </button>
                                 )}
                              </div>

                              {/* REPLY INPUT */}
                              {replyingId === review.id && (
                                 <div className="mt-3 flex gap-2">
                                    <input
                                       type="text"
                                       placeholder="Nhập phản hồi..."
                                       value={replyContents[review.id] || ""}
                                       onChange={(e) =>
                                          setReplyContents((prev) => ({
                                             ...prev,
                                             [review.id]: e.target.value,
                                          }))
                                       }
                                       onKeyPress={(e) => handleKeyPress(e, true, review.id)}
                                       maxLength={3000}
                                       className="flex-1 px-3 py-2 border border-neutral-dark rounded-lg text-sm focus:outline-none focus:border-neutral-darker bg-neutral-light text-primary"
                                    />
                                    <button
                                       onClick={() => handleSubmitReply(review.id)}
                                       disabled={
                                          !replyContents[review.id]?.trim() ||
                                          replySubmitting === review.id
                                       }
                                       className="px-4 py-2 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                       {replySubmitting === review.id ? "Đang gửi..." : "Gửi"}
                                    </button>
                                 </div>
                              )}

                              {/* NESTED REPLIES */}
                              {isExpanded && review.replies && review.replies.length > 0 && (
                                 <div className="mt-4 space-y-4 pl-4 border-l-2 border-neutral-dark">
                                    {review.replies.map((reply) => {
                                       const replyHasReplies = reply._repliesCount
                                          ? reply._repliesCount > 0
                                          : (reply.replies && reply.replies.length > 0) ?? false;
                                       const isReplyExpanded = expandedReplies[reply.id];
                                       const isLoadingNested = loadingNestedReplies[reply.id];

                                       return (
                                          <div key={reply.id} className="flex gap-3">
                                             <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full overflow-hidden shrink-0">
                                                {reply.user?.avatarImage ? (
                                                   <Image
                                                      src={reply.user.avatarImage || "/default-avatar.png"}
                                                      alt={reply.user.fullName}
                                                      className="w-full h-full object-cover"
                                                      width={32}
                                                      height={32}
                                                   />
                                                ) : (
                                                   <div className="w-full h-full flex items-center justify-center text-white font-semibold text-xs">
                                                      {reply.user?.fullName?.charAt(0).toUpperCase()}
                                                   </div>
                                                )}
                                             </div>

                                             <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                   <span className="font-semibold text-sm text-primary">
                                                      {reply.user?.fullName}
                                                   </span>
                                                   <span className="text-xs text-neutral-darker">
                                                      •{" "}
                                                      {new Date(reply.createdAt).toLocaleDateString("vi-VN", {
                                                         day: "2-digit",
                                                         month: "2-digit",
                                                         year: "numeric",
                                                      })}
                                                   </span>
                                                </div>

                                                <p className="text-neutral-darker mb-2 text-sm break-words whitespace-pre-wrap">
                                                   {reply.content}
                                                </p>

                                                <div className="flex items-center gap-4 text-xs text-neutral-darker">
                                                   <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                                      <AiOutlineLike />
                                                      <span>Thích</span>
                                                   </button>

                                                   <button
                                                      onClick={() =>
                                                         setReplyingId(
                                                            replyingId === reply.id ? null : reply.id,
                                                         )
                                                      }
                                                      className="hover:text-primary transition-colors"
                                                   >
                                                      Trả lời
                                                   </button>

                                                   {replyHasReplies && (
                                                      <button
                                                         onClick={() =>
                                                            toggleNestedReplies(
                                                               reply.id,
                                                               review.id,
                                                               replyHasReplies,
                                                            )
                                                         }
                                                         disabled={isLoadingNested}
                                                         className="flex items-center gap-1 hover:text-primary transition-colors disabled:opacity-50"
                                                      >
                                                         {isLoadingNested ? (
                                                            <>
                                                               <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                               <span>Đang tải...</span>
                                                            </>
                                                         ) : (
                                                            <>
                                                               {isReplyExpanded ? (
                                                                  <ChevronUp className="w-3 h-3" />
                                                               ) : (
                                                                  <ChevronDown className="w-3 h-3" />
                                                               )}
                                                               <span>
                                                                  {reply._repliesCount || reply.replies?.length || 0}{" "}
                                                                  phản hồi
                                                               </span>
                                                            </>
                                                         )}
                                                      </button>
                                                   )}
                                                </div>

                                                {/* Reply input cho nested reply */}
                                                {replyingId === reply.id && (
                                                   <div className="mt-3 flex gap-2">
                                                      <input
                                                         type="text"
                                                         placeholder="Nhập phản hồi..."
                                                         value={replyContents[reply.id] || ""}
                                                         onChange={(e) =>
                                                            setReplyContents((prev) => ({
                                                               ...prev,
                                                               [reply.id]: e.target.value,
                                                            }))
                                                         }
                                                         onKeyPress={(e) =>
                                                            handleKeyPress(e, true, reply.id)
                                                         }
                                                         maxLength={3000}
                                                         className="flex-1 px-3 py-2 border border-neutral-dark rounded-lg text-sm focus:outline-none focus:border-neutral-darker bg-neutral-light text-primary"
                                                      />
                                                      <button
                                                         onClick={() => handleSubmitReply(reply.id)}
                                                         disabled={
                                                            !replyContents[reply.id]?.trim() ||
                                                            replySubmitting === reply.id
                                                         }
                                                         className="px-4 py-2 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                      >
                                                         {replySubmitting === reply.id ? "Đang gửi..." : "Gửi"}
                                                      </button>
                                                   </div>
                                                )}

                                                {/* Nested nested replies */}
                                                {isReplyExpanded && reply.replies && reply.replies.length > 0 && (
                                                   <div className="mt-4 space-y-4 pl-4 border-l-2 border-neutral-dark">
                                                      {reply.replies.map((nestedReply) => (
                                                         <div key={nestedReply.id} className="flex gap-3">
                                                            <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-full overflow-hidden shrink-0">
                                                               {nestedReply.user?.avatarImage ? (
                                                                  <Image
                                                                     src={nestedReply.user.avatarImage || "/default-avatar.png"}
                                                                     alt={nestedReply.user.fullName}
                                                                     className="w-full h-full object-cover"
                                                                     width={28}
                                                                     height={28}
                                                                  />
                                                               ) : (
                                                                  <div className="w-full h-full flex items-center justify-center text-white font-semibold text-xs">
                                                                     {nestedReply.user?.fullName?.charAt(0).toUpperCase()}
                                                                  </div>
                                                               )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                               <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                  <span className="font-semibold text-xs text-primary">
                                                                     {nestedReply.user?.fullName}
                                                                  </span>
                                                                  <span className="text-xs text-neutral-darker">
                                                                     •{" "}
                                                                     {new Date(nestedReply.createdAt).toLocaleDateString("vi-VN", {
                                                                        day: "2-digit",
                                                                        month: "2-digit",
                                                                        year: "numeric",
                                                                     })}
                                                                  </span>
                                                               </div>
                                                               <p className="text-neutral-darker text-xs break-words whitespace-pre-wrap">
                                                                  {nestedReply.content}
                                                               </p>
                                                            </div>
                                                         </div>
                                                      ))}
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
   );
}