import { Eye, Trash2, CheckCircle, XCircle, Reply, MessageCircle, ExternalLink } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { Comment } from "../comment.types";
import { CommentApprovalBadge } from "./CommentApprovalBadge";
import { TARGET_TYPE_LABELS, TARGET_TYPE_COLORS } from "../const";
import { formatDate } from "@/helpers";
import { TbMessageCircleCheck } from "react-icons/tb";

interface GetCommentColumnsParams {
  page: number;
  pageSize: number;
  selected: Set<string>;
  toggleOne: (id: string) => void;
  onViewClick: (id: string) => void;
  onApproveClick: (comment: Comment, isApproved: boolean) => void;
  onDeleteClick: (comment: Comment) => void;
  onReplyClick: (id: string) => void;
}

function Avatar({ user }: { user: Comment["user"] }) {
  if (user?.avatarImage) {
    return <img src={user.avatarImage} alt={user.fullName ?? user.email} className="w-7 h-7 rounded-full object-cover" />;
  }
  const initials = user?.fullName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "?";
  return <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[11px] font-semibold flex-shrink-0">{initials}</div>;
}

/** Hiển thị tên blog / sản phẩm mà comment thuộc về */
function TargetCell({ comment }: { comment: Comment }) {
  const label = TARGET_TYPE_LABELS[comment.targetType] ?? comment.targetType;
  const colorClass = TARGET_TYPE_COLORS[comment.targetType] ?? "text-neutral-dark bg-neutral-light-active";

  return (
    <div className="space-y-1 min-w-0">
      {/* Badge loại */}
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${colorClass}`}>{label}</span>

      {/* Tên đối tượng */}
      {comment.targetName ? (
        <p className="text-[12px] font-medium text-primary truncate max-w-[160px]" title={comment.targetName}>
          {comment.targetName}
        </p>
      ) : (
        <p className="text-[11px] text-neutral-dark font-mono truncate max-w-[160px]">{comment.targetId.slice(0, 8)}…</p>
      )}
    </div>
  );
}

export function getCommentColumns({ page, pageSize, selected, toggleOne, onViewClick, onApproveClick, onDeleteClick, onReplyClick }: GetCommentColumnsParams): AdminColumn<Comment>[] {
  return [
    {
      key: "_select",
      label: "",
      width: "w-10",
      align: "center",
      render: (comment) => (
        <input
          type="checkbox"
          checked={selected.has(comment.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleOne(comment.id);
          }}
          className="w-3.5 h-3.5 rounded accent-accent cursor-pointer"
        />
      ),
    },
    {
      key: "_stt",
      label: "STT",
      width: "w-14",
      render: (_, idx) => (page - 1) * pageSize + idx + 1,
    },
    {
      key: "user",
      label: "Người dùng",
      render: (comment) => (
        <div className="flex items-center gap-2.5">
          <Avatar user={comment.user} />
          <div className="space-y-0.5 min-w-0">
            <p className="text-[13px] font-medium text-primary truncate max-w-[140px]">{comment.user?.fullName ?? "Ẩn danh"}</p>
            <p className="text-[11px] text-neutral-dark truncate max-w-[140px]">{comment.user?.email ?? "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "content",
      label: "Nội dung",
      render: (comment) => (
        <div className="space-y-0.5">
          <p className="text-[13px] text-primary line-clamp-2 max-w-xs">{comment.content}</p>
          {comment.parentId && <span className="text-[10px] text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded font-medium">↩ Reply</span>}
        </div>
      ),
    },
    // ── Cột mới: Đối tượng (blog / sản phẩm) ────────────────────────────────
    {
      key: "targetName",
      label: "Đối tượng",
      render: (comment) => <TargetCell comment={comment} />,
    },
    {
      key: "isApproved",
      label: "Trạng thái",
      render: (comment) => <CommentApprovalBadge comment={comment} />,
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (comment) => <span className="text-[12px] text-neutral-dark">{formatDate(comment.createdAt)}</span>,
    },
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (comment) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            title="Xem"
            onClick={() => onViewClick(comment.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors cursor-pointer"
          >
            <Eye size={14} />
          </button>
          {comment.parentId === null || comment.parentId === undefined ? (
            <button
              title={comment.repliesCount ? `${comment.repliesCount} phản hồi` : "Phản hồi"}
              onClick={() => onReplyClick(comment.id)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer relative ${
                comment.repliesCount ? "text-blue-500 bg-blue-50 hover:bg-blue-100" : "text-neutral-dark hover:bg-blue-50 hover:text-blue-500"
              }`}
            >
              {comment.repliesCount ? <TbMessageCircleCheck size={14} /> : <MessageCircle size={14} />}
              {!!comment.repliesCount && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-500 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                  {comment.repliesCount > 9 ? "9+" : comment.repliesCount}
                </span>
              )}
            </button>
          ) : null}

          {!comment.isApproved ? (
            <button
              title="Duyệt"
              onClick={() => onApproveClick(comment, true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <CheckCircle size={14} />
            </button>
          ) : (
            <button
              title="Từ chối"
              onClick={() => onApproveClick(comment, false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-orange-50 hover:text-orange-500 transition-colors cursor-pointer"
            >
              <XCircle size={14} />
            </button>
          )}

          <button
            title="Xoá"
            onClick={() => onDeleteClick(comment)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];
}
