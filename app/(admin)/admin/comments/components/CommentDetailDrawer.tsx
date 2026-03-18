"use client";
import { useEffect, useState } from "react";
import { X, User, Calendar, Tag, Reply, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Comment } from "../comment.types";
import { getComment, getCommentReplies, approveComment } from "../_libs/comments";
import { TARGET_TYPE_LABELS, TARGET_TYPE_COLORS } from "../const";
import { formatDate } from "@/helpers";

interface CommentDetailDrawerProps {
  commentId: string | null;
  onClose: () => void;
  onApprovalChange: (id: string, isApproved: boolean) => void;
}

function Avatar({ user }: { user: Comment["user"] }) {
  if (user?.avatarImage) {
    return <img src={user.avatarImage} alt={user.fullName ?? user.email} className="w-8 h-8 rounded-full object-cover" />;
  }
  const initials = user?.fullName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "?";
  return <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[13px] font-semibold">{initials}</div>;
}

export function CommentDetailDrawer({ commentId, onClose, onApprovalChange }: CommentDetailDrawerProps) {
  const [comment, setComment] = useState<Comment | null>(null);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!commentId) return;
    setLoading(true);
    setComment(null);
    setReplies([]);
    Promise.all([getComment(commentId), getCommentReplies(commentId)])
      .then(([commentRes, repliesRes]) => {
        setComment(commentRes.data);
        setReplies(repliesRes.data);
      })
      .finally(() => setLoading(false));
  }, [commentId]);

  const handleApprove = async (id: string, isApproved: boolean) => {
    setApprovingId(id);
    try {
      const res = await approveComment(id, isApproved);
      if (comment?.id === id) setComment(res.data);
      else setReplies((prev) => prev.map((r) => (r.id === id ? res.data : r)));
      onApprovalChange(id, isApproved);
    } finally {
      setApprovingId(null);
    }
  };

  const isOpen = !!commentId;

  return (
    <>
      {/* Overlay */}
      <div className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-neutral-light border-l border-neutral z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral">
          <h2 className="text-[15px] font-bold text-primary">Chi tiết bình luận</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-neutral-light-active transition-colors cursor-pointer">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={20} className="animate-spin text-neutral-dark" />
            </div>
          ) : comment ? (
            <>
              {/* Main comment */}
              <CommentCard comment={comment} onApprove={handleApprove} approvingId={approvingId} isMain />

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-3">
                <MetaItem icon={<Calendar size={12} />} label="Ngày tạo" value={formatDate(comment.createdAt)} />
                <MetaItem
                  icon={<Tag size={12} />}
                  label="Loại"
                  value={
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${TARGET_TYPE_COLORS[comment.targetType] ?? ""}`}>
                      {TARGET_TYPE_LABELS[comment.targetType] ?? comment.targetType}
                    </span>
                  }
                />
                <MetaItem icon={<User size={12} />} label="Email" value={comment.user?.email ?? "—"} />
                {comment.parentId && <MetaItem icon={<Reply size={12} />} label="Reply của" value={comment.parentId.slice(0, 8) + "..."} />}
              </div>

              {/* Replies */}
              {replies.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider flex items-center gap-1.5">
                    <Reply size={12} /> {replies.length} phản hồi
                  </p>
                  <div className="space-y-2 pl-3 border-l-2 border-neutral">
                    {replies.map((reply) => (
                      <CommentCard key={reply.id} comment={reply} onApprove={handleApprove} approvingId={approvingId} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

function CommentCard({ comment, onApprove, approvingId, isMain = false }: { comment: Comment; onApprove: (id: string, isApproved: boolean) => void; approvingId: string | null; isMain?: boolean }) {
  const isApproving = approvingId === comment.id;

  return (
    <div className={`rounded-xl border ${isMain ? "border-neutral bg-white p-4" : "border-neutral bg-neutral-light/50 p-3"}`}>
      {/* User row */}
      <div className="flex items-center gap-2.5 mb-3">
        <Avatar user={comment.user} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-primary truncate">{comment.user?.fullName ?? comment.user?.email ?? "Người dùng ẩn danh"}</p>
          {comment.user?.fullName && <p className="text-[11px] text-neutral-dark truncate">{comment.user.email}</p>}
        </div>
        {/* Approval badge */}
        {comment.isApproved ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold text-emerald-600 bg-emerald-50">Đã duyệt</span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold text-orange-500 bg-orange-50">Chờ duyệt</span>
        )}
      </div>

      {/* Content */}
      <p className="text-[13px] text-primary leading-relaxed mb-3">{comment.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!comment.isApproved ? (
          <button
            onClick={() => onApprove(comment.id, true)}
            disabled={isApproving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[12px] font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isApproving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
            Duyệt
          </button>
        ) : (
          <button
            onClick={() => onApprove(comment.id, false)}
            disabled={isApproving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-500 text-[12px] font-medium hover:bg-orange-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isApproving ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
            Từ chối
          </button>
        )}
      </div>
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="bg-neutral-light border border-neutral rounded-xl px-3 py-2.5 space-y-0.5">
      <p className="text-[10px] font-semibold text-neutral-dark uppercase tracking-wider flex items-center gap-1">
        {icon} {label}
      </p>
      <div className="text-[12px] text-primary font-medium">{value}</div>
    </div>
  );
}
