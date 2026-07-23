import { Eye, Trash2, CheckCircle, XCircle } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { selectColumn, sttColumn, RowActionButton } from "@/components/admin/columns/adminColumns";
import { Review, ReviewStatus } from "../review.types";
import { ReviewStatusBadge } from "./ReviewStatusBadge";
import { StarRating } from "./StarRating";
import { formatDate } from "@/helpers";

interface GetReviewColumnsParams {
  page: number;
  pageSize: number;
  selected: Set<string>;
  toggleOne: (id: string) => void;
  onViewClick: (id: string) => void;
  onApproveClick: (review: Review, status: ReviewStatus) => void;
  onDeleteClick: (review: Review) => void;
}

function Avatar({ user }: { user: Review["user"] }) {
  if (user?.avatarImage) {
    return <img src={user.avatarImage} alt={user.fullName ?? "User"} className="w-7 h-7 rounded-full object-cover" />;
  }
  const initials = user?.fullName?.[0]?.toUpperCase() ?? "?";
  return <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[11px] font-semibold flex-shrink-0">{initials}</div>;
}

export function getReviewColumns({ page, pageSize, selected, toggleOne, onViewClick, onApproveClick, onDeleteClick }: GetReviewColumnsParams): AdminColumn<Review>[] {
  return [
    selectColumn<Review>((r) => r.id, selected, toggleOne),
    sttColumn<Review>(page, pageSize),
    {
      key: "user",
      label: "Người dùng",
      render: (review) => (
        <div className="flex items-center gap-2.5">
          <Avatar user={review.user} />
          <p className="text-[13px] font-medium text-primary truncate max-w-[120px]">{review.user?.fullName ?? "Ẩn danh"}</p>
        </div>
      ),
    },
    {
      key: "product",
      label: "Sản phẩm",
      render: (review) => {
        const product = review.orderItem?.productVariant?.product;
        const img = product?.img?.[0]?.imageUrl;
        return (
          <div className="flex items-center gap-2">
            {img ? (
              <img src={img} alt={product?.name} className="w-8 h-8 rounded-lg object-cover border border-neutral flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-neutral-light-active flex-shrink-0" />
            )}
            <p className="text-[12px] text-primary line-clamp-2 max-w-[140px]">{product?.name ?? "—"}</p>
          </div>
        );
      },
    },
    {
      key: "rating",
      label: "Đánh giá",
      render: (review) => (
        <div className="space-y-0.5">
          <StarRating rating={review.rating} />
          {review.comment && <p className="text-[11px] text-neutral-dark line-clamp-1 max-w-[160px]">{review.comment}</p>}
        </div>
      ),
    },
    {
      key: "isApproved",
      label: "Trạng thái",
      render: (review) => <ReviewStatusBadge review={review} />,
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (review) => <span className="text-[12px] text-neutral-dark">{formatDate(review.createdAt)}</span>,
    },
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (review) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <RowActionButton title="Xem" onClick={() => onViewClick(review.id)}>
            <Eye size={14} />
          </RowActionButton>
          {review.isApproved !== "APPROVED" ? (
            <RowActionButton title="Duyệt" variant="success" onClick={() => onApproveClick(review, "APPROVED")}>
              <CheckCircle size={14} />
            </RowActionButton>
          ) : (
            <RowActionButton title="Từ chối" variant="danger" onClick={() => onApproveClick(review, "REJECTED")}>
              <XCircle size={14} />
            </RowActionButton>
          )}
          <RowActionButton title="Xoá" variant="danger" onClick={() => onDeleteClick(review)}>
            <Trash2 size={14} />
          </RowActionButton>
        </div>
      ),
    },
  ];
}
