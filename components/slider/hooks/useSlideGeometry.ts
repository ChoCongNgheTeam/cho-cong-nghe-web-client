import { Children, useMemo, type ReactNode } from "react";

interface UseSlideGeometryParams {
  children: ReactNode;
  itemsCount: number;
  loop: boolean;
  slideBy: number | "page";
}

/**
 * Tính toàn bộ giá trị "hình học" của slider: danh sách slide thật + slide
 * clone (cho loop), số trang, chỉ số tối đa... Memo hoá vì slider re-render
 * liên tục khi kéo (drag), tính lại mỗi lần render sẽ tốn không cần thiết.
 */
export function useSlideGeometry({ children, itemsCount, loop, slideBy }: UseSlideGeometryParams) {
  return useMemo(() => {
    const originalSlides = Children.toArray(children);
    const slideCount = originalSlides.length;
    const actualItemsCount = Math.min(itemsCount, slideCount);
    const showNav = slideCount > actualItemsCount;

    const slideByValue = slideBy === "page" ? actualItemsCount : typeof slideBy === "number" ? slideBy : 1;

    // Clone đủ để trượt mượt 2 đầu khi loop — tối thiểu bằng số item hiển thị
    // hoặc bước nhảy, tuỳ cái nào lớn hơn
    const cloneCount = loop && slideCount > actualItemsCount ? Math.max(actualItemsCount, slideByValue) : 0;

    const slides = !loop || cloneCount === 0 ? originalSlides : [...originalSlides.slice(-cloneCount), ...originalSlides, ...originalSlides.slice(0, cloneCount)];

    const maxIndex = loop ? slides.length : Math.max(0, slideCount - actualItemsCount);

    return { originalSlides, slideCount, actualItemsCount, showNav, cloneCount, slides, maxIndex, slideByValue };
  }, [children, itemsCount, loop, slideBy]);
}
