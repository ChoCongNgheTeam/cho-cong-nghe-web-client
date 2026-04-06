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
  const [effectiveHeaderHeight, setEffectiveHeaderHeight] = useState(64);

  useEffect(() => {
    const measure = () => {
      const style = getComputedStyle(document.documentElement);
      const rawH = style.getPropertyValue("--header-height").trim();
      const h = parseInt(rawH);
      const validH = !isNaN(h) && h > 0 ? h : 64;
      if (validH !== headerHeightRef.current) {
        headerHeightRef.current = validH;
        setEffectiveHeaderHeight(validH);
        console.log(`[Header] height → ${validH}`);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* ── Sticky + active tab + stickyTop ── */
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("info");
  const [stickyTop, setStickyTop] = useState(64);

  const showStickyRef = useRef(false);
  const activeTabRef = useRef<TabId>("info");
  const headerVisibleRef = useRef(true); // track crossing, không setState mỗi frame
  const programmaticTargetRef = useRef<number | null>(null);
  const layoutChangingRef = useRef(false);
  const lastLogRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalOffset = headerHeightRef.current + TAB_BAR_HEIGHT + 16;
      const now = Date.now();
      const shouldLog = now - lastLogRef.current > 400;
      if (shouldLog) lastLogRef.current = now;

      // ── Sticky tab bar visibility ──
      const breadcrumbBottom = breadcrumbRef.current?.getBoundingClientRect().bottom ?? 0;
      const nextSticky = breadcrumbBottom < 0;
      if (nextSticky !== showStickyRef.current) {
        showStickyRef.current = nextSticky;
        setShowStickyHeader(nextSticky);
        console.log(`[Sticky] ${nextSticky ? "SHOW" : "HIDE"} | scrollY:${scrollY.toFixed(0)}`);
      }

      // ── stickyTop: detect header visibility bằng getBoundingClientRect ──
      // Chỉ setState khi cross ngưỡng (visible↔hidden), không phải mỗi frame
      const header = document.querySelector<HTMLElement>("header");
      if (header) {
        const headerBottom = header.getBoundingClientRect().bottom;
        // Header "hidden" khi bottom <= 0 (đã scroll hoàn toàn ra khỏi viewport)
        const headerNowVisible = headerBottom > 0;
        if (headerNowVisible !== headerVisibleRef.current) {
          headerVisibleRef.current = headerNowVisible;
          const nextTop = headerNowVisible ? headerHeightRef.current : 0;
          setStickyTop(nextTop);
          console.log(`[StickyTop] header ${headerNowVisible ? "VISIBLE" : "HIDDEN"} → top:${nextTop}`);
        }
      }

      // ── Programmatic scroll gate ──
      if (programmaticTargetRef.current !== null) {
        const dist = Math.abs(scrollY - programmaticTargetRef.current);
        if (dist > 50) return;
        programmaticTargetRef.current = null;
      }

      // ── Active tab ──
      let current: TabId = "info";
      let found = false;
      const tops: Record<string, string> = {};
      [...TABS].reverse().forEach(({ id }) => {
        const el = sectionRefs[id]?.current;
        if (!el) return;
        const absoluteTop = el.getBoundingClientRect().top + scrollY;
        tops[id] = absoluteTop.toFixed(0);
        if (!found && scrollY >= absoluteTop - totalOffset) {
          current = id;
          found = true;
        }
      });

      if (shouldLog) console.log(`[Scroll] scrollY:${scrollY.toFixed(0)} active:${current} stickyTop:${stickyTop}`, tops);

      if (current !== activeTabRef.current) {
        console.log(`[ActiveTab] ${activeTabRef.current} → ${current} | scrollY:${scrollY.toFixed(0)}`);
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
    console.log(`[scrollToSection] → ${id} target:${target.toFixed(0)}`);
    activeTabRef.current = id;
    setActiveTab(id);
    programmaticTargetRef.current = target;
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
    headerHeight: headerHeightRef.current,
    effectiveHeaderHeight,
    stickyTop,
    showStickyHeader,
    activeTab,
    scrollToSection,
    layoutChangingRef,
  };
}
