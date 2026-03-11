"use client";

import { Star } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import apiRequest from "@/lib/api";
import { useToasty } from "@/components/Toast";
import { Popzy } from "@/components/Modal";
import { ProductDetail } from "@/lib/types/product";

interface RatingSummaryProps {
  slug: string; // ✅ đổi từ productId → slug cho đúng với cách dùng
  rating: {
    average: number;
    total: number;
    distribution: Record<string, number>;
  };
}

interface ReviewPermission {
  canReview: boolean;
  orderItemId?: string;
}

export default function RatingSummary({ slug, rating }: RatingSummaryProps) {
  const toasty = useToasty();

  const [showModal, setShowModal] = useState(false);
  const [permission, setPermission] = useState<ReviewPermission>({
    canReview: false,
  });

  // ───────────────── fetch review permission
  useEffect(() => {
    if (!slug) return;

    const fetchPermission = async () => {
      try {
        const res = await apiRequest.get<{ data: ProductDetail }>(
          `/products/slug/${slug}`,
        );

        const product = res.data;

        setPermission({
          canReview: product.canReview,
          orderItemId: product.orderItemId ?? undefined,
        });
      } catch {
        setPermission({ canReview: false });
      }
    };

    fetchPermission();
  }, [slug]);

  // ───────────────── rating breakdown
  const breakdown = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => ({
      stars: star,
      count: rating.distribution[star] ?? 0,
    }));
  }, [rating]);

  const maxCount = Math.max(...breakdown.map((r) => r.count), 1);

  const handleWriteReview = () => {
    if (!permission.canReview || !permission.orderItemId) {
      toasty.warning("Bạn cần mua sản phẩm này để có thể đánh giá");
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-primary">
          Đánh giá và bình luận
        </h2>

        <div className="flex flex-col sm:flex-row gap-10 mb-6">
          {/* LEFT */}
          <div className="flex flex-col items-center">
            <div className="text-6xl font-bold text-primary mb-2">
              {rating.average.toFixed(1)}
            </div>

            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
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
              className="px-6 py-2 bg-promotion text-white rounded-full hover:bg-promotion-hover cursor-pointer"
            >
              Đánh giá sản phẩm
            </button>
          </div>

          {/* RIGHT */}
          <div className="flex-1">
            {breakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3 mb-2">
                <span className="text-sm w-8 text-neutral-darker">
                  {item.stars} ⭐
                </span>

                <div className="flex-1 h-2 bg-neutral rounded-full overflow-hidden">
                  <div
                    className="h-full bg-promotion rounded-full"
                    style={{
                      width: `${(item.count / maxCount) * 100}%`,
                    }}
                  />
                </div>

                <span className="text-sm text-neutral-darker w-8 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Popzy
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        closeMethods={["button", "overlay", "escape"]}
        content={
          permission.orderItemId && (
            <ReviewForm
              orderItemId={permission.orderItemId}
              onClose={() => setShowModal(false)}
            />
          )
        }
      />
    </>
  );
}

// ───────────────── Review Form
function ReviewForm({
  orderItemId,
  onClose,
}: {
  orderItemId: string;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const toasty = useToasty();

  const submit = async () => {
    if (!rating) {
      toasty.warning("Vui lòng chọn số sao");
      return;
    }

    if (!comment.trim()) {
      toasty.warning("Vui lòng nhập nội dung đánh giá");
      return;
    }

    try {
      setLoading(true);

      await apiRequest.post("/reviews", {
        orderItemId,
        rating,
        comment,
      });

      toasty.success("Đánh giá thành công!");
      onClose();
    } catch (err: any) {
      toasty.error(err?.message || "Không thể gửi đánh giá");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-2 px-1">
  {/* Header */}
  <h3 className="text-base font-semibold text-primary mb-1">Đánh giá sản phẩm</h3>
  <p className="text-sm text-neutral-darker mb-5">Chia sẻ trải nghiệm của bạn về sản phẩm</p>

  {/* Stars */}
  <div className="flex justify-center gap-3 mb-2">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        onClick={() => setRating(s)}
        onMouseEnter={() => setHover(s)}
        onMouseLeave={() => setHover(0)}
        className="transition-transform hover:scale-110 active:scale-95"
      >
        <Star
          className={`w-10 h-10 transition-colors duration-150 ${
            s <= (hover || rating)
              ? "fill-accent text-accent drop-shadow-[0_0_6px_rgba(var(--color-accent),0.5)]"
              : "text-neutral-dark"
          }`}
        />
      </button>
    ))}
  </div>

  {/* Rating label */}
  {(() => {
    const labels = ["", "Rất tệ", "Không tốt", "Bình thường", "Tốt", "Xuất sắc"];
    const active = hover || rating;
    return (
      <p className={`text-center text-sm font-medium mb-5 h-5 transition-opacity duration-150 ${active ? "text-accent opacity-100" : "opacity-0"}`}>
        {labels[active]}
      </p>
    );
  })()}

  {/* Textarea */}
  <div className="relative mb-2">
    <textarea
      rows={4}
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      placeholder="Nhập nội dung đánh giá..."
      maxLength={1000}
      className="w-full px-4 py-3 border border-neutral rounded-xl text-sm text-primary placeholder:text-neutral-dark bg-neutral-light focus:outline-none focus:border-neutral-darker resize-none transition-colors duration-150 leading-relaxed"
    />
    <span className="absolute bottom-3 right-3 text-[11px] text-neutral-darker tabular-nums">
      {comment.length}/1000
    </span>
  </div>

  {/* Actions */}
  <div className="flex gap-2.5 mt-5">
    <button
      onClick={onClose}
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
  );
}
