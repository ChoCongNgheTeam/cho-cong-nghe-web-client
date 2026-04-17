// components/Slidezy/Slidezy.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback, Children } from "react";
import { SlidezyOptions } from "./types";

interface SlidezyProps extends SlidezyOptions {
  children: React.ReactNode;
  /**
   * Offset for prev/next arrow buttons.
   * e.g. controlsOffset="-4" → left-[-16px] / right-[-16px] (đè ra ngoài container)
   * Default: "0" (nằm sát mép)
   */
  controlsOffset?: string;
  /**
   * Điều khiển navigation trên mobile (< 480px).
   * - "dots"   → hiển thị dot indicator (phù hợp banner)
   * - "none"   → ẩn hoàn toàn, chỉ drag (phù hợp product grid)
   * - "arrows" → giữ nguyên arrow (mặc định khi không set)
   * Khi set mobileNav, prop nav/controls trên mobile sẽ bị override.
   */
  mobileNav?: "dots" | "none" | "arrows";
}

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInitializedRef = useRef(false);
  const didDragRef = useRef(false);

  const [showControls, setShowControls] = useState(true);

  // ─── Responsive items count ───────────────────────────────────────────────

  const getItemsCount = useCallback(() => {
    if (typeof items === "number") return items;
    if (typeof window === "undefined") return typeof items === "object" ? (items.desktop ?? 3) : 1;
    const width = window.innerWidth;
    if (width < 480) return items.mobile ?? 1;
    if (width < 768) return items.tablet ?? 2;
    if (width < 1024) return items.lg ?? 3;
    return items.desktop ?? 4;
  }, [items]);

  const [itemsCount, setItemsCount] = useState(() => {
    if (typeof items === "number") return items;
    return typeof items === "object" ? (items.desktop ?? 3) : 1;
  });

  // ─── Derived values ───────────────────────────────────────────────────────

  const originalSlides = Children.toArray(children);
  const slideCount = originalSlides.length;
  const actualItemsCount = Math.min(itemsCount, slideCount);
  const showNav = slideCount > actualItemsCount;

  const cloneCount = loop && slideCount > actualItemsCount ? Math.max(actualItemsCount, slideBy === "page" ? actualItemsCount : typeof slideBy === "number" ? slideBy : 1) : 0;

  const slides = (() => {
    if (!loop || cloneCount === 0) return originalSlides;
    const cloneHead = originalSlides.slice(-cloneCount);
    const cloneTail = originalSlides.slice(0, cloneCount);
    return [...cloneHead, ...originalSlides, ...cloneTail];
  })();

  const maxIndex = loop ? slides.length : slideCount - itemsCount;
  const slideByValue = slideBy === "page" ? actualItemsCount : typeof slideBy === "number" ? slideBy : 1;

  // ─── Position helpers ─────────────────────────────────────────────────────

  const getTranslateX = useCallback(
    (index: number) => {
      if (!trackRef.current) return 0;
      const containerWidth = trackRef.current.offsetWidth;
      const slideWidth = (containerWidth + gap) / itemsCount;
      return -(index * slideWidth);
    },
    [gap, itemsCount],
  );

  const updatePosition = useCallback(
    (index: number, instant = false) => {
      if (!trackRef.current) return;
      const track = trackRef.current;
      track.style.transition = instant ? "none" : `transform ${speed}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      track.style.transform = `translateX(${getTranslateX(index)}px)`;
    },
    [getTranslateX, speed],
  );

  const getRealIndex = useCallback(
    (index: number) => {
      if (!loop || cloneCount === 0) return index;
      let realIndex = index - cloneCount;
      if (realIndex < 0) realIndex = slideCount + (realIndex % slideCount);
      else if (realIndex >= slideCount) realIndex = realIndex % slideCount;
      return realIndex;
    },
    [loop, cloneCount, slideCount],
  );

  // ─── Move / GoTo ──────────────────────────────────────────────────────────

  // Dùng ref để tránh stale closure trong handleDragEnd mà không cần
  // đưa moveSlide vào dependency array (fix React Compiler warning)
  const moveSlideRef = useRef<(step: number) => void>(() => {});

  const moveSlide = useCallback(
    (step: number) => {
      if (isAnimating || !showNav) return;
      setIsAnimating(true);

      let newIndex = currentIndex + step;
      if (!loop) newIndex = Math.max(0, Math.min(newIndex, maxIndex));

      setCurrentIndex(newIndex);
      updatePosition(newIndex);

      setTimeout(() => {
        if (loop && cloneCount > 0) {
          let resetIndex: number | null = null;
          if (newIndex < cloneCount) resetIndex = newIndex + slideCount;
          else if (newIndex >= cloneCount + slideCount) resetIndex = newIndex - slideCount;

          if (resetIndex !== null) {
            setCurrentIndex(resetIndex);
            requestAnimationFrame(() => updatePosition(resetIndex!, true));
          }
        }
        setIsAnimating(false);
      }, speed);

      onSlideChange?.(getRealIndex(newIndex));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIndex, isAnimating, showNav, loop, cloneCount, slideCount, maxIndex, speed, updatePosition, getRealIndex, onSlideChange],
  );

  // Sync ref mỗi lần moveSlide thay đổi
  useEffect(() => {
    moveSlideRef.current = moveSlide;
  }, [moveSlide]);

  const goToSlide = useCallback(
    (realIndex: number) => {
      if (isAnimating || !showNav) return;
      setIsAnimating(true);
      const targetIndex = loop && cloneCount > 0 ? realIndex + cloneCount : realIndex;
      setCurrentIndex(targetIndex);
      updatePosition(targetIndex);
      onSlideChange?.(realIndex);
      setTimeout(() => setIsAnimating(false), speed);
    },
    [isAnimating, showNav, loop, cloneCount, speed, updatePosition, onSlideChange],
  );

  // ─── Controls visibility ──────────────────────────────────────────────────

  useEffect(() => {
    const update = () => {
      if (typeof controls === "boolean") {
        setShowControls(controls);
        return;
      }
      const width = window.innerWidth;
      if (width < 480) setShowControls(controls.mobile ?? false);
      else if (width < 768) setShowControls(controls.tablet ?? false);
      else if (width < 1024) setShowControls(controls.lg ?? true);
      else setShowControls(controls.desktop ?? true);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [controls]);

  // ─── Mobile detection ─────────────────────────────────────────────────────

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 480);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ─── Responsive items ─────────────────────────────────────────────────────

  useEffect(() => {
    if (typeof items !== "object") return;
    const updateItemsCount = () => {
      const newCount = getItemsCount();
      if (newCount !== itemsCount) {
        setItemsCount(newCount);
        const initialIndex = loop && cloneCount > 0 ? cloneCount : 0;
        setCurrentIndex(initialIndex);
        isInitializedRef.current = false;
      }
    };
    updateItemsCount();
    window.addEventListener("resize", updateItemsCount);
    return () => window.removeEventListener("resize", updateItemsCount);
  }, [items, getItemsCount, itemsCount, loop, cloneCount]);

  // ─── Initialize position ──────────────────────────────────────────────────

  useEffect(() => {
    if (!isInitializedRef.current && trackRef.current) {
      const initialIndex = loop && cloneCount > 0 ? cloneCount : 0;
      setCurrentIndex(initialIndex);
      setTimeout(() => {
        updatePosition(initialIndex, true);
        isInitializedRef.current = true;
      }, 0);
    }
  }, [loop, cloneCount, updatePosition]);

  // ─── Reposition on resize ─────────────────────────────────────────────────

  useEffect(() => {
    const handleReposition = () => {
      if (trackRef.current && isInitializedRef.current) updatePosition(currentIndex, true);
    };
    window.addEventListener("resize", handleReposition);
    return () => window.removeEventListener("resize", handleReposition);
  }, [currentIndex, updatePosition]);

  // ─── Autoplay ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!autoplay || !showNav || !isInitializedRef.current) return;

    const startAutoplay = () => {
      if (autoplayTimerRef.current) return;
      autoplayTimerRef.current = setInterval(() => {
        if (!loop && currentIndex >= maxIndex) {
          setCurrentIndex(0);
          updatePosition(0);
        } else {
          moveSlideRef.current(slideByValue);
        }
      }, autoplayTimeout);
    };

    const stopAutoplay = () => {
      if (autoplayTimerRef.current !== null) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };

    startAutoplay();

    if (autoplayHoverPause && containerRef.current) {
      const container = containerRef.current;
      container.addEventListener("mouseenter", stopAutoplay);
      container.addEventListener("mouseleave", startAutoplay);
      return () => {
        container.removeEventListener("mouseenter", stopAutoplay);
        container.removeEventListener("mouseleave", startAutoplay);
        stopAutoplay();
      };
    }

    return () => stopAutoplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, autoplayTimeout, autoplayHoverPause, showNav, slideByValue, loop, currentIndex, maxIndex, updatePosition]);

  // ─── Drag ─────────────────────────────────────────────────────────────────

  const handleDragStart = useCallback(
    (clientX: number) => {
      if (!draggable || isAnimating || !trackRef.current) return;
      setIsDragging(true);
      setStartX(clientX);
      setDragOffset(0);
      didDragRef.current = false;
      trackRef.current.style.transition = "none";
    },
    [draggable, isAnimating],
  );

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !trackRef.current) return;
      const diff = clientX - startX;
      setDragOffset(diff);
      if (Math.abs(diff) > 8) didDragRef.current = true;
      trackRef.current.style.transform = `translateX(${getTranslateX(currentIndex) + diff}px)`;
    },
    [isDragging, startX, currentIndex, getTranslateX],
  );

  // Fix React Compiler warning: handleDragEnd không còn phụ thuộc vào
  // moveSlide trực tiếp — gọi qua moveSlideRef thay thế.
  const handleDragEnd = useCallback(() => {
    if (!isDragging || !trackRef.current) return;
    setIsDragging(false);

    const containerWidth = trackRef.current.offsetWidth;
    const threshold = containerWidth / actualItemsCount / 3;

    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset < 0) {
        if (loop || currentIndex < maxIndex) moveSlideRef.current(slideByValue);
        else updatePosition(currentIndex);
      } else {
        if (loop || currentIndex > 0) moveSlideRef.current(-slideByValue);
        else updatePosition(currentIndex);
      }
    } else {
      updatePosition(currentIndex);
    }

    setDragOffset(0);
  }, [isDragging, dragOffset, currentIndex, maxIndex, actualItemsCount, loop, slideByValue, updatePosition]);

  // ─── Event handlers ───────────────────────────────────────────────────────

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };
  const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const handleMouseUp = () => handleDragEnd();
  const handleMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };
  const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const handleTouchEnd = () => handleDragEnd();

  // ─── Nav dots state ───────────────────────────────────────────────────────

  const pageCount = Math.ceil(slideCount / actualItemsCount);
  const getActivePage = () => Math.floor(getRealIndex(currentIndex) / actualItemsCount);

  // ─── Resolve effective nav/controls on mobile ─────────────────────────────

  const effectiveShowControls = isMobile && mobileNav === "dots" ? false : isMobile && mobileNav === "none" ? false : isMobile && mobileNav === "arrows" ? showControls : showControls;

  const showDots = showNav && ((isMobile && mobileNav === "dots") || (!isMobile && nav));

  const showArrows = showNav && effectiveShowControls;

  // ─── Arrow offset (px) ───────────────────────────────────────────────────

  const offsetPx = controlsOffset !== "0" ? Math.abs(Number(controlsOffset.replace("-", ""))) : 0;

  // ─── Render ───────────────────────────────────────────────────────────────
  //
  // Cấu trúc 3 lớp để giải quyết xung đột overflow-hidden vs arrow nổi ra ngoài:
  //
  //  ┌─ containerRef (w-full, relative)           ← arrow absolute ở đây
  //  │   ┌─ clip-wrapper (overflow-hidden)        ← chỉ clip track
  //  │   │   └─ trackRef (flex)
  //  │   └─ /clip-wrapper
  //  │   [prev button]  [next button]             ← không bị clip
  //  └─ /containerRef

  return (
    <div ref={containerRef} className={`w-full relative ${className}`}>
      {/* Clip wrapper — chỉ bao track, không bao arrow */}
      <div className="overflow-hidden p-1">
        {/* Track */}
        <div
          ref={trackRef}
          className="flex"
          style={{
            gap: `${gap}px`,
            cursor: draggable ? (isDragging ? "grabbing" : "grab") : "default",
            userSelect: "none",
            WebkitUserSelect: "none",
            touchAction: "pan-y",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClickCapture={(e) => {
            if (didDragRef.current) {
              e.preventDefault();
              e.stopPropagation();
              didDragRef.current = false;
            }
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={`slide-${index}`}
              className="shrink-0"
              style={{
                width: `calc((100% - ${gap * (actualItemsCount - 1)}px) / ${actualItemsCount})`,
              }}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Arrow controls — nằm ngoài clip-wrapper, absolute so với containerRef */}
      {showArrows && (
        <>
          <button
            onClick={() => moveSlide(-slideByValue)}
            disabled={isAnimating || (!loop && currentIndex === 0)}
            className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-2xl text-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10 cursor-pointer"
            style={{ left: offsetPx > 0 ? `-${offsetPx + 20}px` : "0px" }}
            aria-label="Previous slide"
          >
            {controlsText[0]}
          </button>
          <button
            onClick={() => moveSlide(slideByValue)}
            disabled={isAnimating || (!loop && currentIndex >= maxIndex)}
            className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-2xl text-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10 cursor-pointer"
            style={{ right: offsetPx > 0 ? `-${offsetPx + 20}px` : "0px" }}
            aria-label="Next slide"
          >
            {controlsText[1]}
          </button>
        </>
      )}

      {/* Dots - hiện khi nav=true (desktop) hoặc mobileNav="dots" (mobile) */}
      {showDots && (
        <div className="flex items-center justify-center gap-2 my-4">
          {Array.from({ length: pageCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index * actualItemsCount)}
              disabled={isAnimating}
              className={`h-2 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${getActivePage() === index ? "w-8 bg-gray-800" : "w-2 bg-gray-300 hover:bg-gray-400"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
