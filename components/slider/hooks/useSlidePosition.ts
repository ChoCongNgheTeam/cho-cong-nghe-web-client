import { useCallback, type RefObject } from "react";

interface UseSlidePositionParams {
  trackRef: RefObject<HTMLDivElement | null>;
  gap: number;
  itemsCount: number;
  speed: number;
  loop: boolean;
  cloneCount: number;
  slideCount: number;
}

/**
 * Quy đổi index → vị trí transform thực tế trên track, và ngược lại
 * quy đổi index (kể cả clone) → index thật trong danh sách slide gốc.
 */
export function useSlidePosition({ trackRef, gap, itemsCount, speed, loop, cloneCount, slideCount }: UseSlidePositionParams) {
  const getTranslateX = useCallback(
    (index: number) => {
      if (!trackRef.current) return 0;
      const containerWidth = trackRef.current.offsetWidth;
      const slideWidth = (containerWidth + gap) / itemsCount;
      return -(index * slideWidth);
    },
    [trackRef, gap, itemsCount],
  );

  const updatePosition = useCallback(
    (index: number, instant = false) => {
      if (!trackRef.current) return;
      const track = trackRef.current;
      track.style.transition = instant ? "none" : `transform ${speed}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      track.style.transform = `translateX(${getTranslateX(index)}px)`;
    },
    [trackRef, getTranslateX, speed],
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

  return { getTranslateX, updatePosition, getRealIndex };
}
