"use client";

import { useRef, useCallback, useState, useTransition, useDeferredValue, useEffect } from "react";
import { Search, ArrowRight } from "lucide-react";
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
  const [activeIndex, setActiveIndex] = useState(-1);

  const staleResultsRef = useRef<ApiProduct[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

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

  useEffect(() => {
    setActiveIndex(-1);
  }, [deferredResults]);

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
        const slugified = term
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "");
        const res = await apiRequest.get<{ data: { slug: string } | null }>("/categories/resolve", { params: { q: slugified }, noAuth: true });
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
        const product = deferredResults[activeIndex];
        setIsOpen(false);
        setActiveIndex(-1);
        router.push(`/products/${product.slug}`);
      } else if (activeIndex === deferredResults.length) {
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

  // Mobile search bar: nền trắng như cũ (trên nền slider/page)
  if (isMobile) {
    return (
      <>
        <style>{`
          .search-input-ios { font-size: 16px !important; }
          @supports not (-webkit-touch-callout: none) {
            .search-input-ios { font-size: inherit !important; }
          }
          .search-item-active { background-color: var(--color-neutral, #f3f4f6); }
        `}</style>

        <div ref={wrapperRef} className="w-full">
          <div className="relative [&:has(input:focus)_.search-addon-m]:border-accent-hover">
            <input
              ref={inputRef}
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (results.length > 0) setIsOpen(true);
              }}
              role="combobox"
              aria-expanded={showDropdown}
              aria-autocomplete="list"
              aria-controls="search-listbox-m"
              aria-activedescendant={activeIndex >= 0 ? `search-item-m-${activeIndex}` : undefined}
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full pl-4 pr-14 py-2.5 border border-neutral rounded-full focus:outline-none focus:border-accent-hover text-sm bg-neutral-light text-primary placeholder:text-neutral-dark search-input-ios"
            />
            <div className="search-addon-m absolute right-0 top-0 bottom-0 flex items-stretch overflow-hidden border border-neutral border-l-0 rounded-r-full transition-colors">
              <button onClick={() => navigateToSearch()} aria-label="Tìm kiếm" className="flex items-center justify-center px-3 bg-neutral hover:bg-neutral-hover transition-colors cursor-pointer">
                <Search className={`w-4 h-4 text-neutral-light-dark transition-opacity duration-200 ${isSearching ? "opacity-40" : "opacity-100"}`} />
              </button>
            </div>

            {/* Dropdown mobile */}
            <div
              id="search-listbox-m"
              role="listbox"
              className={`absolute top-full left-0 right-0 mt-2 bg-neutral-light border border-neutral rounded-xl shadow-xl z-50 overflow-hidden transition-[opacity,transform] duration-200 ease-out ${showDropdown ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"}`}
            >
              <DropdownContent
                showSkeleton={showSkeleton}
                isStale={isStale}
                isSearching={isSearching}
                displayResults={displayResults}
                activeIndex={activeIndex}
                query={query}
                listRef={listRef}
                handleClose={handleClose}
                navigateToSearch={navigateToSearch}
                idPrefix="search-item-m"
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Desktop: glass style trên nền navy ────────────────────────────────────
  return (
    <>
      <style>{`
        .search-input-ios { font-size: 16px !important; }
        @supports not (-webkit-touch-callout: none) {
          .search-input-ios { font-size: inherit !important; }
        }
        .search-item-active { background-color: var(--color-neutral, #f3f4f6); }

        /* Input glass — nền trong suốt trắng nhẹ trên navy */
        .search-glass-input {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-right: none;
          color: #111827;
          border-radius: 9999px 0 0 9999px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          transition: background 0.15s, border-color 0.15s;
        }
        .search-glass-input::placeholder {
          color: #9ca3af;
        }
        .search-glass-input:focus {
          outline: none;
          background: #fff;
          border-color: rgba(255, 255, 255, 0.38);
        }
        /* Wrapper focus-ring via :has */
        .search-glass-wrap:has(.search-glass-input:focus) .search-glass-btn {
          border-color: rgba(255, 255, 255, 0.38);
        }

        /* Search button — trắng đặc, nhìn rõ, dễ tap */
        .search-glass-btn {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-left: none;
          border-radius: 0 9999px 9999px 0;
          padding: 0 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
          min-width: 44px;
        }
        .search-glass-btn:hover {
          background: #fff;
        }
        .search-glass-btn svg {
          color: #0f2050;
          width: 16px;
          height: 16px;
        }
        /* Dropdown giữ nền trắng — đọc dễ hơn */
        .search-glass-dropdown {
          background: var(--color-neutral-light, #fff);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      <div ref={wrapperRef} className="w-full search-glass-wrap">
        <div className="relative flex">
          <input
            ref={inputRef}
            type="search"
            placeholder="Tìm kiếm sản phẩm..."
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="search-listbox"
            aria-activedescendant={activeIndex >= 0 ? `search-item-${activeIndex}` : undefined}
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="search-glass-input search-input-ios flex-1 w-full pl-4 pr-4 py-2.5 lg:py-3 text-sm"
          />

          <button onClick={() => navigateToSearch()} aria-label="Tìm kiếm" className="search-glass-btn">
            <Search className={`transition-opacity duration-200 ${isSearching ? "opacity-30" : "opacity-100"}`} />
          </button>

          {/* Dropdown */}
          <div
            id="search-listbox"
            role="listbox"
            className={`search-glass-dropdown absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden transition-[opacity,transform] duration-200 ease-out ${showDropdown ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"}`}
          >
            <DropdownContent
              showSkeleton={showSkeleton}
              isStale={isStale}
              isSearching={isSearching}
              displayResults={displayResults}
              activeIndex={activeIndex}
              query={query}
              listRef={listRef}
              handleClose={handleClose}
              navigateToSearch={navigateToSearch}
              idPrefix="search-item"
            />
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Dropdown content (dùng chung mobile & desktop) ───────────────────────────

interface DropdownContentProps {
  showSkeleton: boolean;
  isStale: boolean;
  isSearching: boolean;
  displayResults: ApiProduct[];
  activeIndex: number;
  query: string;
  listRef: React.RefObject<HTMLUListElement | null>;
  handleClose: () => void;
  navigateToSearch: (q?: string) => void;
  idPrefix: string;
}

function DropdownContent({ showSkeleton, isStale, isSearching, displayResults, activeIndex, query, listRef, handleClose, navigateToSearch, idPrefix }: DropdownContentProps) {
  return (
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
                  id={`${idPrefix}-${i}`}
                  role="option"
                  aria-selected={isActive}
                  style={{ animationDelay: `${i * 25}ms` }}
                  className={`animate-in fade-in slide-in-from-bottom-1 duration-200 fill-mode-both ${isActive ? "search-item-active" : ""}`}
                >
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

          <div className={`border-t border-neutral ${activeIndex === displayResults.length ? "search-item-active" : ""}`}>
            <button
              id={`${idPrefix}-${displayResults.length}`}
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
  );
}
