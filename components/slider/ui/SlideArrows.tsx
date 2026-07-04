import { memo } from "react";

interface SlideArrowsProps {
  onPrev: () => void;
  onNext: () => void;
  disabled: boolean;
  atStart: boolean;
  atEnd: boolean;
  controlsText: [string, string];
  offsetPx: number;
}

export const SlideArrows = memo(function SlideArrows({ onPrev, onNext, disabled, atStart, atEnd, controlsText, offsetPx }: SlideArrowsProps) {
  return (
    <>
      <button
        onClick={onPrev}
        disabled={disabled || atStart}
        className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-2xl text-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10 cursor-pointer"
        style={{ left: offsetPx > 0 ? `-${offsetPx + 20}px` : "0px" }}
        aria-label="Previous slide"
      >
        {controlsText[0]}
      </button>
      <button
        onClick={onNext}
        disabled={disabled || atEnd}
        className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-2xl text-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10 cursor-pointer"
        style={{ right: offsetPx > 0 ? `-${offsetPx + 20}px` : "0px" }}
        aria-label="Next slide"
      >
        {controlsText[1]}
      </button>
    </>
  );
});
