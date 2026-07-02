"use client";

import { useRef, useCallback, useState, useTransition, useDeferredValue, useEffect, memo } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchSearchResults, fetchTrendingKeywords, resolveSearchCategory } from "@/lib/api/header/header.api";
import { addSearchHistory, clearSearchHistory, getSearchHistory, removeSearchHistory } from "@/lib/api/header/search-history";
import { logError } from "@/lib/monitoring/log-error";
import { SearchProduct, TrendingKeyword } from "../type";
import { DropdownContent } from "./DropdownContent";
import { IdleDropdown } from "./IdleDropdown";

interface SearchBarProps {
  isMobile?: boolean;
}

const SearchBar = memo(({ isMobile = false }: SearchBarProps) => {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const staleResultsRef = useRef<SearchProduct[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [, startTransition] = useTransition();
  const deferredResults = useDeferredValue(results);
  const isStale = results !== deferredResults;

  const [hasStaleResults, setHasStaleResults] = useState(false);

  const [isFocused, setIsFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [trendingKws, setTrendingKws] = useState<TrendingKeyword[]>([]);

  // Load history khi focus
  const handleFocus = () => {
    setIsFocused(true);
    setHistory(getSearchHistory());
    if (results.length > 0) setIsOpen(true);
  };

  // Load trending 1 lần
  useEffect(() => {
    fetchTrendingKeywords()
      .then(setTrendingKws)
      .catch((error) => logError("SearchBar: fetchTrendingKeywords failed", error));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const navigateToSearch = useCallback(
    async (q?: string) => {
      const term = (q ?? query).trim();
      if (!term) return;
      addSearchHistory(term);
      setIsOpen(false);
      setIsFocused(false);
      setActiveIndex(-1);

      try {
        const slug = await resolveSearchCategory(term);
        if (slug) {
          router.push(`/category/${slug}`);
          return;
        }
      } catch (error) {
        // fallback: vẫn cho user search bình thường thay vì đứng im
        logError("SearchBar: resolveSearchCategory failed", error, { term });
      }

      router.push(`/search?q=${term}`);
    },
    [query, router],
  );

  const search = useCallback(async (q: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsSearching(true);
    try {
      const items = await fetchSearchResults(q, abortRef.current.signal);
      staleResultsRef.current = items;
      setHasStaleResults(items.length > 0);
      startTransition(() => {
        setResults(items);
        setActiveIndex(-1);
        setIsOpen(true);
      });
    } catch (error) {
      if (abortRef.current?.signal.aborted) return;
      logError("SearchBar: fetchSearchResults failed", error, { query: q });
      startTransition(() => setResults([]));
    } finally {
      if (!abortRef.current?.signal.aborted) setIsSearching(false);
    }
  }, []);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      abortRef.current?.abort();
      staleResultsRef.current = [];
      setHasStaleResults(false);
      startTransition(() => {
        setResults([]);
        setIsOpen(false);
        setActiveIndex(-1);
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
        addSearchHistory(query.trim());
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
    setIsFocused(false);
    staleResultsRef.current = [];
    setHasStaleResults(false);
    startTransition(() => {
      setResults([]);
      setIsOpen(false);
    });
    setActiveIndex(-1);
  }, []);

  // Handlers cho IdleDropdown — useCallback vì IdleDropdown đã memo()
  const handleSelectHistory = useCallback(
    (term: string) => {
      setQuery(term);
      navigateToSearch(term);
    },
    [navigateToSearch],
  );

  const handleRemoveHistory = useCallback((term: string) => {
    removeSearchHistory(term);
    setHistory(getSearchHistory());
  }, []);

  const handleClearHistory = useCallback(() => {
    clearSearchHistory();
    setHistory([]);
  }, []);

  const handleSelectTrending = useCallback(
    (kw: TrendingKeyword) => {
      router.push(`/products/${kw.slug}`);
      setIsFocused(false);
    },
    [router],
  );

  const showDropdown = isOpen && query.trim().length > 0;
  const showIdle = isFocused && query.trim().length === 0;
  const displayResults = deferredResults;
  const showSkeleton = isSearching && !hasStaleResults;

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
              className="w-full pl-4 pr-14 py-3 lg:py-3.5 text-sm lg:text-base border border-neutral rounded-full focus:outline-none focus:border-accent-hover bg-neutral-light text-primary placeholder:text-neutral-dark search-input-ios"
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

  // Desktop: glass style trên nền navy
  return (
    <>
      <style>{`
        .search-input-ios { font-size: 16px !important; }
        @supports not (-webkit-touch-callout: none) {
          .search-input-ios { font-size: inherit !important; }
        }
        .search-item-active { background-color: var(--color-neutral, #f3f4f6); }

        /* Input glass — đồng bộ với header buttons */
        .search-glass-input {
          background: rgba(255, 255, 255, 0.20);
          border: 1px solid rgba(255, 255, 255, 0.30);
          border-right: none;
          color: #fff;
          border-radius: 10px 0 0 10px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background 0.15s, border-color 0.15s;
        }
        .search-glass-input::placeholder {
          color: rgba(255, 255, 255, 0.60);
        }
        .search-glass-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.30);
          border-color: rgba(255, 255, 255, 0.45);
        }
        .search-glass-wrap:has(.search-glass-input:focus) .search-glass-btn {
          background: rgba(255, 255, 255, 0.30);
          border-color: rgba(255, 255, 255, 0.45);
        }

        /* Search button — cùng glass style */
        .search-glass-btn {
          background: rgba(255, 255, 255, 0.20);
          border: 1px solid rgba(255, 255, 255, 0.30);
          border-left: none;
          border-radius: 0 10px 10px 0;
          padding: 0 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background 0.15s, border-color 0.15s;
          min-width: 44px;
        }
        .search-glass-btn:hover {
          background: rgba(255, 255, 255, 0.30);
        }
        .search-glass-btn svg {
          color: #fff;
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
            onFocus={handleFocus}
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

          {/* Idle dropdown — chỉ khi chưa gõ */}
          <div
            className={`search-glass-dropdown absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden transition-[opacity,transform] duration-200 ease-out ${
              showIdle ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
            }`}
          >
            <IdleDropdown
              history={history}
              trending={trendingKws}
              onSelectHistory={handleSelectHistory}
              onRemoveHistory={handleRemoveHistory}
              onClearHistory={handleClearHistory}
              onSelectTrending={handleSelectTrending}
            />
          </div>

          {/* Dropdown */}
          <div
            id="search-listbox"
            role="listbox"
            className={`search-glass-dropdown absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden transition-[opacity,transform] duration-200 ease-out ${
              showDropdown ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
            }`}
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
});

SearchBar.displayName = "SearchBar";

export default SearchBar;
