"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import HeaderTop from "./components/HeaderTop";
import MobileHeader from "./components/MobileHeader";
import DesktopHeader from "./components/DesktopHeader";
import MobileBottomNav from "./components/MobileBottomNav";
import { TrendingBar } from "./components/TrendingBar";

const HEADER_BG = "linear-gradient(180deg, #0c1a3a 0%, #0f2050 35%, #1a3580 100%)";

const Header = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const headerTopWrapRef = useRef<HTMLDivElement>(null);

  // Scroll state — dùng ref, KHÔNG dùng useState
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const scrollAccum = useRef(0);
  const isPastTopRef = useRef(false);
  const isVisibleRef = useRef(true);

  // const { user, logout, isAuthenticated, loading } = useAuth();

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
      // Shadow
      headerRef.current.style.boxShadow = past ? "0 4px 24px rgba(0,0,0,0.35)" : "0 2px 12px rgba(0,0,0,0.2)";
      // HeaderTop ẩn/hiện
      if (headerTopWrapRef.current) {
        if (past) {
          headerTopWrapRef.current.style.maxHeight = "0";
          headerTopWrapRef.current.style.opacity = "0";
          headerTopWrapRef.current.style.pointerEvents = "none";
          headerTopWrapRef.current.setAttribute("aria-hidden", "true");
        } else {
          headerTopWrapRef.current.style.maxHeight = "200px";
          headerTopWrapRef.current.style.opacity = "1";
          headerTopWrapRef.current.style.pointerEvents = "auto";
          headerTopWrapRef.current.removeAttribute("aria-hidden");
        }
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

      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-50 w-full transition-transform duration-300 ease-in-out shadow-[0_2px_12px_rgba(0,0,0,0.2)]" style={{ background: HEADER_BG }}>
        {/* HeaderTop — được control bằng ref, không re-render */}
        <div
          ref={headerTopWrapRef}
          className="transition-all duration-300 overflow-hidden opacity-100 max-h-[200px]"
          style={{ background: "rgba(0,0,0,0.25)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <HeaderTop />
        </div>

        <div className="container">
          <MobileHeader />
          <div className="py-2">
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
