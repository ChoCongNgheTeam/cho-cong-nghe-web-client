"use client";

import { useRef, useCallback, useState, useTransition, useDeferredValue, useEffect } from "react";
import { Search, ChevronsLeftRight, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiRequest from "@/lib/api";
import { formatVND } from "@/helpers";

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
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
  // Keyboard navigation: index into results (-1 = none, results.length = "see all" row)
  const [activeIndex, setActiveIndex] = useState(-1);

  const staleResultsRef = useRef<ApiProduct[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // Track IME composing state (Vietnamese keyboard on iOS: Laban Key, etc.)
  // During composition, we must NOT update React state or trigger search
  // because React's controlled input conflicts with IME mid-compose
  const isComposingRef = useRef(false);

  const [, startTransition] = useTransition();
  const deferredResults = useDeferredValue(results);
  const isStale = results !== deferredResults;

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Reset active index when results change ────────────────────────────────
  useEffect(() => {
    setActiveIndex(-1);
  }, [deferredResults]);

  // ── Scroll active item into view ──────────────────────────────────────────
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const navigateToSearch = useCallback(
    async (q?: string) => {
      const term = (q ?? query).trim();
      if (!term) return;
      setIsOpen(false);
      setActiveIndex(-1);
      try {
        const res = await apiRequest.get<{ data: { slug: string } | null }>("/categories/resolve", { params: { q: term }, noAuth: true });
        if (res?.data?.slug) {
          router.push(`/category/${res.data.slug}`);
          return;
        }
      } catch {}
      router.push(`/search?q=${encodeURIComponent(term)}`);
    },
    [query, router],
  );

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const search = useCallback(async (q: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsSearching(true);
    try {
      const res = await apiRequest.get<ApiResponse>("/search", {
        params: { q, limit: 8 },
        noAuth: true,
      });
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

  // ── Handlers ──────────────────────────────────────────────────────────────

  // IME composition handlers — fire when Vietnamese/CJK keyboard is mid-compose
  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    // Composition just finished — now safe to update state with final value
    const val = e.currentTarget.value;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Skip state update while IME is composing — let the IME finish first.
    // Without this, React re-renders during composition inject stray spaces
    // (reproducible with Laban Key / iOS Vietnamese telex input).
    if (isComposingRef.current) return;

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
    // Total navigable items = results + "see all" row (when results exist)
    const total = deferredResults.length > 0 ? deferredResults.length + 1 : 0;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < total - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : total - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < deferredResults.length) {
        // Navigate to highlighted product
        const product = deferredResults[activeIndex];
        setIsOpen(false);
        setActiveIndex(-1);
        router.push(`/products/${product.slug}`);
      } else if (activeIndex === deferredResults.length) {
        // "See all" row selected
        navigateToSearch();
      } else {
        navigateToSearch();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleClose = useCallback(() => {
    setQuery("");
    staleResultsRef.current = [];
    startTransition(() => {
      setResults([]);
      setIsOpen(false);
    });
    setActiveIndex(-1);
  }, []);

  const showDropdown = isOpen && query.trim().length > 0;
  const displayResults = deferredResults;
  const showSkeleton = isSearching && staleResultsRef.current.length === 0;

  return (
    <>
      {/*
        FIX: iOS zoom prevention — same pattern as ChatButton.
        iOS Safari zooms when font-size < 16px on focus.
        We force 16px on iOS via @supports, keep 14px/15px on others.
      */}
      <style>{`
        .search-input-ios {
          font-size: 16px !important;
        }
        @supports not (-webkit-touch-callout: none) {
          .search-input-ios {
            font-size: inherit !important;
          }
        }
        /* Keyboard-highlighted item in dropdown */
        .search-item-active {
          background-color: var(--color-neutral, #f3f4f6);
        }
      `}</style>

      <div ref={wrapperRef} className="w-full">
        <div className="relative [&:has(input:focus)_.search-addon]:border-accent-hover">
          <input
            ref={inputRef}
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={query}
            onChange={handleChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            // Accessibility: link input to listbox
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="search-listbox"
            aria-activedescendant={activeIndex >= 0 ? `search-item-${activeIndex}` : undefined}
            // FIX: iOS — 'search' inputMode + enterKeyHint show correct keyboard
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-form-type="other"
            className={`w-full pl-4 py-2.5 lg:py-3
              border border-neutral rounded-full
              focus:outline-none focus:border-accent-hover
              text-sm lg:text-base
              bg-neutral-light text-primary placeholder:text-neutral-dark
              search-input-ios
              ${isMobile ? "pr-14" : "pr-14 lg:pr-48 xl:pr-60"}
            `}
          />

          <div className="search-addon absolute right-0 top-0 bottom-0 flex items-stretch overflow-hidden border border-neutral border-l-0 rounded-r-full transition-colors">
            {!isMobile && (
              <button className="hidden lg:flex items-center gap-1 px-3 lg:px-4 text-xs lg:text-sm text-neutral-darker hover:text-primary border-r border-neutral cursor-pointer bg-neutral-light transition-colors whitespace-nowrap">
                <span className="xl:hidden cursor-pointer">Danh mục</span>
                <ChevronsLeftRight className="w-4 h-4 lg:w-5 lg:h-5 rotate-90" />
              </button>
            )}
            <button
              onClick={() => navigateToSearch()}
              aria-label="Tìm kiếm"
              className="flex items-center justify-center px-3 lg:px-4 bg-neutral hover:bg-neutral-hover transition-colors cursor-pointer"
            >
              <Search className={`w-4 h-4 lg:w-5 lg:h-5 text-neutral-light-dark transition-opacity duration-200 ${isSearching ? "opacity-40" : "opacity-100"}`} />
            </button>
          </div>

          {/* ── Dropdown ── */}
          <div
            id="search-listbox"
            role="listbox"
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
                <ul aria-label="Đang tìm kiếm">
                  {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <SkeletonItem key={i} />
                  ))}
                </ul>
              ) : displayResults.length > 0 ? (
                <>
                  <ul ref={listRef} className="max-h-[420px] overflow-y-auto scrollbar-thin">
                    {displayResults.map((product, i) => {
                      const salePrice = product.price.base;
                      const originPrice = product.priceOrigin;
                      const discount = calcDiscount(originPrice, salePrice);
                      const isActive = i === activeIndex;

                      return (
                        <li
                          key={`${product.id}-${i}`}
                          id={`search-item-${i}`}
                          role="option"
                          aria-selected={isActive}
                          style={{ animationDelay: `${i * 25}ms` }}
                          className={`animate-in fade-in slide-in-from-bottom-1 duration-200 fill-mode-both ${isActive ? "search-item-active" : ""}`}
                        >
                          <Link href={`/products/${product.slug}`} onClick={handleClose} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral transition-colors group">
                            <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-neutral bg-white flex items-center justify-center">
                              {product.thumbnail ? (
                                <Image
                                  src={product.thumbnail}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                                />
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

                  {/* "See all results" footer row */}
                  <div className={`border-t border-neutral ${activeIndex === displayResults.length ? "search-item-active" : ""}`}>
                    <button
                      id={`search-item-${displayResults.length}`}
                      role="option"
                      aria-selected={activeIndex === displayResults.length}
                      onClick={() => navigateToSearch()}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-accent-hover hover:bg-neutral transition-colors cursor-pointer"
                    >
                      Xem tất cả kết quả cho &ldquo;{query}&rdquo;
                      <ArrowRight size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                </>
              ) : !isSearching ? (
                <div className="py-6 text-center text-neutral-darker text-sm">
                  Không tìm thấy sản phẩm nào cho <span className="text-primary font-medium">&ldquo;{query}&rdquo;</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
