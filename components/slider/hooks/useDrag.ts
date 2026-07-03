"use client";

import { useCallback, useRef, useState, type MouseEvent as ReactMouseEvent, type RefObject, type TouchEvent as ReactTouchEvent } from "react";
import { useLatestRef } from "./useLatestRef";

interface UseDragParams {
  draggable: boolean;
  isAnimating: boolean;
  currentIndex: number;
  actualItemsCount: number;
  maxIndex: number;
  loop: boolean;
  slideByValue: number;
  trackRef: RefObject<HTMLDivElement | null>;
  getTranslateX: (index: number) => number;
  updatePosition: (index: number, instant?: boolean) => void;
  moveSlide: (step: number) => void;
}

export function useDrag({ draggable, isAnimating, currentIndex, actualItemsCount, maxIndex, loop, slideByValue, trackRef, getTranslateX, updatePosition, moveSlide }: UseDragParams) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  // Đánh dấu có thực sự kéo (vượt ngưỡng) hay chỉ click — để chặn click-through sau khi kéo
  const didDragRef = useRef(false);

  const isDraggingRef = useLatestRef(isDragging);
  const dragOffsetRef = useLatestRef(dragOffset);
  const currentIndexRef = useLatestRef(currentIndex);
  const actualItemsCountRef = useLatestRef(actualItemsCount);
  const maxIndexRef = useLatestRef(maxIndex);
  const loopRef = useLatestRef(loop);
  const slideByValueRef = useLatestRef(slideByValue);
  const updatePositionRef = useLatestRef(updatePosition);
  const moveSlideRef = useLatestRef(moveSlide);

  const handleDragStart = useCallback(
    (clientX: number) => {
      if (!draggable || isAnimating || !trackRef.current) return;
      setIsDragging(true);
      setStartX(clientX);
      setDragOffset(0);
      didDragRef.current = false;
      trackRef.current.style.transition = "none";
    },
    [draggable, isAnimating, trackRef],
  );

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !trackRef.current) return;
      const diff = clientX - startX;
      setDragOffset(diff);
      if (Math.abs(diff) > 8) didDragRef.current = true;
      trackRef.current.style.transform = `translateX(${getTranslateX(currentIndex) + diff}px)`;
    },
    [isDragging, startX, currentIndex, getTranslateX, trackRef],
  );

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
    // deps rỗng có chủ đích — toàn bộ giá trị đọc qua ref ở trên
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseDown = useCallback((e: ReactMouseEvent) => handleDragStart(e.clientX), [handleDragStart]);
  const handleMouseMove = useCallback((e: ReactMouseEvent) => handleDragMove(e.clientX), [handleDragMove]);
  const handleMouseUp = useCallback(() => handleDragEnd(), [handleDragEnd]);
  const handleMouseLeave = useCallback(() => {
    if (isDragging) handleDragEnd();
  }, [isDragging, handleDragEnd]);
  const handleTouchStart = useCallback((e: ReactTouchEvent) => handleDragStart(e.touches[0].clientX), [handleDragStart]);
  const handleTouchMove = useCallback((e: ReactTouchEvent) => handleDragMove(e.touches[0].clientX), [handleDragMove]);
  const handleTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd]);

  return {
    isDragging,
    didDragRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
