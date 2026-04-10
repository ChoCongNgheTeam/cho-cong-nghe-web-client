"use client";

import { Star } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useToasty } from "@/components/Toast";
import ReviewModal from "@/(client)/(protected)/profile/orders/components/ReviewModal";
import { ProductDetail } from "@/lib/types/product";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Popzy } from "@/components/Modal";
import ReviewSuccessModal from "./ReviewSuccessModal ";
import { getReviewPermission } from "../_lib";

interface RatingSummaryProps {
  slug: string;
  rating: {
    average: number;
    total: number;
    distribution: Record<string, number>;
  };
  product: ProductDetail;
  currentVariant?: { name?: string; [key: string]: unknown };
}

interface ReviewPermission {
  canReview: boolean;
  orderItemId?: string;
}

export default function RatingSummary({ slug, rating, product, currentVariant }: RatingSummaryProps) {
  const toasty = useToasty();
  const [showModal, setShowModal] = useState(false);
  const [permission, setPermission] = useState<ReviewPermission>({ canReview: false });
  const [permissionLoaded, setPermissionLoaded] = useState(false);
  const hasTriggeredReview = useRef(false);

  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [reviewedStars, setReviewedStars] = useState<number | null>(null);
  const [localRating, setLocalRating] = useState(rating);

  useEffect(() => {
    setLocalRating(rating);
  }, [rating]);

  const fetchProductData = async () => {
    if (!slug) return;
    setPermissionLoaded(false);
    try {
      const data = await getReviewPermission(slug);
      setPermission({ canReview: data.canReview, orderItemId: data.orderItemId });
      if (data.rating) setLocalRating(data.rating);
    } catch {
      setPermission({ canReview: false });
    } finally {
      setPermissionLoaded(true);
    }
  };

  useEffect(() => {
    fetchProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isAuthenticated]);

  const breakdown = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => ({
        stars: star,
        count: localRating.distribution[star] ?? 0,
      })),
    [localRating],
  );

  const maxCount = Math.max(...breakdown.map((r) => r.count), 1);
  const hasReviews = localRating.total > 0;

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    if (!permission.orderItemId) {
      toasty.warning("Bạn cần mua sản phẩm này để có thể đánh giá", {
        duration: 3000,
        showProgress: true,
      });
      return;
    }
    if (!permission.canReview) {
      toasty.info("Bạn đã đánh giá sản phẩm này rồi", { duration: 3000, showProgress: true });
      return;
    }
    setShowModal(true);
  };

  useEffect(() => {
    if (!searchParams.get("review")) return;
    if (!isAuthenticated) return;
    if (!permissionLoaded) return;
    if (hasTriggeredReview.current) return;

    hasTriggeredReview.current = true;
    const url = new URL(window.location.href);
    url.searchParams.delete("review");
    window.history.replaceState({}, "", url.toString());

    document.getElementById("rating-summary")?.scrollIntoView({ behavior: "smooth", block: "center" });
    handleWriteReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isAuthenticated, permissionLoaded]);

  const reviewButton = (
    <button
      onClick={handleWriteReview}
      disabled={!!permission.orderItemId && !permission.canReview}
      className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors
        ${permission.orderItemId && !permission.canReview ? "bg-neutral text-primary cursor-not-allowed" : "bg-promotion hover:bg-promotion-hover text-neutral-light cursor-pointer"}`}
    >
      {permission.orderItemId && !permission.canReview ? "Bạn đã đánh giá sản phẩm này" : "Đánh giá sản phẩm"}
    </button>
  );

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

      <div id="rating-summary">
        <h2 className="text-2xl font-semibold mb-6 text-primary">Đánh giá {currentVariant?.name ?? product.name}</h2>

        <div className={`flex ${hasReviews ? "flex-col sm:flex-row gap-10" : "flex-col items-center"}`}>
          {/* LEFT */}
          <div className="flex flex-col items-center justify-center">
            {hasReviews ? (
              <>
                <div className="text-6xl font-bold text-primary mb-2">{localRating.average.toFixed(1)}</div>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-5 h-5 ${star <= Math.round(localRating.average) ? "fill-yellow-400 text-yellow-400" : "text-neutral-dark"}`} />
                  ))}
                </div>
                <div className="text-sm text-neutral-darker mb-3">{localRating.total} lượt đánh giá</div>
                {reviewButton}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`rs-star-${s} w-7 h-7 text-neutral-dark`} strokeWidth={1.6} />
                  ))}
                </div>
                <p className="rs-title text-sm font-medium text-center">Chưa có đánh giá nào</p>
                <p className="rs-sub text-xs text-neutral-darker opacity-70 text-center">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                <button onClick={handleWriteReview} className="rs-btn mt-1 px-6 py-2 bg-promotion text-white rounded-full hover:bg-promotion-hover cursor-pointer transition-colors">
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
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-neutral rounded-full overflow-hidden">
                    <div className="h-full bg-promotion rounded-full" style={{ width: `${(item.count / maxCount) * 100}%` }} />
                  </div>
                  <span className="text-sm text-neutral-darker w-8 text-right">{item.count}</span>
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
          onSuccess={(stars: number) => {
            setPermission((prev) => ({ ...prev, canReview: false }));
            setShowModal(false);
            setReviewedStars(stars);
            fetchProductData();
          }}
        />
      )}

      <Popzy
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        closeMethods={["button", "overlay", "escape"]}
        footer={false}
        cssClass="max-w-[360px] w-full"
        content={
          <div className="py-2 px-1 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent-light flex items-center justify-center">
              <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-primary mb-1">Đăng nhập để đánh giá</h3>
              <p className="text-sm text-neutral-darker">Bạn cần đăng nhập để có thể chia sẻ đánh giá về sản phẩm này.</p>
            </div>
            <div className="flex gap-2.5 w-full">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral text-primary text-sm font-medium hover:bg-neutral transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  router.push(`/account?redirect=${encodeURIComponent(pathname + "?review=true")}`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-promotion hover:bg-promotion-hover text-neutral-light text-sm font-semibold transition-colors cursor-pointer"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        }
      />

      <ReviewSuccessModal isOpen={reviewedStars !== null} stars={reviewedStars ?? 5} onClose={() => setReviewedStars(null)} />
    </>
  );
}
