"use client";
import { Star } from "lucide-react";
import { useState } from "react";
import apiRequest from "@/lib/api";
import { useToasty } from "@/components/Toast";
import { Popzy } from "@/components/Modal"; // ✅ import Popzy

interface RatingSummaryProps {
  rating: {
    average: number;
    total: number;
    distribution: Record<string, number>;
  };
  orderItemId?: string;
  canReview?: boolean;
}

// ── Review Form (content của Popzy) ───────────────────────────────
function ReviewForm({
  orderItemId,
  onClose,
}: {
  orderItemId: string;
  onClose: () => void;
}) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toasty = useToasty();

  const ratingLabels = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"];

  const handleSubmit = async () => {
    if (!selectedRating) {
      toasty.warning("Vui lòng chọn số sao đánh giá");
      return;
    }
    if (!comment.trim()) {
      toasty.warning("Vui lòng nhập nội dung đánh giá");
      return;
    }
    try {
      setSubmitting(true);
      await apiRequest.post("/reviews", {
        orderItemId,
        rating: selectedRating,
        comment: comment.trim(),
      });
      toasty.success("Đánh giá thành công! Sẽ hiển thị sau khi được duyệt.");
      onClose();
    } catch (err: any) {
      toasty.error(err?.message || "Không thể gửi đánh giá, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-2">
      <h3 className="text-lg font-bold text-primary mb-6">Đánh giá sản phẩm</h3>

      {/* Star selector */}
      <div className="flex justify-center gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setSelectedRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="cursor-pointer transition-transform hover:scale-110"
          >
            <Star
              className={`w-10 h-10 transition-colors ${
                star <= (hoveredRating || selectedRating)
                  ? "fill-accent text-accent"
                  : "text-neutral-dark"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Rating label */}
      <p className="text-center text-sm text-neutral-darker mb-6 h-5">
        {ratingLabels[hoveredRating || selectedRating] ?? ""}
      </p>

      {/* Comment */}
      <textarea
        placeholder="Nhập nội dung đánh giá..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={4}
        className="w-full px-4 py-3 border border-neutral rounded-lg text-sm focus:outline-none focus:border-neutral-darker bg-neutral-light text-primary resize-none mb-1"
      />
      <p className="text-xs text-neutral-darker text-right mb-6">
        {comment.length}/1000
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-lg border border-neutral text-primary hover:bg-neutral transition-colors text-sm font-medium cursor-pointer"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 py-3 rounded-lg bg-promotion hover:bg-promotion-hover text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function RatingSummary({ rating, orderItemId }: RatingSummaryProps) {
  const [showModal, setShowModal] = useState(false);
  const toasty = useToasty();

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    stars: star,
    count: rating.distribution[star] ?? 0,
  }));

  const maxCount = Math.max(...breakdown.map((r) => r.count), 1);
  const getBarWidth = (count: number) => (count / maxCount) * 100;

  const handleWriteReview = () => {
    if (!orderItemId) {
      toasty.warning("Bạn cần mua sản phẩm này để có thể đánh giá");
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">
          Đánh giá và bình luận
        </h2>

        <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-12 mb-6">
          {/* LEFT */}
          <div className="flex flex-col items-center w-full sm:w-auto">
            <div className="text-5xl sm:text-6xl font-bold mb-2 text-primary">
              {rating.average.toFixed(1)}
            </div>

            <div className="flex gap-1 mb-2 flex-wrap justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    star <= Math.round(rating.average)
                      ? "fill-accent text-accent"
                      : "text-neutral-dark"
                  }`}
                />
              ))}
            </div>

            <div className="text-sm text-neutral-darker mb-3">
              {rating.total} lượt đánh giá
            </div>

            <button
              onClick={handleWriteReview}
              className="px-6 py-2 bg-promotion text-white rounded-full font-medium hover:bg-promotion-hover text-sm sm:text-base cursor-pointer"
            >
              Đánh giá sản phẩm
            </button>
          </div>

          {/* RIGHT */}
          <div className="flex-1 w-full">
            {breakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="text-xs sm:text-sm w-7 sm:w-8 text-neutral-darker">
                  {item.stars} ⭐
                </span>
                <div className="flex-1 h-2 bg-neutral rounded-full overflow-hidden">
                  <div
                    className="h-full bg-promotion rounded-full transition-all duration-300"
                    style={{ width: `${getBarWidth(item.count)}%` }}
                  />
                </div>
                <span className="text-xs sm:text-sm text-neutral-darker w-6 sm:w-8 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dùng Popzy thay modal tự tạo */}
      <Popzy
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        closeMethods={["button", "overlay", "escape"]}
        content={
          orderItemId ? (
            <ReviewForm
              orderItemId={orderItemId}
              onClose={() => setShowModal(false)}
            />
          ) : null
        }
      />
    </>
  );
}