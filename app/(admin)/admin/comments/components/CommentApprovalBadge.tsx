"use client";
import { Comment } from "../comment.types";

export function CommentApprovalBadge({ comment }: { comment: Comment }) {
  if (comment.isApproved) {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold text-emerald-600 bg-emerald-50">Đã duyệt</span>;
  }
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold text-orange-500 bg-orange-50">Chờ duyệt</span>;
}
