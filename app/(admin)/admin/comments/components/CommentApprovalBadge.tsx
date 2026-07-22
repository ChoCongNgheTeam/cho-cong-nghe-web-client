"use client";
import { Comment } from "../comment.types";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

export function CommentApprovalBadge({ comment }: { comment: Comment }) {
  return comment.isApproved ? <StatusBadge label="Đã duyệt" className="text-emerald-600 bg-emerald-50" /> : <StatusBadge label="Chờ duyệt" className="text-orange-500 bg-orange-50" />;
}
