"use client";

import { useRef, useEffect, useCallback, useState, useTransition, useDeferredValue, useLayoutEffect } from "react";
import { Search, ChevronsLeftRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiRequest from "@/lib/api";
import { formatVND } from "@/helpers";
import { fetchTrendingKeywords, TrendingKeyword } from "../_libs/getTopKeywords";

// ─── types & helpers ───────────────────────────────────────────────────────────

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  priceOrigin: number;
  inStock: boolean;
  price: { base: number; hasPromotion: boolean };
  rating: { average: number; count: number };
}

interface ApiResponse {
  data: ApiProduct[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  message: string;
}

function calcDiscount(origin: number, base: number): number {
  if (!origin || origin <= base) return 0;
  return Math.round(((origin - base) / origin) * 100);
}

function SkeletonItem() {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="shrink-0 w-12 h-12 rounded-lg bg-neutral animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-3/4 rounded-full bg-neutral animate-pulse" />
        <div className="h-3 w-1/3 rounded-full bg-neutral animate-pulse" />
      </div>
    </li>
  );
}

const SKELETON_COUNT = 4;

// ─── TrendingMarquee ────────────────────────────────────────────────────────────

function TrendingMarquee({ keywords }: { keywords: TrendingKeyword[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [duration, setDuration] = useState(20); // seconds
  // const [isPaused, setIsPaused] = useState(false);

  useLayoutEffect(() => {
    if (!trackRef.current || keywords.length === 0) return;

    const measure = () => {
      const track = trackRef.current!;
      const container = track.parentElement!;
      // Lấy width của 1 set (không nhân đôi)
      const children = Array.from(track.children) as HTMLElement[];
      const halfCount = children.length / 2;
      let oneSetWidth = 0;
      for (let i = 0; i < halfCount; i++) {
        oneSetWidth += children[i].offsetWidth + 8; // gap-2 = 8px
      }
      const containerWidth = container.offsetWidth;

      if (oneSetWidth > containerWidth) {
        setNeedsScroll(true);
        // Tốc độ: ~80px/s → tự nhiên, không quá nhanh/chậm
        setDuration(Math.max(10, oneSetWidth / 80));
      } else {
        setNeedsScroll(false);
      }
    };

    // Đợi font/layout settle
    const id = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(trackRef.current.parentElement!);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [keywords]);

  if (keywords.length === 0) {
    return (
      <div className="pl-2 hidden md:flex items-center gap-2 mt-2 h-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-3 rounded-full bg-neutral animate-pulse shrink-0" style={{ width: `${[64, 48, 56, 72, 52][i]}px` }} />
        ))}
      </div>
    );
  }

  // Nhân đôi list để tạo vòng lặp liền mạch
  const doubled = [...keywords, ...keywords];

  return (
    <div
      className="pl-2 hidden md:block mt-2 h-4 overflow-hidden"
      // Mask: fade 2 đầu khi đang scroll
      style={needsScroll ? { maskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)" } : undefined}
    >
      <div ref={trackRef} className="flex items-center gap-2 w-max marquee-track" style={needsScroll ? { animation: `marquee-scroll ${duration}s linear infinite` } : undefined}>
        {doubled.map((kw, i) => (
          <Link
            key={`${kw.id}-${i}`}
            href={`/products/${kw.slug}`}
            className="text-xs text-neutral-darker hover:text-accent-hover hover:underline transition-colors whitespace-nowrap shrink-0"
            aria-hidden={needsScroll ? undefined : i >= keywords.length ? "true" : undefined}
          >
            {kw.name}
          </Link>
        ))}
      </div>

      {/* Keyframe inject — chỉ 1 lần, không cần thư viện */}
      <style>{`
  @keyframes marquee-scroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  /* Pause khi hover bất kỳ chỗ nào trong track */
  .marquee-track:hover {
    animation-play-state: paused !important;
  }
`}</style>
    </div>
  );
}

// ─── SearchBar ──────────────────────────────────────────────────────────────────

interface SearchBarProps {
  isMobile?: boolean;
}

export default function SearchBar({ isMobile = false }: SearchBarProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([]);

  const staleResultsRef = useRef<ApiProduct[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [, startTransition] = useTransition();
  const deferredResults = useDeferredValue(results);
  const isStale = results !== deferredResults;

  useEffect(() => {
    fetchTrendingKeywords().then(setTrendingKeywords);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navigateToSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setIsOpen(false);
    try {
      const res = await apiRequest.get<{ data: { slug: string } | null }>("/categories/resolve", { params: { q }, noAuth: true });
      if (res?.data?.slug) {
        router.push(`/category/${res.data.slug}`);
        return;
      }
    } catch {}
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }, [query, router]);

  const search = useCallback(async (q: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsSearching(true);
    try {
      const res = await apiRequest.get<ApiResponse>("/search", { params: { q, limit: 8 }, noAuth: true });
      const items = res?.data ?? [];
      staleResultsRef.current = items;
      startTransition(() => {
        setResults(items);
        setIsOpen(true);
      });
    } catch {
      if (abortRef.current?.signal.aborted) return;
      startTransition(() => setResults([]));
    } finally {
      if (!abortRef.current?.signal.aborted) setIsSearching(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      abortRef.current?.abort();
      staleResultsRef.current = [];
      startTransition(() => {
        setResults([]);
        setIsOpen(false);
      });
      setIsSearching(false);
      return;
    }
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      navigateToSearch();
    }
  };

  const handleClose = useCallback(() => {
    setQuery("");
    staleResultsRef.current = [];
    startTransition(() => {
      setResults([]);
      setIsOpen(false);
    });
  }, []);

  const showDropdown = isOpen && query.trim().length > 0;
  const displayResults = deferredResults;
  const showSkeleton = isSearching && staleResultsRef.current.length === 0;

  return (
    <div ref={wrapperRef} className="w-full">
      <div className="relative [&:has(input:focus)_.search-addon]:border-accent-hover">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className={`w-full pl-4 py-2.5 lg:py-3
            border border-neutral rounded-full
            focus:outline-none focus:border-accent-hover
            text-sm lg:text-base
            bg-neutral-light text-primary placeholder:text-neutral-dark
            ${isMobile ? "pr-14" : "pr-14 lg:pr-48 xl:pr-60"}
          `}
        />

        <div className="search-addon absolute right-0 top-0 bottom-0 flex items-stretch overflow-hidden border border-neutral border-l-0 rounded-r-full transition-colors">
          {!isMobile && (
            <button className="hidden lg:flex items-center gap-1 px-3 lg:px-4 text-xs lg:text-sm text-neutral-darker hover:text-primary border-r border-neutral cursor-pointer bg-neutral-light transition-colors whitespace-nowrap">
              {/* <span className="hidden xl:inline">Tất cả các danh mục</span> */}
              <span className="xl:hidden cursor-pointer">Danh mục</span>
              <ChevronsLeftRight className="w-4 h-4 lg:w-5 lg:h-5 rotate-90" />
            </button>
          )}
          <button onClick={navigateToSearch} className="flex items-center justify-center px-3 lg:px-4 bg-neutral hover:bg-neutral-hover transition-colors cursor-pointer">
            <Search className={`w-4 h-4 lg:w-5 lg:h-5 text-neutral-light-dark transition-opacity duration-200 ${isSearching ? "opacity-40" : "opacity-100"}`} />
          </button>
        </div>

        {/* Dropdown */}
        <div
          className={`
          absolute top-full left-0 right-0 mt-2
          bg-neutral-light border border-neutral rounded-xl shadow-xl z-50
          overflow-hidden
          transition-[opacity,transform] duration-200 ease-out
          ${showDropdown ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"}
        `}
        >
          <div className={`transition-opacity duration-150 ${isStale ? "opacity-50" : "opacity-100"}`}>
            {showSkeleton ? (
              <ul>
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <SkeletonItem key={i} />
                ))}
              </ul>
            ) : displayResults.length > 0 ? (
              <ul className="max-h-105 overflow-y-auto scrollbar-thin">
                {displayResults.map((product, i) => {
                  const salePrice = product.price.base;
                  const originPrice = product.priceOrigin;
                  const discount = calcDiscount(originPrice, salePrice);
                  return (
                    <li key={`${product.id}-${i}`} style={{ animationDelay: `${i * 25}ms` }} className="animate-in fade-in slide-in-from-bottom-1 duration-200 fill-mode-both">
                      <Link href={`/products/${product.slug}`} onClick={handleClose} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral transition-colors group">
                        <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-neutral bg-white flex items-center justify-center">
                          {product.thumbnail ? (
                            <Image src={product.thumbnail} alt={product.name} width={48} height={48} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral rounded-lg text-neutral-dark">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h2l2-3h10l2 3h2a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z" />
                                <circle cx="12" cy="13" r="3" strokeWidth={1.5} />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-primary font-medium truncate group-hover:text-accent-hover transition-colors duration-150">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-semibold text-primary">{formatVND(salePrice)}</span>
                            {discount > 0 && (
                              <>
                                <span className="text-xs text-promotion font-medium">-{discount}%</span>
                                <span className="text-xs text-neutral-darker line-through">{formatVND(originPrice)}</span>
                              </>
                            )}
                            {!product.inStock && <span className="text-xs text-neutral-darker">Hết hàng</span>}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : !isSearching ? (
              <div className="py-6 text-center text-neutral-darker text-sm">
                Không tìm thấy sản phẩm nào cho <span className="text-primary font-medium">"{query}"</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Trending marquee ── */}
      {!isMobile && <TrendingMarquee keywords={trendingKeywords} />}
    </div>
  );
}
