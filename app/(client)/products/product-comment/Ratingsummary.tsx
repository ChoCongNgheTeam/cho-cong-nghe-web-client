"use client";

import { Star } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import apiRequest from "@/lib/api";
import { useToasty } from "@/components/Toast";
import ReviewModal from "@/(client)/(protected)/profile/orders/components/ReviewModal";
import { ProductDetail } from "@/lib/types/product";

interface RatingSummaryProps {
  slug: string;
  rating: {
    average: number;
    total: number;
    distribution: Record<string, number>;
  };
  product: ProductDetail;
}

interface ReviewPermission {
  canReview: boolean;
  orderItemId?: string;
}

export default function RatingSummary({ slug, rating, product }: RatingSummaryProps) {
  const toasty = useToasty();

  const [showModal, setShowModal] = useState(false);
  const [permission, setPermission] = useState<ReviewPermission>({ canReview: false });

  useEffect(() => {
    if (!slug) return;
    const fetchPermission = async () => {
      try {
        const res = await apiRequest.get<{ data: ProductDetail }>(`/products/slug/${slug}`);
        const p = res.data;
        setPermission({ canReview: p.canReview, orderItemId: p.orderItemId ?? undefined });
      } catch {
        setPermission({ canReview: false });
      }
    };
    fetchPermission();
  }, [slug]);

  const breakdown = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => ({
      stars: star,
      count: rating.distribution[star] ?? 0,
    }));
  }, [rating]);

  const maxCount  = Math.max(...breakdown.map((r) => r.count), 1);
  const hasReviews = rating.total > 0;

  const handleWriteReview = () => {
    if (!permission.orderItemId) {
      toasty.warning("Bạn cần mua sản phẩm này để có thể đánh giá", {
        duration: 3000,
        showProgress: true,
      });
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <style>{`
        @keyframes ratingFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ratingStarIn {
          from { opacity: 0; transform: scale(0.4) rotate(-15deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes ratingShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .rs-star-1 { animation: ratingStarIn .4s .06s cubic-bezier(.34,1.56,.64,1) both; }
        .rs-star-2 { animation: ratingStarIn .4s .13s cubic-bezier(.34,1.56,.64,1) both; }
        .rs-star-3 { animation: ratingStarIn .4s .20s cubic-bezier(.34,1.56,.64,1) both; }
        .rs-star-4 { animation: ratingStarIn .4s .27s cubic-bezier(.34,1.56,.64,1) both; }
        .rs-star-5 { animation: ratingStarIn .4s .34s cubic-bezier(.34,1.56,.64,1) both; }
        .rs-title {
          background: linear-gradient(90deg, #9ca3af 0%, #111827 35%, #9ca3af 65%, #9ca3af 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ratingFadeUp .4s .42s both, ratingShimmer 3.5s 1s linear infinite;
        }
        .rs-sub { animation: ratingFadeUp .4s .52s both; }
        .rs-btn { animation: ratingFadeUp .4s .62s both; }
      `}</style>

      <div>
        <h2 className="text-2xl font-semibold mb-6 text-primary">
          Đánh giá {product.name} | Chính hãng
        </h2>

        <div className={`flex ${hasReviews ? "flex-col sm:flex-row gap-10" : "flex-col items-center"}`}>
          {/* LEFT */}
          <div className="flex flex-col items-center justify-center">
            {hasReviews ? (
              <>
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
                  className="px-6 py-2 bg-promotion text-white rounded-full hover:bg-promotion-hover cursor-pointer transition-colors"
                >
                  Đánh giá sản phẩm
                </button>
              </>
            ) : (
              /* ── Empty state ── */
              <div className="flex flex-col items-center gap-3 py-6">
                {/* Sao pop lần lượt */}
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`rs-star-${s} w-7 h-7 text-neutral-dark`}
                      strokeWidth={1.6}
                    />
                  ))}
                </div>

                {/* Text shimmer */}
                <p className="rs-title text-sm font-medium text-center">
                  Chưa có đánh giá nào
                </p>

                {/* Sub text fade up */}
                <p className="rs-sub text-xs text-neutral-darker opacity-70 text-center">
                  Hãy là người đầu tiên đánh giá sản phẩm này!
                </p>

                {/* Nút fade up sau cùng */}
                <button
                  onClick={handleWriteReview}
                  className="rs-btn mt-1 px-6 py-2 bg-promotion text-white rounded-full hover:bg-promotion-hover cursor-pointer transition-colors"
                >
                  Đánh giá sản phẩm
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — chỉ hiện khi có đánh giá */}
          {hasReviews && (
            <div className="flex-1">
              {breakdown.map((item) => (
                <div key={item.stars} className="flex items-center gap-3 mb-2">
                  <div className="w-10 flex items-center justify-end gap-1 text-sm text-neutral-darker">
                    <span>{item.stars}</span>
                    <span>⭐</span>
                  </div>
                  <div className="flex-1 h-2 bg-neutral rounded-full overflow-hidden">
                    <div
                      className="h-full bg-promotion rounded-full"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-neutral-darker w-8 text-right">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {permission.orderItemId && (
        <ReviewModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          orderItemId={permission.orderItemId}
          productName={product.name}
          onSuccess={() => setPermission((prev) => ({ ...prev, canReview: false }))}
        />
      )}
    </>
  );
}