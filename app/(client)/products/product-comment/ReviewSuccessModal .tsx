import { Popzy } from "@/components/Modal";
import { Star } from "lucide-react";

export default function ReviewSuccessModal({
  isOpen,
  stars,
  onClose,
}: {
  isOpen: boolean;
  stars: number;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes rsCheckDraw { from { stroke-dashoffset: 60 } to { stroke-dashoffset: 0 } }
        @keyframes rsCirclePop { from { transform: scale(0.5); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes rsFadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes rsStarPop {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0 }
          70%  { transform: scale(1.2) rotate(5deg); opacity: 1 }
          100% { transform: scale(1) rotate(0deg); opacity: 1 }
        }
      `}</style>

      <Popzy
        key={isOpen ? "open" : "closed"}
        isOpen={isOpen}
        onClose={onClose}
        closeMethods={["button", "overlay", "escape"]}
        footer={false}
        cssClass="max-w-[360px] w-full mx-4 sm:mx-auto"
        content={
          <div className="py-3 sm:py-4 px-0.5 sm:px-1 flex flex-col items-center text-center">
            {/* Check circle */}
            <div
              style={{
                width: 60,
                height: 60,
                marginBottom: "1rem",
                animation:
                  "rsCirclePop .4s .2s cubic-bezier(.34,1.56,.64,1) both",
              }}
              className="sm:!w-[72px] sm:!h-[72px]"
            >
              <svg
                viewBox="0 0 72 72"
                fill="none"
                style={{ width: "100%", height: "100%" }}
              >
                <circle
                  cx="36"
                  cy="36"
                  r="34"
                  fill="#f2f3f3"
                  style={{ stroke: "var(--color-accent)" }}
                  strokeWidth="1.5"
                />
                <polyline
                  points="22,37 32,47 50,27"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: "60",
                    animation:
                      "rsCheckDraw .4s .38s cubic-bezier(.4,0,.2,1) both",
                    stroke: "var(--color-accent)",
                  }}
                />
              </svg>
            </div>

            {/* Title */}
            <p
              className="text-base sm:text-lg font-semibold text-primary mb-1 sm:mb-1.5"
              style={{ animation: "rsFadeUp .35s .45s both" }}
            >
              Đánh giá thành công!
            </p>

            {/* Subtitle */}
            <p
              className="text-xs sm:text-sm text-neutral-darker mb-4 sm:mb-5 leading-relaxed"
              style={{ animation: "rsFadeUp .35s .5s both" }}
            >
              Cảm ơn bạn đã chia sẻ nhận xét.
              <br />
              Đánh giá của bạn giúp ích cho nhiều người.
            </p>

            {/* Stars */}
            <div className="flex gap-1 sm:gap-1.5 mb-4 sm:mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  style={{
                    animation: `rsStarPop .4s ${0.55 + (s - 1) * 0.07}s cubic-bezier(.34,1.56,.64,1) both`,
                  }}
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${s <= stars ? "fill-yellow-400 text-yellow-400" : "text-neutral-dark"}`}
                />
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{ animation: "rsFadeUp .35s .9s both" }}
              className="w-full py-2 sm:py-2.5 rounded-xl border border-neutral text-primary
                text-xs sm:text-sm font-medium hover:bg-neutral transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        }
      />
    </>
  );
}
