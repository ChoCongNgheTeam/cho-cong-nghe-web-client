"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Popzy } from "@/components/Modal";
import { useToasty } from "@/components/Toast";
import apiRequest from "@/lib/api";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItemId: string;
  productName?: string;
  onSuccess: (stars: number) => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  orderItemId,
  productName,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const toasty = useToasty();

  const handleClose = () => {
    setRating(0);
    setHover(0);
    setComment("");
    setCommentError("");
    onClose();
  };

  const submit = async () => {
    if (!rating) {
      toasty.warning("Vui lòng chọn số sao");
      return;
    }
    if (!comment.trim()) {
      setCommentError("Vui lòng nhập nội dung đánh giá");
      return;
    }
    setCommentError("");
    try {
      setLoading(true);
      await apiRequest.post("/reviews", { orderItemId, rating, comment });
      onSuccess?.(rating);
      handleClose();
    } catch (err: any) {
      const message = err?.message || err?.response?.data?.message || "";
      if (message.includes("đã đánh giá")) {
        toasty.warning("Bạn đã đánh giá sản phẩm này rồi", {
          title: "Đã đánh giá",
          duration: 3000,
          showProgress: true,
        });
        onSuccess?.(rating);
        handleClose();
      } else {
        toasty.error(message || "Không thể gửi đánh giá");
      }
    } finally {
      setLoading(false);
    }
  };

  const labels = ["", "Rất tệ", "Không tốt", "Bình thường", "Tốt", "Xuất sắc"];
  const active = hover || rating;

  return (
    <Popzy
      isOpen={isOpen}
      onClose={handleClose}
      closeMethods={["button", "overlay", "escape"]}
      cssClass="mx-3 sm:mx-auto"
      content={
        <div className="py-1.5 sm:py-2 px-0.5 sm:px-1">
          {/* Title */}
          <h3 className="text-sm sm:text-base font-semibold text-primary mb-0.5 sm:mb-1">
            Đánh giá sản phẩm
          </h3>

          {/* Product name */}
          {productName && (
            <p className="text-xs sm:text-sm text-neutral-darker mb-0.5 sm:mb-1 line-clamp-1 font-medium">
              {productName}
            </p>
          )}

          <p className="text-xs sm:text-sm text-neutral-darker mb-4 sm:mb-5">
            Chia sẻ trải nghiệm của bạn về sản phẩm
          </p>

          {/* Stars — smaller on mobile */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              >
                <Star
                  className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-150 ${
                    s <= active
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]"
                      : "fill-neutral text-neutral-dark"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating label */}
          <p className="text-center text-xs sm:text-sm font-medium text-neutral-darker mb-3 sm:mb-4 h-4 sm:h-5">
            {labels[active]}
          </p>

          {/* Textarea */}
          <div className="relative mb-1.5 sm:mb-2">
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (e.target.value.trim()) setCommentError("");
              }}
              placeholder="Nhập nội dung đánh giá..."
              maxLength={1000}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-xl text-xs sm:text-sm text-primary
                placeholder:text-neutral-dark bg-neutral-light focus:outline-none resize-none
                transition-colors duration-150 leading-relaxed
                ${commentError ? "border-red-400 focus:border-red-400" : "border-neutral focus:border-neutral-darker"}`}
            />
            <span className="absolute bottom-2.5 right-3 text-[10px] sm:text-[11px] text-neutral-darker tabular-nums">
              {comment.length}/1000
            </span>
          </div>

          {commentError && (
            <p className="text-[11px] sm:text-xs text-red-500 mt-0.5 mb-1.5 sm:mb-2">
              {commentError}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 sm:gap-2.5 mt-4 sm:mt-5">
            <button
              onClick={handleClose}
              className="flex-1 py-2 sm:py-2.5 rounded-xl border border-neutral text-primary
                text-xs sm:text-sm font-medium hover:bg-neutral transition-colors duration-150 cursor-pointer"
            >
              Hủy
            </button>
            <button
              disabled={loading}
              onClick={submit}
              className="flex-1 py-2 sm:py-2.5 rounded-xl bg-promotion hover:bg-promotion-hover text-white
                text-xs sm:text-sm font-semibold transition-colors duration-150
                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                flex items-center justify-center gap-1.5 sm:gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi đánh giá"
              )}
            </button>
          </div>
        </div>
      }
    />
  );
}
