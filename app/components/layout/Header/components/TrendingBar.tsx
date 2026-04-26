"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { fetchTrendingKeywords, TrendingKeyword } from "../_libs/getTopKeywords";

function MarqueeTrack({ keywords }: { keywords: TrendingKeyword[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [duration, setDuration] = useState(20);

  useLayoutEffect(() => {
    if (!trackRef.current || keywords.length === 0) return;
    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      const track = trackRef.current;
      const container = containerRef.current;
      if (!track || !container) return;
      const children = Array.from(track.children) as HTMLElement[];
      const halfCount = Math.floor(children.length / 2);
      let oneSetWidth = 0;
      for (let i = 0; i < halfCount; i++) {
        oneSetWidth += children[i].offsetWidth + 8;
      }
      const containerWidth = container.offsetWidth;
      if (oneSetWidth > containerWidth) {
        setNeedsScroll(true);
        setDuration(Math.max(12, oneSetWidth / 80));
      } else {
        setNeedsScroll(false);
      }
    };

    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(measure);
    });
    const container = containerRef.current;
    const ro = new ResizeObserver(measure);
    if (container) ro.observe(container);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      ro.disconnect();
    };
  }, [keywords]);

  const doubled = [...keywords, ...keywords];

  return (
    <div
      ref={containerRef}
      className="h-4 overflow-hidden w-full group"
      style={
        needsScroll
          ? {
              maskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
            }
          : undefined
      }
    >
      <div ref={trackRef} className="flex items-center gap-2 w-max" style={needsScroll ? { animation: `trending-marquee ${duration}s linear infinite`, willChange: "transform" } : undefined}>
        {doubled.map((kw, i) => (
          <Link
            key={`${kw.id}-${i}`}
            href={`/products/${kw.slug}`}
            tabIndex={needsScroll && i >= keywords.length ? -1 : undefined}
            aria-hidden={needsScroll && i >= keywords.length ? "true" : undefined}
            // White/translucent text on blue header
            className="text-xs text-white/70 hover:text-white hover:underline transition-colors whitespace-nowrap shrink-0 leading-4"
          >
            {kw.name}
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes trending-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .group:hover > div[style*="trending-marquee"] {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex items-center gap-2 h-4 overflow-hidden">
      {[72, 52, 64, 44, 68, 56, 48].map((w, i) => (
        <div key={i} className="h-3 rounded-full bg-white/20 animate-pulse shrink-0" style={{ width: `${w}px`, animationDelay: `${i * 60}ms` }} />
      ))}
    </div>
  );
}

export const TrendingBar = ({ className }: { className?: string }) => {
  const [keywords, setKeywords] = useState<TrendingKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [marginLeft, setMarginLeft] = useState<number | null>(null);

  useEffect(() => {
    fetchTrendingKeywords().then((kws) => {
      setKeywords(kws);
      setLoading(false);
    });
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      const row = document.querySelector(".desktop-header-row") as HTMLElement | null;
      if (!row) return;
      const children = Array.from(row.children) as HTMLElement[];
      if (children.length < 2) return;
      const gap = parseFloat(getComputedStyle(row).gap) || 16;
      const logoWidth = children[0].offsetWidth;
      const megaWidth = children[1].offsetWidth;
      setMarginLeft(logoWidth + gap + megaWidth + gap);
    };

    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    const row = document.querySelector(".desktop-header-row");
    if (row) ro.observe(row);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={`mt-2 ${className ?? "hidden md:block"}`}>
      <div className="max-w-2xl" style={marginLeft !== null ? { marginLeft } : { visibility: "hidden" }}>
        {loading ? <Skeleton /> : <MarqueeTrack keywords={keywords} />}
      </div>
    </div>
  );
};
