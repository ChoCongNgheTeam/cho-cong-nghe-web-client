"use client";

import React, { useEffect, useRef, useState, useCallback, Children } from "react";
import { SlidezyOptions } from "./types";

interface SlidezyProps extends SlidezyOptions {
  children: React.ReactNode;
  controlsOffset?: string;
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

  const arrowsWrapperRef = useRef<HTMLDivElement>(null);
  const [safeOffsetPx, setSafeOffsetPx] = useState(0);

  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const desiredOffsetPx = controlsOffset !== "0" ? Math.abs(Number(controlsOffset.replace("-", ""))) : 0;

    const recompute = () => {
      if (!arrowsWrapperRef.current) return;
      const rect = arrowsWrapperRef.current.getBoundingClientRect();
      const desiredProtrusion = desiredOffsetPx + 20; // 20 = phần button tự nhô qua mép trong code render
      const buffer = 4; // chừa thêm chút để tránh chạm sát viền
      const spaceLeft = rect.left;
      const spaceRight = window.innerWidth - rect.right;
      const minSpace = Math.max(0, Math.min(spaceLeft, spaceRight) - buffer);
      const safeProtrusion = Math.min(desiredProtrusion, minSpace);
      setSafeOffsetPx(Math.max(0, safeProtrusion - 20));
    };

    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [controlsOffset]);

  // ─── Refs để tránh stale closure mà không cần thêm vào deps ───────────────
  // Đây là pattern chuẩn để React Compiler có thể tự optimize mà không cần

  const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const isAnimatingRef = useRef(isAnimating);
  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  const isDraggingRef = useRef(isDragging);
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  const dragOffsetRef = useRef(dragOffset);
  useEffect(() => {
    dragOffsetRef.current = dragOffset;
  }, [dragOffset]);

  // ─── Responsive items count ───────────────────────────────────────────────

  const getItemsCount = useCallback(() => {
    if (typeof items === "number") return items;
    if (typeof window === "undefined") return typeof items === "object" ? (items.desktop ?? 2) : 1;
    const width = window.innerWidth;
    if (width < 480) return items.mobile ?? 1;
    if (width < 768) return items.tablet ?? 2;
    if (width < 1024) return items.lg ?? 2;
    return items.desktop ?? 2;
  }, [items]);

  const [itemsCount, setItemsCount] = useState(() => {
    if (typeof items === "number") return items;
    return typeof items === "object" ? (items.desktop ?? 2) : 1;
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

  const maxIndex = loop ? slides.length : Math.max(0, slideCount - actualItemsCount);
  const slideByValue = slideBy === "page" ? actualItemsCount : typeof slideBy === "number" ? slideBy : 1;

  // ─── Refs cho các giá trị dùng trong autoplay/drag callbacks ─────────────

  const loopRef = useRef(loop);
  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  const cloneCountRef = useRef(cloneCount);
  useEffect(() => {
    cloneCountRef.current = cloneCount;
  }, [cloneCount]);

  const slideCountRef = useRef(slideCount);
  useEffect(() => {
    slideCountRef.current = slideCount;
  }, [slideCount]);

  const maxIndexRef = useRef(maxIndex);
  useEffect(() => {
    maxIndexRef.current = maxIndex;
  }, [maxIndex]);

  const slideByValueRef = useRef(slideByValue);
  useEffect(() => {
    slideByValueRef.current = slideByValue;
  }, [slideByValue]);

  const actualItemsCountRef = useRef(actualItemsCount);
  useEffect(() => {
    actualItemsCountRef.current = actualItemsCount;
  }, [actualItemsCount]);

  const showNavRef = useRef(showNav);
  useEffect(() => {
    showNavRef.current = showNav;
  }, [showNav]);

  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const onSlideChangeRef = useRef(onSlideChange);
  useEffect(() => {
    onSlideChangeRef.current = onSlideChange;
  }, [onSlideChange]);

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

  // ─── updatePosition ref (stable) ─────────────────────────────────────────

  const updatePositionRef = useRef(updatePosition);
  useEffect(() => {
    updatePositionRef.current = updatePosition;
  }, [updatePosition]);

  const getRealIndexRef = useRef(getRealIndex);
  useEffect(() => {
    getRealIndexRef.current = getRealIndex;
  }, [getRealIndex]);

  // ─── moveSlide — dùng hoàn toàn qua refs, không có deps nào cần eslint-disable ──

  const moveSlide = useCallback((step: number) => {
    if (isAnimatingRef.current || !showNavRef.current) return;
    setIsAnimating(true);

    const _loop = loopRef.current;
    const _cloneCount = cloneCountRef.current;
    const _slideCount = slideCountRef.current;
    const _maxIndex = maxIndexRef.current;
    const _speed = speedRef.current;

    let newIndex = currentIndexRef.current + step;
    if (!_loop) newIndex = Math.max(0, Math.min(newIndex, _maxIndex));

    setCurrentIndex(newIndex);
    updatePositionRef.current(newIndex);

    setTimeout(() => {
      if (_loop && _cloneCount > 0) {
        let resetIndex: number | null = null;
        if (newIndex < _cloneCount) resetIndex = newIndex + _slideCount;
        else if (newIndex >= _cloneCount + _slideCount) resetIndex = newIndex - _slideCount;

        if (resetIndex !== null) {
          setCurrentIndex(resetIndex);
          requestAnimationFrame(() => updatePositionRef.current(resetIndex!, true));
        }
      }
      setIsAnimating(false);
    }, _speed);

    onSlideChangeRef.current?.(getRealIndexRef.current(newIndex));
  }, []); // deps rỗng — đọc tất cả qua refs, stable hoàn toàn

  // Sync moveSlide ref cho autoplay dùng
  const moveSlideRef = useRef(moveSlide);
  useEffect(() => {
    moveSlideRef.current = moveSlide;
  }, [moveSlide]);

  const goToSlide = useCallback(
    (pageIndex: number) => {
      if (isAnimating || !showNav) return;
      setIsAnimating(true);
      const realSlideIndex = pageIndex * slideByValue;
      const targetIndex = loop && cloneCount > 0 ? realSlideIndex + cloneCount : realSlideIndex;
      setCurrentIndex(targetIndex);
      updatePosition(targetIndex);
      onSlideChange?.(realSlideIndex);
      setTimeout(() => setIsAnimating(false), speed);
    },
    [isAnimating, showNav, loop, cloneCount, slideByValue, speed, updatePosition, onSlideChange],
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
    if (!autoplay || !showNav) return;

    // Chờ initialization xong (setTimeout 0 trong init effect) rồi mới start
    const initDelay = setTimeout(() => {
      const stopAutoplay = () => {
        if (autoplayTimerRef.current !== null) {
          clearInterval(autoplayTimerRef.current);
          autoplayTimerRef.current = null;
        }
      };

      const startAutoplay = () => {
        // Luôn clear timer cũ trước khi tạo mới — tránh duplicate interval
        // và tránh closure cũ bị giữ lại sau hover/resume
        stopAutoplay();
        autoplayTimerRef.current = setInterval(() => {
          const _loop = loopRef.current;
          const _maxIndex = maxIndexRef.current;
          const _slideByValue = slideByValueRef.current;
          if (!_loop && currentIndexRef.current >= _maxIndex) {
            setCurrentIndex(0);
            updatePositionRef.current(0);
          } else {
            moveSlideRef.current(_slideByValue);
          }
        }, autoplayTimeout);
      };

      startAutoplay();

      if (autoplayHoverPause && containerRef.current) {
        const container = containerRef.current;
        container.addEventListener("mouseenter", stopAutoplay);
        container.addEventListener("mouseleave", startAutoplay);
        // cleanup được gọi khi effect re-run hoặc unmount
        return () => {
          container.removeEventListener("mouseenter", stopAutoplay);
          container.removeEventListener("mouseleave", startAutoplay);
          stopAutoplay();
        };
      }

      return () => stopAutoplay();
    }, 0);

    return () => {
      clearTimeout(initDelay);
      if (autoplayTimerRef.current !== null) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };
  }, [autoplay, autoplayTimeout, autoplayHoverPause, showNav]);
  // ↑ deps tối giản — tất cả giá trị thay đổi được đọc qua refs bên trong

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

  // handleDragEnd — dùng refs hoàn toàn, deps rỗng → React Compiler tối ưu được
  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current || !trackRef.current) return;
    setIsDragging(false);

    const containerWidth = trackRef.current.offsetWidth;
    const _actualItemsCount = actualItemsCountRef.current;
    const _dragOffset = dragOffsetRef.current;
    const _currentIndex = currentIndexRef.current;
    const _maxIndex = maxIndexRef.current;
    const _loop = loopRef.current;
    const _slideByValue = slideByValueRef.current;

    const threshold = containerWidth / _actualItemsCount / 3;

    if (Math.abs(_dragOffset) > threshold) {
      if (_dragOffset < 0) {
        if (_loop || _currentIndex < _maxIndex) moveSlideRef.current(_slideByValue);
        else updatePositionRef.current(_currentIndex);
      } else {
        if (_loop || _currentIndex > 0) moveSlideRef.current(-_slideByValue);
        else updatePositionRef.current(_currentIndex);
      }
    } else {
      updatePositionRef.current(_currentIndex);
    }

    setDragOffset(0);
  }, []); // deps rỗng — stable hoàn toàn, React Compiler happy

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

  const pageCount = Math.ceil((slideCount - actualItemsCount + 1) / slideByValue);
  const getActivePage = () => {
    const realIdx = getRealIndex(currentIndex);
    return Math.min(Math.floor(realIdx / slideByValue), pageCount - 1);
  };

  // ─── Resolve effective nav/controls on mobile ─────────────────────────────

  const effectiveShowControls = isMobile && mobileNav === "dots" ? false : isMobile && mobileNav === "none" ? false : isMobile && mobileNav === "arrows" ? showControls : showControls;

  const showDots = showNav && ((isMobile && mobileNav === "dots") || (!isMobile && nav));
  const showArrows = showNav && effectiveShowControls;
  const realCurrentIndex = getRealIndex(currentIndex);

  const offsetPx = safeOffsetPx;

  const atStart = !loop && realCurrentIndex <= 0;
  const atEnd = !loop && realCurrentIndex >= slideCount - actualItemsCount;

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {/* Wrapper riêng cho ảnh + arrow — đây là anchor duy nhất cho absolute arrow */}
      <div className="relative">
        {/* Clip wrapper */}
        <div className="overflow-hidden pt-4 px-1 pb-3">
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

        {/* Arrow controls — giờ chỉ tính theo chiều cao ảnh, không dính Dots */}
        {showArrows && (
          <>
            <button
              onClick={() => moveSlide(-slideByValue)}
              disabled={isAnimating || atStart}
              className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-2xl text-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10 cursor-pointer"
              style={{ left: offsetPx > 0 ? `-${offsetPx + 20}px` : "0px" }}
              aria-label="Previous slide"
            >
              {controlsText[0]}
            </button>
            <button
              onClick={() => moveSlide(slideByValue)}
              disabled={isAnimating || atEnd}
              className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-2xl text-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10 cursor-pointer"
              style={{ right: offsetPx > 0 ? `-${offsetPx + 20}px` : "0px" }}
              aria-label="Next slide"
            >
              {controlsText[1]}
            </button>
          </>
        )}
      </div>

      {/* Dots — nằm ngoài wrapper ảnh+arrow, không còn ảnh hưởng tới việc canh tâm arrow */}
      {showDots && (
        <div className="flex items-center justify-center gap-2 my-4">
          {Array.from({ length: pageCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isAnimating}
              className={`h-2 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${getActivePage() === index ? "w-8 bg-gray-800" : "w-2 bg-gray-300 hover:bg-gray-400"}`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
