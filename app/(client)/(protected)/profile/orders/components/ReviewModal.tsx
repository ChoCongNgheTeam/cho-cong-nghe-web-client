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
  onSuccess?: () => void;
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
  const toasty = useToasty();

  const [commentError, setCommentError] = useState("");

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
      toasty.success("Đánh giá thành công!", {
        title: "Cảm ơn bạn!",
        duration: 3000,
        showProgress: true,
      });
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      const message = err?.message || err?.response?.data?.message || "";
      if (message.includes("đã đánh giá")) {
        toasty.warning("Bạn đã đánh giá sản phẩm này rồi", {
          title: "Đã đánh giá",
          duration: 3000,
          showProgress: true,
        });
        onSuccess?.(); // cập nhật UI về trạng thái đã review
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
      content={
        <div className="py-2 px-1">
          <h3 className="text-base font-semibold text-primary mb-1">
            Đánh giá sản phẩm
          </h3>
          {productName && (
            <p className="text-sm text-neutral-darker mb-1 line-clamp-1 font-medium">
              {productName}
            </p>
          )}
          <p className="text-sm text-neutral-darker mb-5">
            Chia sẻ trải nghiệm của bạn về sản phẩm
          </p>

          {/* Stars */}
          <div className="flex justify-center gap-3 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setRating(s);
                }}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-10 h-10 transition-colors duration-150 ${
                    s <= active
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]"
                      : "fill-neutral text-neutral-dark"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Textarea */}
          <div className="relative mb-2">
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (e.target.value.trim()) setCommentError("");
              }}
              placeholder="Nhập nội dung đánh giá..."
              maxLength={1000}
              className={`w-full px-4 py-3 border rounded-xl text-sm text-primary placeholder:text-neutral-dark bg-neutral-light focus:outline-none resize-none transition-colors duration-150 leading-relaxed ${
                commentError
                  ? "border-red-400 focus:border-red-400"
                  : "border-neutral focus:border-neutral-darker"
              }`}
            />
            <span className="absolute bottom-3 right-3 text-[11px] text-neutral-darker tabular-nums">
              {comment.length}/1000
            </span>
          </div>
          {commentError && (
            <p className="text-xs text-red-500 mt-1 mb-2">{commentError}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 mt-5">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral text-primary text-sm font-medium hover:bg-neutral transition-colors duration-150 cursor-pointer"
            >
              Hủy
            </button>
            <button
              disabled={loading}
              onClick={submit}
              className="flex-1 py-2.5 rounded-xl bg-promotion hover:bg-promotion-hover text-white text-sm font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
