"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useLatestRef } from "./useLatestRef";

interface UseSlideNavigationParams {
  loop: boolean;
  cloneCount: number;
  slideCount: number;
  maxIndex: number;
  slideByValue: number;
  itemsCount: number;
  showNav: boolean;
  speed: number;
  trackRef: RefObject<HTMLDivElement | null>;
  updatePosition: (index: number, instant?: boolean) => void;
  getRealIndex: (index: number) => number;
  onSlideChange?: (index: number) => void;
}

export function useSlideNavigation({
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
}: UseSlideNavigationParams) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const isInitializedRef = useRef(false);

  // Refs để moveSlide đọc giá trị mới nhất mà vẫn giữ deps rỗng (stable
  // hoàn toàn cho autoplay/drag dùng lại mà không lo stale closure)
  const currentIndexRef = useLatestRef(currentIndex);
  const isAnimatingRef = useLatestRef(isAnimating);
  const loopRef = useLatestRef(loop);
  const cloneCountRef = useLatestRef(cloneCount);
  const slideCountRef = useLatestRef(slideCount);
  const maxIndexRef = useLatestRef(maxIndex);
  const speedRef = useLatestRef(speed);
  const showNavRef = useLatestRef(showNav);
  const updatePositionRef = useLatestRef(updatePosition);
  const getRealIndexRef = useLatestRef(getRealIndex);
  const onSlideChangeRef = useLatestRef(onSlideChange);

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
          requestAnimationFrame(() => updatePositionRef.current(resetIndex as number, true));
        }
      }
      setIsAnimating(false);
    }, _speed);

    onSlideChangeRef.current?.(getRealIndexRef.current(newIndex));
    // deps rỗng có chủ đích — toàn bộ giá trị đọc qua ref ở trên
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveSlideRef = useLatestRef(moveSlide);

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

  // Khởi tạo vị trí ban đầu — chờ 1 tick để track đã có kích thước thật
  useEffect(() => {
    if (!isInitializedRef.current && trackRef.current) {
      const initialIndex = loop && cloneCount > 0 ? cloneCount : 0;
      setCurrentIndex(initialIndex);
      setTimeout(() => {
        updatePosition(initialIndex, true);
        isInitializedRef.current = true;
      }, 0);
    }
  }, [loop, cloneCount, trackRef, updatePosition]);

  // Reset vị trí khi số item hiển thị đổi thật sự (breakpoint responsive
  // thay đổi) — prevItemsCountRef để tránh chạy oan vào lần mount đầu tiên
  const prevItemsCountRef = useRef(itemsCount);
  useEffect(() => {
    if (prevItemsCountRef.current === itemsCount) return;
    prevItemsCountRef.current = itemsCount;
    const initialIndex = loop && cloneCount > 0 ? cloneCount : 0;
    setCurrentIndex(initialIndex);
    isInitializedRef.current = false;
  }, [itemsCount, loop, cloneCount]);

  // Canh lại vị trí khi container đổi kích thước (không nhất thiết đổi breakpoint)
  useEffect(() => {
    const handleReposition = () => {
      if (trackRef.current && isInitializedRef.current) updatePosition(currentIndex, true);
    };
    window.addEventListener("resize", handleReposition);
    return () => window.removeEventListener("resize", handleReposition);
  }, [currentIndex, updatePosition, trackRef]);

  return {
    currentIndex,
    isAnimating,
    currentIndexRef,
    isAnimatingRef,
    setCurrentIndex,
    moveSlide,
    moveSlideRef,
    goToSlide,
  };
}
