"use client";

import { useEffect, useState } from "react";
import { Reply, Send, Loader2, User } from "lucide-react";
import { Comment } from "../comment.types";
import {
   createCommentReply,
   getComment,
   getCommentReplies,
} from "../_libs/comments";
import { formatDate } from "@/helpers";
import { Popzy } from "@/components/Modal";

interface ReplyCommentModalProps {
   commentId: string | null;
   onClose: () => void;
   onReplied?: () => void;
}

function Avatar({ user }: { user: Comment["user"] }) {
   if (user?.avatarImage) {
      return (
         <img
            src={user.avatarImage}
            alt={user.fullName ?? user.email}
            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
         />
      );
   }
   const initials =
      user?.fullName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "?";
   return (
      <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[11px] font-semibold flex-shrink-0">
         {initials}
      </div>
   );
}

export function ReplyCommentModal({
   commentId,
   onClose,
   onReplied,
}: ReplyCommentModalProps) {
   const [comment, setComment] = useState<Comment | null>(null);
   const [replies, setReplies] = useState<Comment[]>([]);
   const [loading, setLoading] = useState(false);
   const [replyText, setReplyText] = useState("");
   const [submitting, setSubmitting] = useState(false);

   useEffect(() => {
      if (!commentId) return;
      setLoading(true);
      setComment(null);
      setReplies([]);
      setReplyText("");

      Promise.all([getComment(commentId), getCommentReplies(commentId)])
         .then(([commentRes, repliesRes]) => {
            setComment(commentRes.data);
            setReplies(repliesRes.data);
         })
         .finally(() => setLoading(false));
   }, [commentId]);

   const handleSubmit = async () => {
      if (!replyText.trim() || !commentId || !comment) return;
      setSubmitting(true);
      try {
         await createCommentReply(commentId, {
            content: replyText.trim(),
            targetId: comment.targetId,
            targetType: comment.targetType,
         });
         setReplyText("");
         onReplied?.();
         onClose();
      } finally {
         setSubmitting(false);
      }
   };

   const modalContent = (
      <div className="space-y-4">
         {/* Header */}
         <div className="flex items-center gap-2.5 pb-3 border-b border-neutral">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
               <Reply size={15} />
            </div>
            <div>
               <p className="text-[14px] font-bold text-primary">
                  Phản hồi bình luận
               </p>
               <p className="text-[11px] text-neutral-dark">
                  {replies.length > 0
                     ? "Bình luận này đã được phản hồi"
                     : "Phản hồi sẽ hiển thị công khai bên dưới bình luận"}
               </p>
            </div>
         </div>

         {loading ? (
            <div className="flex items-center justify-center py-10">
               <Loader2 size={20} className="animate-spin text-neutral-dark" />
            </div>
         ) : comment ? (
            <>
               {/* Comment gốc */}
               <div className="rounded-xl bg-white border border-neutral p-3.5 space-y-2">
                  <div className="flex items-center gap-2">
                     <Avatar user={comment.user} />
                     <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-primary truncate">
                           {comment.user?.fullName ??
                              comment.user?.email ??
                              "Ẩn danh"}
                        </p>
                        <p className="text-[10px] text-neutral-dark">
                           {formatDate(comment.createdAt)}
                        </p>
                     </div>
                  </div>
                  <p className="text-[13px] text-primary leading-relaxed pl-9">
                     {comment.content}
                  </p>
               </div>

               {/* Replies hiện có */}
               {replies.length > 0 && (
                  <div className="space-y-2">
                     <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider flex items-center gap-1.5">
                        <Reply size={11} /> {replies.length} phản hồi trước
                     </p>
                     <div className="space-y-2 pl-3 border-l-2 border-neutral max-h-48 overflow-y-auto pr-1">
                        {replies.map((reply) => (
                           <div
                              key={reply.id}
                              className="rounded-lg bg-white border border-neutral p-3 space-y-1.5"
                           >
                              <div className="flex items-center gap-2">
                                 <Avatar user={reply.user} />
                                 <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-semibold text-primary truncate">
                                       {reply.user?.fullName ??
                                          reply.user?.email ??
                                          "Ẩn danh"}
                                    </p>
                                    <p className="text-[10px] text-neutral-dark">
                                       {formatDate(reply.createdAt)}
                                    </p>
                                 </div>
                                 {reply.isApproved ? (
                                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex-shrink-0">
                                       Đã duyệt
                                    </span>
                                 ) : (
                                    <span className="text-[10px] font-medium text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md flex-shrink-0">
                                       Chờ duyệt
                                    </span>
                                 )}
                              </div>
                              <p className="text-[12px] text-primary leading-relaxed pl-9">
                                 {reply.content}
                              </p>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {replies.length === 0 && (
                  <div className="space-y-2">
                     <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider flex items-center gap-1.5">
                        <User size={11} /> Phản hồi của bạn (Admin)
                     </label>
                     <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Nhập nội dung phản hồi..."
                        rows={3}
                        className="w-full px-3 py-2.5 text-[13px] bg-white border border-neutral rounded-xl outline-none focus:border-accent transition-colors resize-none text-primary placeholder:text-neutral-dark"
                     />
                     <div className="flex items-center justify-end gap-2">
                        <button
                           onClick={onClose}
                           className="px-4 py-2 text-[13px] border border-neutral rounded-lg text-primary hover:bg-neutral-light-active transition-colors cursor-pointer"
                        >
                           Hủy
                        </button>
                        <button
                           onClick={handleSubmit}
                           disabled={submitting || !replyText.trim()}
                           className="flex items-center gap-1.5 px-4 py-2 text-[13px] bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                           {submitting ? (
                              <Loader2 size={13} className="animate-spin" />
                           ) : (
                              <Send size={13} />
                           )}
                           Gửi phản hồi
                        </button>
                     </div>
                  </div>
               )}
               {/* Nếu đã có replies thì chỉ hiện nút đóng */}
               {replies.length > 0 && (
                  <div className="flex justify-end">
                     <button
                        onClick={onClose}
                        className="px-4 py-2 text-[13px] border border-neutral rounded-lg text-primary hover:bg-neutral-light-active transition-colors cursor-pointer"
                     >
                        Đóng
                     </button>
                  </div>
               )}
            </>
         ) : null}
      </div>
   );

   return (
      <Popzy
         isOpen={!!commentId}
         onClose={onClose}
         content={modalContent}
         closeMethods={["button", "overlay", "escape"]}
         cssClass="!w-[min(560px,92%)]"
      />
   );
}
