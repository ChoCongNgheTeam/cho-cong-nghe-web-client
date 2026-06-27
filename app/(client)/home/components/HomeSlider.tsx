"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, CSSProperties } from "react";
import type { Slider } from "../_lib/types";
import { THEMES } from "../_lib/home-slider.themes";

export function HomeSlider({ sliders }: { sliders: Slider[] }) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const goTo = useCallback(
    (index: number) => {
      if (animating || index === current) return;
      setAnimating(true);
      setVisible(false);
      setTimeout(() => {
        setCurrent(index);
        setVisible(true);
        setAnimating(false);
      }, 420);
    },
    [animating, current],
  );

  const next = useCallback(() => goTo((current + 1) % sliders.length), [current, sliders.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + sliders.length) % sliders.length), [current, sliders.length, goTo]);

  useEffect(() => {
    timerRef.current = setTimeout(next, 5500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, next]);

  // Auto-scroll tabs so active tab is always visible
  useEffect(() => {
    const container = tabsRef.current;
    const activeTab = tabRefs.current[current];
    if (!container || !activeTab) return;

    const containerRect = container.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;

    const tabLeft = tabRect.left - containerRect.left + scrollLeft;
    const tabRight = tabLeft + tabRect.width;
    const visibleRight = scrollLeft + containerRect.width;

    if (tabLeft < scrollLeft) {
      container.scrollTo({ left: tabLeft - 8, behavior: "smooth" });
    } else if (tabRight > visibleRight) {
      container.scrollTo({ left: tabRight - containerRect.width + 8, behavior: "smooth" });
    }
  }, [current]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (sliders.length === 0) return null;

  const slide = sliders[current];
  const theme = THEMES[current % THEMES.length];

  const textStyle = (idx: number): CSSProperties => {
    const t = theme.textAnims[idx];
    if (!visible) return { opacity: 0 };
    return { animation: `${t.keyframe} ${t.duration}ms cubic-bezier(0.22,1,0.36,1) ${t.delay}ms both` };
  };

  const imgStyle: CSSProperties = !visible
    ? { opacity: 0 }
    : { animation: `${theme.imgAnim} ${theme.imgDuration}ms cubic-bezier(0.22,1,0.36,1) 0ms both, hsFloat 5s ease-in-out ${theme.imgDuration}ms infinite` };

  // Tab height + notch size
  const TAB_H = 50;
  const NOTCH = 10;
  // Min tab width so short-title tabs don't collapse; tabs can grow beyond this
  const TAB_MIN_W = 120;

  return (
    <div className="flex flex-col w-full">
      {/* ── Slider area ── */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "21/8", minHeight: 160 }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, rgb(var(--neutral-light)) 0%, rgb(var(--accent-light)) 40%, rgb(var(--neutral-light-hover)) 70%, rgb(var(--neutral-light-active)) 100%)`,
          }}
        />

        {/* Layer 1: Perspective grid */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden [perspective:400px]">
          <div
            style={{
              position: "absolute",
              inset: "30% -5% -5% 45%",
              transform: "rotateX(48deg) rotateZ(-4deg)",
              transformOrigin: "50% 0%",
              backgroundImage: `linear-gradient(rgb(var(--accent) / 0.3) 1.5px, transparent 1.5px), linear-gradient(90deg, rgb(var(--accent) / 0.3) 1.5px, transparent 1.5px)`,
              backgroundSize: "38px 38px",
              animation: "hsPerspGridScroll 6s linear infinite",
              maskImage: "linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.6) 40%, black 75%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.6) 40%, black 75%, transparent 100%)",
            }}
          />
          {[
            { top: "52%", left: "62%", delay: "0s" },
            { top: "64%", left: "70%", delay: "1.2s" },
            { top: "58%", left: "80%", delay: "2.4s" },
            { top: "72%", left: "66%", delay: "0.7s" },
            { top: "68%", left: "76%", delay: "1.8s" },
          ].map((dot, i) => (
            <div
              key={i}
              className="pointer-events-none absolute size-1 rounded-full"
              style={{
                top: dot.top,
                left: dot.left,
                background: "rgb(var(--accent))",
                boxShadow: "0 0 6px 2px rgb(var(--accent) / 0.5)",
                animation: `hsDotBlink 3s ease-in-out ${dot.delay} infinite`,
              }}
            />
          ))}
        </div>

        {/* Layer 2: Blobs */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
            radial-gradient(ellipse 55% 80% at 78% 50%, rgb(var(--accent) / 0.12) 0%, transparent 65%),
            radial-gradient(ellipse 40% 55% at 15% 28%, rgb(var(--accent-dark) / 0.08) 0%, transparent 65%),
            radial-gradient(ellipse 28% 38% at 52% 90%, rgb(var(--accent) / 0.08) 0%, transparent 60%)
          `,
          }}
        />

        {/* Layer 3: Noise */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px 180px",
          }}
        />

        {/* Layer 4: Bottom fade */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-10"
          style={{
            height: "32%",
            background: `linear-gradient(to bottom, transparent 0%, rgb(var(--neutral-light) / 0.6) 55%, rgb(var(--neutral-light)) 100%)`,
          }}
        />

        {/* Progress bar */}
        <div
          key={`prog-${current}`}
          className="absolute bottom-0 left-0 h-[3px] z-20 rounded-r-sm opacity-85"
          style={{
            background: `linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent-dark)))`,
            animation: visible ? "hsProgress 5.5s linear forwards" : "none",
            width: visible ? undefined : "0%",
          }}
        />

        {/* Main content */}
        <div className="container relative z-10 grid grid-cols-2 items-center h-full">
          {/* LEFT */}
          <div className="flex flex-col pl-4">
            <h2 className="font-extrabold leading-tight py-1 tracking-tight text-primary-dark" style={{ fontSize: "clamp(15px, 3vw, 35px)", ...textStyle(1) }}>
              {slide.title}
            </h2>
            <p className="leading-relaxed mb-3 mt-1 text-accent-dark" style={{ fontSize: "clamp(9px, 0.95vw, 12px)", maxWidth: "34ch", ...textStyle(2) }}>
              {slide.subTitle}
            </p>
            <Link
              href={slide.linkUrl ?? "#"}
              className="group inline-flex items-center gap-1.5 w-fit rounded-full font-semibold text-white transition-[box-shadow,transform] duration-200 active:scale-[0.97]"
              style={{
                background: `linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-dark)))`,
                boxShadow: `0 4px 22px -4px rgb(var(--accent) / 0.55)`,
                fontSize: "clamp(9px, 0.8vw, 13px)",
                padding: "clamp(5px, 0.6vw, 9px) clamp(10px, 1.2vw, 20px)",
                ...textStyle(3),
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 30px -4px rgb(var(--accent) / 0.75)`;
                (e.currentTarget as HTMLElement).style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 22px -4px rgb(var(--accent) / 0.55)`;
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              Xem Ngay
              <svg
                style={{ width: "clamp(9px, 0.85vw, 12px)", height: "clamp(9px, 0.85vw, 12px)" }}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* RIGHT: image */}
          <div className="relative h-[80%]">
            {/* Glow blobs */}
            <div
              className="pointer-events-none absolute rounded-full blur-[28px]"
              style={{
                top: "50%",
                left: "50%",
                width: "85%",
                aspectRatio: "1",
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(circle, rgb(var(--accent) / 0.28) 0%, rgb(var(--accent-dark) / 0.12) 45%, transparent 70%)`,
                animation: "hsGlowPulse 3.5s ease-in-out infinite",
              }}
            />
            <div
              className="pointer-events-none absolute rounded-full blur-[16px]"
              style={{
                top: "50%",
                left: "50%",
                width: "45%",
                aspectRatio: "1",
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(circle, rgb(var(--accent-light-active) / 0.35) 0%, transparent 70%)`,
                animation: "hsGlowPulse 2.8s ease-in-out 0.4s infinite",
              }}
            />
            {/* Rotating rings */}
            <span
              className="pointer-events-none absolute rounded-full"
              style={{
                top: "50%",
                left: "50%",
                width: "86%",
                aspectRatio: "1",
                transform: "translate(-50%, -50%)",
                border: `1.5px solid rgb(var(--accent) / 0.28)`,
                animation: "hsRingRotate 18s linear infinite",
              }}
            />
            <span
              className="pointer-events-none absolute rounded-full"
              style={{
                top: "50%",
                left: "50%",
                width: "112%",
                aspectRatio: "1",
                transform: "translate(-50%, -50%)",
                border: `1px solid rgb(var(--accent) / 0.13)`,
                borderTopColor: `rgb(var(--accent) / 0.35)`,
                animation: "hsRingRotateReverse 28s linear infinite",
              }}
            />
            <span
              className="pointer-events-none absolute rounded-full"
              style={{
                top: "50%",
                left: "50%",
                width: "64%",
                aspectRatio: "1",
                transform: "translate(-50%, -50%)",
                border: `1px dashed rgb(var(--accent) / 0.18)`,
                animation: "hsRingRotate 10s linear infinite",
              }}
            />
            {/* Product image */}
            <Link href={slide.linkUrl ?? "#"} className="absolute inset-0 block" style={imgStyle}>
              {slide.imageUrl && (
                <Image
                  src={slide.imageUrl}
                  alt={slide.title ?? ""}
                  fill
                  sizes="(max-width: 768px) 90vw, 45vw"
                  className="object-contain object-center"
                  style={{ filter: "drop-shadow(0 28px 55px rgb(var(--accent-dark) / 0.22)) drop-shadow(0 8px 20px rgb(var(--primary-dark) / 0.18))" }}
                  quality={80}
                  priority={current === 0}
                  loading={current === 0 ? "eager" : "lazy"}
                />
              )}
            </Link>
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          aria-label="Slide trước"
          disabled={animating}
          className="hidden md:flex cursor-pointer absolute left-1 top-1/2 -translate-y-1/2 z-20 items-center justify-center size-8 rounded-full shadow-md text-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 backdrop-blur-sm"
          style={{ background: `rgb(var(--neutral-light) / 0.88)`, color: `rgb(var(--primary-dark))`, border: `0.5px solid rgb(var(--accent) / 0.2)` }}
        >
          ‹
        </button>
        <button
          onClick={next}
          aria-label="Slide tiếp"
          disabled={animating}
          className="hidden md:flex cursor-pointer absolute right-1 top-1/2 -translate-y-1/2 z-20 items-center justify-center size-8 rounded-full shadow-md text-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 backdrop-blur-sm"
          style={{ background: `rgb(var(--neutral-light) / 0.88)`, color: `rgb(var(--primary-dark))`, border: `0.5px solid rgb(var(--accent) / 0.2)` }}
        >
          ›
        </button>
      </div>

      {/* ── Rabbit-ear tabs — scrollable container ── */}
      <div
        ref={tabsRef}
        className="relative flex items-end gap-1 px-2 overflow-x-auto"
        style={{
          marginTop: -(TAB_H / 2),
          zIndex: 20,
          // Hide scrollbar visually but keep it functional
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
          WebkitOverflowScrolling: "touch",
        }}
        // Also hide scrollbar for Chrome/Safari via inline pseudo-hack:
        // (put this in your global CSS: .tabs-scroll::-webkit-scrollbar { display: none; })
      >
        {sliders.map((s, i) => {
          const isActive = i === current;
          return (
            <button
              key={i}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              onClick={() => goTo(i)}
              disabled={animating}
              aria-label={s.title ?? `Slide ${i + 1}`}
              className="group relative flex-none flex flex-col items-center transition-all duration-300 disabled:cursor-not-allowed focus:outline-none"
              style={{
                height: isActive ? TAB_H : TAB_H - 8,
                minWidth: TAB_MIN_W,
                // Grow to fill container when total tabs fit, otherwise stay at minWidth
                width: `max(${TAB_MIN_W}px, calc((100% - ${(sliders.length - 1) * 4}px) / ${sliders.length}))`,
              }}
            >
              {/* Rabbit-ear SVG background */}
              <svg
                viewBox={`0 0 100 ${TAB_H}`}
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
                style={{ filter: isActive ? `drop-shadow(0 -3px 6px rgb(var(--accent) / 0.25))` : "none" }}
              >
                <path
                  d={`M${NOTCH},0 Q0,0 0,${NOTCH} L0,${TAB_H} L100,${TAB_H} L100,${NOTCH} Q100,0 ${100 - NOTCH},0 Z`}
                  fill={isActive ? `rgb(var(--surface))` : `rgb(var(--neutral-light-active))`}
                />
                {isActive && <path d={`M${NOTCH + 2},2 L${100 - NOTCH - 2},2`} stroke={`rgb(var(--accent))`} strokeWidth="3" strokeLinecap="round" fill="none" />}
              </svg>
              {/* Tab inner content */}
              <div className="relative z-10 flex flex-col items-center gap-1 px-2 pt-1.5 pb-1 w-full">
                {/* Title — 2 dòng, không truncate */}
                <span
                  className="font-medium leading-tight text-center transition-all duration-300 line-clamp-2 w-full"
                  style={{
                    fontSize: isActive ? "clamp(9px, 0.85vw, 12px)" : "clamp(8px, 0.75vw, 10px)",
                    color: isActive ? `rgb(var(--accent-dark))` : `rgb(var(--primary))`,
                    fontWeight: isActive ? 700 : 500,
                    wordBreak: "break-word",
                  }}
                >
                  {s.title}
                </span>
              </div>

              {/* Progress bar in active tab */}
              {isActive && (
                <div className="absolute bottom-1.5 left-3 right-3 h-[2px] rounded-full overflow-hidden" style={{ background: `rgb(var(--neutral))` }}>
                  <div
                    key={`tab-prog-${current}`}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent-dark)))`,
                      animation: visible ? "hsProgress 5.5s linear forwards" : "none",
                      width: visible ? undefined : "0%",
                    }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
