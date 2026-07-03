"use client";

import { useRef } from "react";
import type { SlidezyProps } from "./types";
import { useSlideGeometry } from "./hooks/useSlideGeometry";
import { useResponsiveConfig } from "./hooks/useResponsiveConfig";
import { useSlidePosition } from "./hooks/useSlidePosition";
import { useSlideNavigation } from "./hooks/useSlideNavigation";
import { useAutoplay } from "./hooks/useAutoplay";
import { useDrag } from "./hooks/useDrag";
import { SlideTrack } from "./ui/SlideTrack";
import { SlideArrows } from "./ui/SlideArrows";
import { SlideDots } from "./ui/SlideDots";

export default function Slidezy({
  children,
  items = 1,
  speed = 300,
  gap = 0,
  loop = false,
  nav = true,
  controls = true,
  controlsText = ["‹", "›"],
  controlsOffset = "0",
  slideBy = 1,
  autoplay = false,
  autoplayTimeout = 3000,
  autoplayHoverPause = true,
  draggable = true,
  mobileNav,
  className = "",
  onSlideChange,
}: SlidezyProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive: số item hiển thị, hiện controls, mobile hay không, offset an toàn của arrow
  const { itemsCount, showControls, isMobile, safeOffsetPx, arrowsWrapperRef } = useResponsiveConfig({ items, controls, controlsOffset });

  // Hình học: danh sách slide (kèm clone cho loop), số trang, chỉ số tối đa...
  const { slideCount, actualItemsCount, showNav, cloneCount, slides, maxIndex, slideByValue } = useSlideGeometry({ children, itemsCount, loop, slideBy });

  // Vị trí track: translateX theo index, quy đổi index thật khi có clone
  const { getTranslateX, updatePosition, getRealIndex } = useSlidePosition({ trackRef, gap, itemsCount, speed, loop, cloneCount, slideCount });

  // Điều hướng: currentIndex/isAnimating, moveSlide theo step, goToSlide theo trang
  const { currentIndex, isAnimating, currentIndexRef, moveSlide, moveSlideRef, goToSlide, setCurrentIndex } = useSlideNavigation({
    loop,
    cloneCount,
    slideCount,
    maxIndex,
    slideByValue,
    itemsCount,
    showNav,
    speed,
    trackRef,
    updatePosition,
    getRealIndex,
    onSlideChange,
  });

  // Autoplay — tự chạy khi bật, dừng khi hover nếu autoplayHoverPause
  useAutoplay({
    autoplay,
    autoplayTimeout,
    autoplayHoverPause,
    showNav,
    loop,
    maxIndex,
    slideByValue,
    containerRef,
    currentIndexRef,
    moveSlideRef,
    setCurrentIndex,
    updatePosition,
  });

  // Kéo bằng mouse/touch để chuyển slide
  const { isDragging, didDragRef, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave, handleTouchStart, handleTouchMove, handleTouchEnd } = useDrag({
    draggable,
    isAnimating,
    currentIndex,
    actualItemsCount,
    maxIndex,
    loop,
    slideByValue,
    trackRef,
    getTranslateX,
    updatePosition,
    moveSlide,
  });

  const pageCount = Math.ceil((slideCount - actualItemsCount + 1) / slideByValue);
  const realCurrentIndex = getRealIndex(currentIndex);
  const activePage = Math.min(Math.floor(realCurrentIndex / slideByValue), pageCount - 1);

  // Trên mobile, dots/none override controls; arrows thì theo showControls bình thường
  const effectiveShowControls = isMobile && (mobileNav === "dots" || mobileNav === "none") ? false : showControls;
  const showDots = showNav && ((isMobile && mobileNav === "dots") || (!isMobile && nav));
  const showArrows = showNav && effectiveShowControls;

  const atStart = !loop && realCurrentIndex <= 0;
  const atEnd = !loop && realCurrentIndex >= slideCount - actualItemsCount;

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {/* Anchor duy nhất cho vị trí absolute của arrow — cần gắn ref để tính safeOffsetPx */}
      <div ref={arrowsWrapperRef} className="relative">
        <SlideTrack
          trackRef={trackRef}
          slides={slides}
          gap={gap}
          actualItemsCount={actualItemsCount}
          draggable={draggable}
          isDragging={isDragging}
          didDragRef={didDragRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {showArrows && (
          <SlideArrows
            onPrev={() => moveSlide(-slideByValue)}
            onNext={() => moveSlide(slideByValue)}
            disabled={isAnimating}
            atStart={atStart}
            atEnd={atEnd}
            controlsText={controlsText}
            offsetPx={safeOffsetPx}
          />
        )}
      </div>

      {/* Dots đặt ngoài wrapper arrow — không ảnh hưởng canh giữa của arrow */}
      {showDots && <SlideDots pageCount={pageCount} activePage={activePage} isAnimating={isAnimating} onSelect={goToSlide} />}
    </div>
  );
}
