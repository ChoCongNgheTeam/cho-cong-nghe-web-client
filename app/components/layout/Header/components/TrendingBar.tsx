"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import {
   fetchTrendingKeywords,
   TrendingKeyword,
} from "../_libs/getTopKeywords";

// ─── MarqueeTrack ───────────────────────────────────────────────────────────────

function MarqueeTrack({ keywords }: { keywords: TrendingKeyword[] }) {
   const trackRef = useRef<HTMLDivElement>(null);
   const containerRef = useRef<HTMLDivElement>(null);
   const [needsScroll, setNeedsScroll] = useState(false);
   const [duration, setDuration] = useState(20);

   useLayoutEffect(() => {
      if (!trackRef.current || keywords.length === 0) return;

      const measure = () => {
         const track = trackRef.current!;
         const container = containerRef.current!;
         const children = Array.from(track.children) as HTMLElement[];
         const halfCount = Math.floor(children.length / 2);

         let oneSetWidth = 0;
         for (let i = 0; i < halfCount; i++) {
            oneSetWidth += children[i].offsetWidth + 8; // gap-2 = 8px
         }

         const containerWidth = container.offsetWidth;

         if (oneSetWidth > containerWidth) {
            setNeedsScroll(true);
            setDuration(Math.max(12, oneSetWidth / 80));
         } else {
            setNeedsScroll(false);
         }
      };

      const raf = requestAnimationFrame(measure);
      const ro = new ResizeObserver(measure);
      ro.observe(containerRef.current!);

      return () => {
         cancelAnimationFrame(raf);
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
                    maskImage:
                       "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
                    WebkitMaskImage:
                       "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
                 }
               : undefined
         }
      >
         <div
            ref={trackRef}
            className="flex items-center gap-2 w-max"
            style={
               needsScroll
                  ? {
                       animation: `trending-marquee ${duration}s linear infinite`,
                       willChange: "transform",
                    }
                  : undefined
            }
         >
            {doubled.map((kw, i) => (
               <Link
                  key={`${kw.id}-${i}`}
                  href={`/products/${kw.slug}`}
                  tabIndex={
                     needsScroll && i >= keywords.length ? -1 : undefined
                  }
                  aria-hidden={
                     needsScroll && i >= keywords.length ? "true" : undefined
                  }
                  className="text-xs text-neutral-darker hover:text-accent-hover hover:underline transition-colors whitespace-nowrap shrink-0 leading-4"
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

// ─── Skeleton ───────────────────────────────────────────────────────────────────

function Skeleton() {
   return (
      <div className="flex items-center gap-2 h-4 overflow-hidden">
         {[72, 52, 64, 44, 68, 56, 48].map((w, i) => (
            <div
               key={i}
               className="h-3 rounded-full bg-neutral animate-pulse shrink-0"
               style={{ width: `${w}px`, animationDelay: `${i * 60}ms` }}
            />
         ))}
      </div>
   );
}

// ─── TrendingBar ────────────────────────────────────────────────────────────────
//
// Đặt component này NGAY BÊN DƯỚI <DesktopHeader /> trong layout.
// Tự đo DOM của `.desktop-header-row` để tính marginLeft,
// align chính xác với SearchBar (flex-1 max-w-2xl column).

export default function TrendingBar() {
   const [keywords, setKeywords] = useState<TrendingKeyword[]>([]);
   const [loading, setLoading] = useState(true);
   const [marginLeft, setMarginLeft] = useState<number | null>(null);

   useEffect(() => {
      fetchTrendingKeywords().then((kws) => {
         setKeywords(kws);
         setLoading(false);
      });
   }, []);

   // Đo logo col + megamenu col + gaps để tính offset
   useLayoutEffect(() => {
      const measure = () => {
         const row = document.querySelector(
            ".desktop-header-row",
         ) as HTMLElement | null;
         if (!row) return;

         const children = Array.from(row.children) as HTMLElement[];
         if (children.length < 2) return;

         // gap-4 = 16px, lg:gap-4 = 16px (same)
         const gap = parseFloat(getComputedStyle(row).gap) || 16;

         // children[0] = Logo, children[1] = CategoryMegaMenu
         const logoWidth = children[0].offsetWidth;
         const megaWidth = children[1].offsetWidth;

         setMarginLeft(logoWidth + gap + megaWidth + gap);
      };

      // Đợi layout settle sau hydration
      const raf = requestAnimationFrame(measure);
      const ro = new ResizeObserver(measure);
      const row = document.querySelector(".desktop-header-row");
      if (row) ro.observe(row);

      return () => {
         cancelAnimationFrame(raf);
         ro.disconnect();
      };
   }, []);

   // Chỉ hiển thị trên desktop, ẩn trên mobile
   return (
      <div className="hidden md:block mt-2">
         <div
            className="max-w-2xl"
            style={
               marginLeft !== null ? { marginLeft } : { visibility: "hidden" } // tránh flash lệch trước khi đo xong
            }
         >
            {loading ? <Skeleton /> : <MarqueeTrack keywords={keywords} />}
         </div>
      </div>
   );
}
