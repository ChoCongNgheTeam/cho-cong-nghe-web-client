"use client";

import { useState, useRef } from "react";
import { ProductDetail } from "@/lib/types/product";

interface ProductDetailSection1Props {
  product?: ProductDetail;
  layoutChangingRef?: React.MutableRefObject<boolean>;
}

const COLLAPSED_HEIGHT = 600;
const TRANSITION_MS = 350;

export default function ProductDetailSection1({ product, layoutChangingRef }: ProductDetailSection1Props) {
  const [activeTab, setActiveTab] = useState<"baiviet" | "meohay">("baiviet");
  const [expanded, setExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState<number>(COLLAPSED_HEIGHT);

  const descriptionRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearedRef = useRef(false);

  const clearLayoutChanging = () => {
    if (clearedRef.current) return;
    clearedRef.current = true;
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    if (layoutChangingRef) layoutChangingRef.current = false;
  };

  const setupTransitionEnd = (container: HTMLElement) => {
    clearedRef.current = false;
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== "max-height") return;
      container.removeEventListener("transitionend", onEnd);
      requestAnimationFrame(() => requestAnimationFrame(clearLayoutChanging));
    };
    container.addEventListener("transitionend", onEnd);
    safetyTimerRef.current = setTimeout(() => {
      container.removeEventListener("transitionend", onEnd);
      clearLayoutChanging();
    }, TRANSITION_MS + 500);
  };

  const handleToggleExpand = () => {
    if (expanded) {
      const content = contentRef.current;
      if (!content) return;

      const expandedHeight = content.scrollHeight;
      const heightDelta = expandedHeight - COLLAPSED_HEIGHT;

      // Nếu section nằm phía trên viewport → scroll phải giảm tương ứng
      const sectionTop = descriptionRef.current?.getBoundingClientRect().top ?? 0;
      const pinnedScrollY = window.scrollY;
      const targetScrollY = sectionTop < 0 ? Math.max(0, pinnedScrollY - heightDelta) : pinnedScrollY;

      if (layoutChangingRef) layoutChangingRef.current = true;

      setMaxHeight(expandedHeight);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMaxHeight(COLLAPSED_HEIGHT);
          setExpanded(false);
          window.scrollTo({ top: targetScrollY, behavior: "instant" });
          setupTransitionEnd(content.parentElement ?? content);
        });
      });
    } else {
      const content = contentRef.current;
      const actualHeight = content?.scrollHeight ?? COLLAPSED_HEIGHT * 3;

      if (layoutChangingRef) layoutChangingRef.current = true;

      setMaxHeight(actualHeight);
      setExpanded(true);

      const container = content?.parentElement;
      if (container) {
        setupTransitionEnd(container);
      } else {
        clearedRef.current = false;
        safetyTimerRef.current = setTimeout(clearLayoutChanging, TRANSITION_MS + 200);
      }
    }
  };

  return (
    <div ref={descriptionRef} style={{ overflowAnchor: "none" }}>
      <div className="flex flex-col lg:flex-row lg:gap-6">
        <div className="lg:w-[70%] bg-neutral-light py-6 sm:py-4 lg:py-6 rounded-lg px-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-4">Mô tả sản phẩm</h2>

          <div
            className="relative overflow-hidden"
            style={{
              maxHeight,
              transition: `max-height ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              willChange: "max-height",
              overflowAnchor: "none",
            }}
          >
            <div
              ref={contentRef}
              className="
                product-description space-y-4 text-sm sm:text-base text-neutral-darker
                [&_p]:leading-7 [&_p]:text-left lg:[&_p]:text-justify
                [&_h2]:mt-2 [&_h2]:text-base [&_h2]:sm:text-xl [&_h2]:font-semibold [&_h2]:text-primary
                [&_h3]:mt-5 [&_h3]:text-base [&_h3]:sm:text-lg [&_h3]:font-semibold [&_h3]:text-primary
                [&_strong]:font-semibold [&_strong]:text-primary
                [&_figure]:my-6 [&_figure]:rounded-lg [&_figure]:overflow-hidden
                [&_img]:mx-auto [&_img]:rounded-lg [&_img]:max-w-full
                [&_figcaption]:mt-2 [&_figcaption]:text-xs [&_figcaption]:text-neutral-dark [&_figcaption]:text-center
              "
              dangerouslySetInnerHTML={{ __html: product?.description || "" }}
            />
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-light to-transparent"
              style={{ opacity: expanded ? 0 : 1, transition: `opacity ${TRANSITION_MS}ms ease` }}
            />
          </div>

          <button
            onClick={handleToggleExpand}
            className="block mx-auto mt-4 font-semibold text-primary text-sm sm:text-base hover:text-primary-light hover:underline transition active:scale-95 cursor-pointer"
          >
            {expanded ? "Thu gọn ▲" : "Xem thêm ▼"}
          </button>
        </div>

        <div className="lg:w-[30%] bg-neutral-light py-6 sm:py-4 lg:py-6 rounded-lg px-6">
          <div className={`flex flex-col gap-4 ${expanded ? "lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]" : ""}`}>
            <h2 className="text-xl sm:text-2xl font-semibold text-primary">Thông tin hay</h2>
            <div className="flex bg-neutral rounded-full p-1 gap-1">
              <button
                onClick={() => setActiveTab("baiviet")}
                className={`flex-1 text-center px-1 sm:px-2 py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-200 cursor-pointer ${activeTab === "baiviet" ? "bg-neutral-light text-primary shadow-sm" : "text-neutral-darker hover:bg-neutral-active"}`}
              >
                Bài viết liên quan
              </button>
              <button
                onClick={() => setActiveTab("meohay")}
                className={`flex-1 text-center px-1 sm:px-2 py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-200 cursor-pointer ${activeTab === "meohay" ? "bg-neutral-light text-primary shadow-sm" : "text-neutral-darker hover:bg-neutral-active"}`}
              >
                Xem nhanh
              </button>
            </div>
            <div className="text-sm sm:text-base overflow-y-auto pr-1">
              {activeTab === "baiviet" && (
                <div className="w-full aspect-video rounded-lg overflow-hidden">
                  <iframe className="w-full h-full" src="https://www.youtube.com/embed/NmF82mn0oS8" title="Video sản phẩm" allowFullScreen />
                </div>
              )}
              {activeTab === "meohay" && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-base sm:text-lg text-primary">Mẹo hay</h3>
                  <p className="text-neutral-darker leading-relaxed">Đây là nội dung các mẹo hay nhanh chóng...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
