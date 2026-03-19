"use client";
import { useEffect, useState } from "react";
import { X, User, Calendar, Package, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Review, ReviewStatus } from "../review.types";
import { getReview, approveReview } from "../_libs/reviews";
import { REVIEW_STATUS_CONFIG } from "../const";
import { StarRating } from "./StarRating";
import { formatDate, formatVND } from "@/helpers";

interface ReviewDetailDrawerProps {
  reviewId: string | null;
  onClose: () => void;
  onStatusChange: (id: string, status: ReviewStatus) => void;
}

function Avatar({ user }: { user: Review["user"] }) {
  if (user?.avatarImage) {
    return <img src={user.avatarImage} alt={user.fullName ?? "User"} className="w-9 h-9 rounded-full object-cover" />;
  }
  const initials = user?.fullName?.[0]?.toUpperCase() ?? "?";
  return <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[13px] font-semibold flex-shrink-0">{initials}</div>;
}

export function ReviewDetailDrawer({ reviewId, onClose, onStatusChange }: ReviewDetailDrawerProps) {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [approvingStatus, setApprovingStatus] = useState<ReviewStatus | null>(null);

  useEffect(() => {
    if (!reviewId) return;
    setLoading(true);
    setReview(null);
    getReview(reviewId)
      .then((res) => setReview(res.data))
      .finally(() => setLoading(false));
  }, [reviewId]);

  const handleApprove = async (status: ReviewStatus) => {
    if (!review) return;
    setApprovingStatus(status);
    try {
      const res = await approveReview(review.id, status);
      setReview(res.data);
      onStatusChange(review.id, status);
    } finally {
      setApprovingStatus(null);
    }
  };

  const isOpen = !!reviewId;
  const product = review?.orderItem?.productVariant?.product;
  const variant = review?.orderItem?.productVariant;
  const productImg = product?.img?.[0]?.imageUrl;

  return (
    <>
      <div className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-neutral-light border-l border-neutral z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral">
          <h2 className="text-[15px] font-bold text-primary">Chi tiết đánh giá</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-neutral-light-active transition-colors cursor-pointer">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={20} className="animate-spin text-neutral-dark" />
            </div>
          ) : review ? (
            <>
              {/* Product card */}
              <div className="flex items-center gap-3 bg-white border border-neutral rounded-xl p-3">
                {productImg ? (
                  <img src={productImg} alt={product?.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-neutral" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-neutral-light-active flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-neutral-dark" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-primary truncate">{product?.name ?? "—"}</p>
                  <p className="text-[11px] text-neutral-dark">{variant?.code ?? "—"}</p>
                  <p className="text-[12px] text-accent font-medium mt-0.5">{formatVND(review.orderItem.unitPrice)}</p>
                </div>
              </div>

              {/* User + Rating */}
              <div className="bg-white border border-neutral rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <Avatar user={review.user} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-primary truncate">{review.user?.fullName ?? "Ẩn danh"}</p>
                    <p className="text-[11px] text-neutral-dark">{formatDate(review.createdAt)}</p>
                  </div>
                  {(() => {
                    const config = REVIEW_STATUS_CONFIG[review.isApproved];
                    return config ? <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${config.color}`}>{config.label}</span> : null;
                  })()}
                </div>

                {/* Rating stars */}
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size={16} />
                  <span className="text-[13px] font-semibold text-primary">{review.rating}/5</span>
                </div>

                {/* Comment */}
                {review.comment ? <p className="text-[13px] text-primary leading-relaxed">{review.comment}</p> : <p className="text-[12px] text-neutral-dark italic">Không có nội dung nhận xét</p>}
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <MetaItem icon={<Calendar size={12} />} label="Ngày tạo" value={formatDate(review.createdAt)} />
                <MetaItem icon={<Package size={12} />} label="Số lượng mua" value={`${review.orderItem.quantity} sản phẩm`} />
              </div>

              {/* Actions */}
              <div className="bg-white border border-neutral rounded-xl p-4 space-y-2">
                <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider mb-3">Thay đổi trạng thái</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleApprove("APPROVED")}
                    disabled={review.isApproved === "APPROVED" || !!approvingStatus}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[12px] font-medium hover:bg-emerald-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {approvingStatus === "APPROVED" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                    Duyệt
                  </button>
                  <button
                    onClick={() => handleApprove("REJECTED")}
                    disabled={review.isApproved === "REJECTED" || !!approvingStatus}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-[12px] font-medium hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {approvingStatus === "REJECTED" ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                    Từ chối
                  </button>
                  <button
                    onClick={() => handleApprove("PENDING")}
                    disabled={review.isApproved === "PENDING" || !!approvingStatus}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-500 text-[12px] font-medium hover:bg-orange-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {approvingStatus === "PENDING" ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
                    Chờ duyệt
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
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
