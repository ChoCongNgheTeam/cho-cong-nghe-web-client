"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import HeaderTop from "./components/HeaderTop";
import MobileHeader from "./components/MobileHeader";
import DesktopHeader from "./components/DesktopHeader";
import MobileBottomNav from "./components/MobileBottomNav";
import { useUserMenu } from "@/hooks/useUserMenu";
import { useTheme } from "@/hooks/useTheme";
import TrendingBar from "./components/TrendingBar";

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
    const HIDE_THRESHOLD = 80;
    const SHOW_THRESHOLD = 30;
    const MIN_SCROLL_Y = 120;

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const diff = currentScrollY - lastScrollY.current;
        lastScrollY.current = currentScrollY;

        const headerH = headerRef.current?.offsetHeight || 60;
        const nextIsPastTop = currentScrollY > headerH;
        if (nextIsPastTop !== isPastTopRef.current) {
          isPastTopRef.current = nextIsPastTop;
          setIsPastTop(nextIsPastTop);
        }

        if (currentScrollY < MIN_SCROLL_Y) {
          if (!isVisibleRef.current) {
            isVisibleRef.current = true;
            setIsVisible(true);
          }
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
          "w-full bg-neutral-light/95 backdrop-blur-md border-b border-neutral",
          "transition-transform duration-300 ease-in-out",
          isPastTop ? "shadow-sm" : "",
          isVisible ? "translate-y-0" : "-translate-y-full",
        ].join(" ")}
      >
        {/* HeaderTop — desktop only */}
        <div
          className={["transition-all duration-300 overflow-hidden", isPastTop ? "opacity-0 pointer-events-none max-h-0" : "opacity-100 pointer-events-auto max-h-[200px]"].join(" ")}
          aria-hidden={isPastTop}
        >
          <HeaderTop isAuthenticated={isAuthenticated} />
        </div>

        <div className="container">
          {/* Mobile: logo + search bar always visible */}
          <MobileHeader
            isDarkMode={isDark}
            // props below kept for type compatibility but unused in new impl
            mobileMenuOpen={false}
            mobileSearchOpen={false}
            searchQuery=""
            onMenuToggle={() => {}}
            onSearchToggle={() => {}}
            onSearchChange={() => {}}
          />

          {/* Desktop header row */}
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
            <TrendingBar />
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Tab Bar ──────────────────────────── */}
      <MobileBottomNav />
    </>
  );
};

export default Header;
