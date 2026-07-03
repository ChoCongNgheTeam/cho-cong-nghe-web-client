"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useLatestRef } from "./useLatestRef";

interface UseAutoplayParams {
  autoplay: boolean;
  autoplayTimeout: number;
  autoplayHoverPause: boolean;
  showNav: boolean;
  loop: boolean;
  maxIndex: number;
  slideByValue: number;
  containerRef: RefObject<HTMLDivElement | null>;
  currentIndexRef: RefObject<number>;
  moveSlideRef: RefObject<(step: number) => void>;
  setCurrentIndex: (index: number) => void;
  updatePosition: (index: number, instant?: boolean) => void;
}

export function useAutoplay({
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
}: UseAutoplayParams) {
  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loopRef = useLatestRef(loop);
  const maxIndexRef = useLatestRef(maxIndex);
  const slideByValueRef = useLatestRef(slideByValue);
  const updatePositionRef = useLatestRef(updatePosition);

  useEffect(() => {
    if (!autoplay || !showNav) return;

    // Chờ effect khởi tạo vị trí (setTimeout 0 bên useSlideNavigation) chạy
    // xong rồi mới start, tránh autoplay đá vào lúc track chưa có vị trí chuẩn
    const initDelay = setTimeout(() => {
      const stopAutoplay = () => {
        if (autoplayTimerRef.current !== null) {
          clearInterval(autoplayTimerRef.current);
          autoplayTimerRef.current = null;
        }
      };

      const startAutoplay = () => {
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
  }, [autoplay, autoplayTimeout, autoplayHoverPause, showNav, containerRef, currentIndexRef, moveSlideRef, setCurrentIndex, updatePositionRef]);
}
