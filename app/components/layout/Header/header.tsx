"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import HeaderTop from "./components/HeaderTop";
import MobileHeader from "./components/MobileHeader";
import DesktopHeader from "./components/DesktopHeader";
import MobileBottomNav from "./components/MobileBottomNav";
import { useUserMenu } from "@/hooks/useUserMenu";
import { useTheme } from "@/hooks/useTheme";
import { TrendingBar } from "./components/TrendingBar";

// ── Dark navy premium gradient ─────────────────────────────────────────────────
// Top → bottom: #0a1628 (rất tối) → #0f1f4a (navy) → #1a3580 (xanh đậm)
// Tạo chiều sâu rõ ràng, HeaderTop tối hơn main bar một bậc
const HEADER_BG = "linear-gradient(180deg, #0c1a3a 0%, #0f2050 35%, #1a3580 100%)";

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPastTop, setIsPastTop] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const scrollAccum = useRef(0);
  const isPastTopRef = useRef(false);
  const isVisibleRef = useRef(true);

  const { user, logout, isAuthenticated, loading } = useAuth();
  const { showUserMenu, setShowUserMenu, userMenuRef } = useUserMenu();
  const { isDark } = useTheme();

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

  // Sync --header-visible CSS var
  useEffect(() => {
    document.documentElement.style.setProperty("--header-visible", isVisible ? "1" : "0");
  }, [isVisible]);

  // Hide-on-scroll
  useEffect(() => {
    const HIDE_THRESHOLD = 10;
    const SHOW_THRESHOLD = 30;

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
          setIsPastTop(nextIsPastTop);
        }

        if (currentScrollY === 0) {
          isVisibleRef.current = true;
          setIsVisible(true);
          scrollAccum.current = 0;
          ticking.current = false;
          return;
        }

        scrollAccum.current += diff;
        if (scrollAccum.current > HIDE_THRESHOLD && isVisibleRef.current) {
          isVisibleRef.current = false;
          setIsVisible(false);
          scrollAccum.current = 0;
        } else if (scrollAccum.current < -SHOW_THRESHOLD && !isVisibleRef.current) {
          isVisibleRef.current = true;
          setIsVisible(true);
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

  // Click outside user menu
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUserMenu, userMenuRef, setShowUserMenu]);

  return (
    <>
      <div ref={placeholderRef} aria-hidden="true" />

      {/* ── Fixed Top Header ─────────────────────────────────── */}
      <div
        ref={headerRef}
        className={[
          "fixed top-0 left-0 right-0 z-50",
          "w-full transition-transform duration-300 ease-in-out",
          // Shadow đậm hơn, tông navy để tách khỏi slider
          isPastTop ? "shadow-[0_4px_24px_rgba(0,0,0,0.35)]" : "shadow-[0_2px_12px_rgba(0,0,0,0.2)]",
          isVisible ? "translate-y-0" : "-translate-y-full",
        ].join(" ")}
        style={{ background: HEADER_BG }}
      >
        {/* HeaderTop — desktop only, thêm border-bottom để tách tầng */}
        <div
          className={["transition-all duration-300 overflow-hidden", isPastTop ? "opacity-0 pointer-events-none max-h-0" : "opacity-100 pointer-events-auto max-h-[200px]"].join(" ")}
          // Nền tối hơn 1 bậc để phân biệt với main bar
          style={{ background: "rgba(0,0,0,0.25)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          aria-hidden={isPastTop}
        >
          <HeaderTop isAuthenticated={isAuthenticated} />
        </div>

        <div className="container">
          {/* Mobile */}
          <MobileHeader isDarkMode={isDark} mobileMenuOpen={false} mobileSearchOpen={false} searchQuery="" onMenuToggle={() => {}} onSearchToggle={() => {}} onSearchChange={() => {}} />

          {/* Desktop */}
          <div className="py-2">
            <DesktopHeader
              isDarkMode={isDark}
              isAuthenticated={isAuthenticated}
              isLoading={loading}
              user={user}
              showUserMenu={showUserMenu}
              userMenuRef={userMenuRef}
              onUserMenuToggle={() => setShowUserMenu((v) => !v)}
              onUserMenuClose={() => setShowUserMenu(false)}
              onLogout={logout}
            />
            <TrendingBar className="hidden md:block" />
          </div>
        </div>

        {/* Bottom border — tách header khỏi slider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* ── Mobile Bottom Tab Bar ──────────────────────────── */}
      <MobileBottomNav />
    </>
  );
};

export default Header;
