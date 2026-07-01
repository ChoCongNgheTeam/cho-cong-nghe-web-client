"use client";

import { useEffect, useRef } from "react";
import HeaderTop from "./HeaderTop";
import MobileHeader from "./MobileHeader";
import DesktopHeader from "./DesktopHeader";
import MobileBottomNav from "./MobileBottomNav";
import { TrendingBar } from "./TrendingBar";

const Header = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const headerTopWrapRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const scrollAccum = useRef(0);
  const isPastTopRef = useRef(false);
  const isVisibleRef = useRef(true);

  // ResizeObserver — sync placeholder height & CSS var
  useEffect(() => {
    if (!headerRef.current) return;
    const updateHeight = () => {
      const h = headerRef.current?.offsetHeight;
      if (!h) return;
      if (placeholderRef.current) placeholderRef.current.style.height = `${h}px`;
      document.documentElement.style.setProperty("--header-height", `${h}px`);
    };
    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, []);

  // Hide-on-scroll — DOM manipulation trực tiếp, không setState
  useEffect(() => {
    const HIDE_THRESHOLD = 10;
    const SHOW_THRESHOLD = 30;

    const applyVisible = (visible: boolean) => {
      if (!headerRef.current) return;
      headerRef.current.style.transform = visible ? "translateY(0)" : "translateY(-100%)";
      document.documentElement.style.setProperty("--header-visible", visible ? "1" : "0");
    };

    const applyPastTop = (past: boolean) => {
      if (!headerRef.current) return;
      headerRef.current.style.boxShadow = past ? "0 4px 24px rgba(0,0,0,0.35)" : "0 2px 12px rgba(0,0,0,0.2)";

      if (headerTopWrapRef.current) {
        headerTopWrapRef.current.classList.toggle("header-top-hidden", past);
        headerTopWrapRef.current.setAttribute("aria-hidden", past ? "true" : "false");
      }
    };

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const diff = currentScrollY - lastScrollY.current;
        lastScrollY.current = currentScrollY;

        const nextIsPastTop = currentScrollY > 10;
        if (nextIsPastTop !== isPastTopRef.current) {
          isPastTopRef.current = nextIsPastTop;
          applyPastTop(nextIsPastTop);
        }

        if (currentScrollY === 0) {
          isVisibleRef.current = true;
          applyVisible(true);
          scrollAccum.current = 0;
          ticking.current = false;
          return;
        }

        scrollAccum.current += diff;
        if (scrollAccum.current > HIDE_THRESHOLD && isVisibleRef.current) {
          isVisibleRef.current = false;
          applyVisible(false);
          scrollAccum.current = 0;
        } else if (scrollAccum.current < -SHOW_THRESHOLD && !isVisibleRef.current) {
          isVisibleRef.current = true;
          applyVisible(true);
          scrollAccum.current = 0;
        } else if (Math.abs(scrollAccum.current) > HIDE_THRESHOLD) {
          scrollAccum.current = 0;
        }
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div ref={placeholderRef} aria-hidden="true" />

      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-50 w-full transition-transform duration-300 ease-in-out shadow-[0_2px_12px_rgba(0,0,0,0.2)] header-bg">
        {/* HeaderTop — được control bằng ref, không re-render */}
        <div ref={headerTopWrapRef} className="transition-all duration-300 overflow-hidden opacity-100 max-h-[200px]" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <HeaderTop />
        </div>

        <div className="container">
          <MobileHeader />
          <div className="py-1.5">
            <DesktopHeader />
            <TrendingBar className="hidden md:block" />
          </div>
        </div>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />
      </div>

      <MobileBottomNav />
    </>
  );
};

export default Header;
