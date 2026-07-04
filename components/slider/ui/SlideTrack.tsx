import { memo, type MouseEvent as ReactMouseEvent, type ReactNode, type RefObject, type TouchEvent as ReactTouchEvent } from "react";

interface SlideTrackProps {
  trackRef: RefObject<HTMLDivElement | null>;
  slides: ReactNode[];
  gap: number;
  actualItemsCount: number;
  draggable: boolean;
  isDragging: boolean;
  didDragRef: RefObject<boolean>;
  onMouseDown: (e: ReactMouseEvent) => void;
  onMouseMove: (e: ReactMouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: ReactTouchEvent) => void;
  onTouchMove: (e: ReactTouchEvent) => void;
  onTouchEnd: () => void;
}

export const SlideTrack = memo(function SlideTrack({
  trackRef,
  slides,
  gap,
  actualItemsCount,
  draggable,
  isDragging,
  didDragRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: SlideTrackProps) {
  return (
    <div className="overflow-hidden pt-4 px-1 pb-3">
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
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClickCapture={(e) => {
          // Chặn click-through vào slide (link/button bên trong) ngay sau khi vừa kéo
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
  );
});
