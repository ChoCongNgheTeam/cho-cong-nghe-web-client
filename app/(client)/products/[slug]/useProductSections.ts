import { useEffect, useRef, useState } from "react";

const TABS = [
  { id: "info", label: "Thông tin sản phẩm" },
  { id: "specs", label: "Thông số kỹ thuật" },
  { id: "article", label: "Bài viết đánh giá" },
  { id: "reviews", label: "Đánh giá & Hỏi đáp" },
  { id: "suggest", label: "Sản phẩm liên quan" },
] as const;

export type TabId = (typeof TABS)[number]["id"];
export { TABS };

const TAB_BAR_HEIGHT = 48;

export function useProductSections() {
  /* ── Refs ─────────────────────────────────────────────────────────────── */
  const breadcrumbRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const specificationsRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const suggestRef = useRef<HTMLDivElement>(null);

  const sectionRefs: Record<TabId, React.RefObject<HTMLDivElement | null>> = {
    info: infoRef,
    specs: specificationsRef,
    article: articleRef,
    reviews: reviewsRef,
    suggest: suggestRef,
  };

  /* ── Header height (đọc CSS variable từ Header.tsx) ──────────────────── */
  const [headerHeight, setHeaderHeight] = useState(64);
  const [effectiveHeaderHeight, setEffectiveHeaderHeight] = useState(64);

  useEffect(() => {
    const measure = () => {
      const style = getComputedStyle(document.documentElement);
      const rawH = style.getPropertyValue("--header-height").trim();
      const h = parseInt(rawH);
      const validH = !isNaN(h) && h > 0 ? h : 64;
      const visible = style.getPropertyValue("--header-visible").trim();
      setHeaderHeight(validH);
      setEffectiveHeaderHeight(visible === "0" ? 0 : validH);
    };

    measure();
    window.addEventListener("resize", measure);
    const observer = new MutationObserver(measure);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  /* ── Sticky tab state ────────────────────────────────────────────────── */
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("info");

  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const totalOffset = headerHeight + TAB_BAR_HEIGHT;

    const handleScroll = () => {
      const breadcrumbBottom =
        breadcrumbRef.current?.getBoundingClientRect().bottom ?? 0;
      setShowStickyHeader(breadcrumbBottom < 0);

      if (isScrollingRef.current) {
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = setTimeout(() => {
          isScrollingRef.current = false;
        }, 150);
        return;
      }

      const scrollY = window.scrollY;
      let current: TabId = "info";
      (
        Object.entries(sectionRefs) as [
          TabId,
          React.RefObject<HTMLDivElement | null>,
        ][]
      ).forEach(([id, ref]) => {
        const top = (ref.current?.offsetTop ?? 0) - totalOffset;
        if (scrollY >= top) current = id;
      });
      setActiveTab(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headerHeight]);

  /* ── Scroll to section ───────────────────────────────────────────────── */
  const scrollToSection = (id: TabId) => {
    setActiveTab(id);
    isScrollingRef.current = true;
    const ref = sectionRefs[id];
    const top = (ref.current?.offsetTop ?? 0) - headerHeight - TAB_BAR_HEIGHT;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return {
    // Refs
    breadcrumbRef,
    infoRef,
    specificationsRef,
    articleRef,
    reviewsRef,
    suggestRef,
    sectionRefs,
    // State
    headerHeight,
    effectiveHeaderHeight,
    showStickyHeader,
    activeTab,
    // Actions
    scrollToSection,
  };
}
