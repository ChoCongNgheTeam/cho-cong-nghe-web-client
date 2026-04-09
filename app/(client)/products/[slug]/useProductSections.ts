import { useEffect, useRef, useState, useCallback } from "react";

const TABS = [
  { id: "info", label: "Thông tin sản phẩm" },
  { id: "specs", label: "Thông số kỹ thuật" },
  { id: "article", label: "Mô tả sản phẩm" },
  { id: "reviews", label: "Đánh giá & Hỏi đáp" },
  { id: "suggest", label: "Sản phẩm liên quan" },
] as const;

export type TabId = (typeof TABS)[number]["id"];
export { TABS };

const TAB_BAR_HEIGHT = 48;

export function useProductSections() {
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

  /* ── Header height ── */
  const headerHeightRef = useRef(64);

  useEffect(() => {
    const measure = () => {
      const style = getComputedStyle(document.documentElement);
      const rawH = style.getPropertyValue("--header-height").trim();
      const h = parseInt(rawH);
      const validH = !isNaN(h) && h > 0 ? h : 64;
      if (validH !== headerHeightRef.current) {
        headerHeightRef.current = validH;
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* ── Sticky + active tab ── */
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("info");

  const showStickyRef = useRef(false);
  const activeTabRef = useRef<TabId>("info");
  const layoutChangingRef = useRef(false);

  const isScrollingProgrammatically = useRef(false);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalOffset = headerHeightRef.current + TAB_BAR_HEIGHT + 16;

      // ── Sticky tab bar visibility ──
      const breadcrumbBottom =
        breadcrumbRef.current?.getBoundingClientRect().bottom ?? 0;
      const nextSticky = breadcrumbBottom < 0;
      if (nextSticky !== showStickyRef.current) {
        showStickyRef.current = nextSticky;
        setShowStickyHeader(nextSticky);
      }

      // ── Programmatic scroll gate ──
      if (isScrollingProgrammatically.current) return;

      // ── Active tab ──
      let current: TabId = "info";
      let found = false;
      [...TABS].reverse().forEach(({ id }) => {
        const el = sectionRefs[id]?.current;
        if (!el) return;
        const absoluteTop = el.getBoundingClientRect().top + scrollY;
        if (!found && scrollY >= absoluteTop - totalOffset) {
          current = id;
          found = true;
        }
      });

      if (current !== activeTabRef.current) {
        activeTabRef.current = current;
        setActiveTab(current);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToSection = useCallback((id: TabId) => {
    const el = sectionRefs[id]?.current;
    if (!el) return;
    const absoluteTop = el.getBoundingClientRect().top + window.scrollY;
    const target = absoluteTop - headerHeightRef.current - TAB_BAR_HEIGHT - 8;

    activeTabRef.current = id;
    setActiveTab(id);
    isScrollingProgrammatically.current = true;

    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 800);

    window.scrollTo({ top: target, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    breadcrumbRef,
    infoRef,
    specificationsRef,
    articleRef,
    reviewsRef,
    suggestRef,
    sectionRefs,
    showStickyHeader,
    activeTab,
    scrollToSection,
    layoutChangingRef,
  };
}