"use client";
import { useCompareStore } from "@/(client)/compare/compareStore";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Search, ArrowLeft, Trash2 } from "lucide-react";
import { StarRating } from "@/components/product/StarRating";
import { formatVND } from "@/helpers";
import { ProductDetail, Category } from "@/lib/types/product";
import { AICompareSummary } from "./components/Aicomparesummary";
import { useState, useCallback, useRef, useTransition, useDeferredValue, useEffect } from "react";
import { Popzy } from "@/components/Modal";
import apiRequest from "@/lib/api";
import { useIsMobile } from "./Useismobile";

function getRootSlug(category: any): string | null {
  if (!category) return null;
  return category?.parent?.parent?.slug ?? category?.parent?.slug ?? category?.slug ?? null;
}

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  priceOrigin: number;
  inStock: boolean;
  price: { base: number; hasPromotion: boolean };
  rating: { average: number; count: number };
  category?: Category | null;
}

function calcDiscount(origin: number, base: number): number {
  if (!origin || origin <= base) return 0;
  return Math.round(((origin - base) / origin) * 100);
}

// ── Sticky Compare Header ────────────────────────────────────────────────
function StickyCompareHeader({ products, maxSlots, onRemove }: { products: ProductDetail[]; maxSlots: number; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400 && products.length >= 2);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [products.length]);

  if (!isVisible || products.length < 2) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-neutral-light shadow-lg border-b border-neutral animate-in slide-in-from-top duration-300">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex w-full">
          <div className="flex items-center justify-center px-2 sm:px-5" style={{ width: "120px" }}>
            <h2 className="text-[9px] sm:text-[11px] font-medium text-neutral-darker uppercase tracking-widest flex-1">Thuộc tính</h2>
          </div>

          {Array.from({ length: maxSlots }, (_, index) => {
            const product = products[index];
            return (
              <div key={index} className="flex flex-col items-center gap-1 px-2 sm:px-5 flex-1">
                {product && (
                  <>
                    <div className="relative">
                      <button
                        onClick={() => onRemove(product.id)}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-promotion-light hover:bg-promotion-light-hover text-primary border border-promotion-light-active flex items-center justify-center"
                      >
                        <X size={8} />
                      </button>
                      <Link href={`/products/${product.slug}`}>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-neutral cursor-pointer bg-neutral-light">
                          {product.currentVariant.images?.[0]?.imageUrl ? (
                            <Image src={product.currentVariant.images[0].imageUrl} alt={product.name} width={40} height={40} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full bg-neutral" />
                          )}
                        </div>
                      </Link>
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-center line-clamp-2 text-primary">{product.name}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────
function SkeletonItem() {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="shrink-0 w-11 h-11 rounded-xl bg-neutral animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded-full bg-neutral animate-pulse" />
        <div className="h-2.5 w-1/3 rounded-full bg-neutral animate-pulse" />
      </div>
    </li>
  );
}

// ── Search Modal ──────────────────────────────────────────────────────────
function SearchProductModal({
  isOpen,
  onClose,
  onSelect,
  excludeIds,
  lockedCategorySlug,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (p: ProductDetail) => void;
  excludeIds: string[];
  lockedCategorySlug: string | null;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [blockedId, setBlockedId] = useState<string | null>(null);

  const staleResultsRef = useRef<SearchResult[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startTransition] = useTransition();
  const deferredResults = useDeferredValue(results);
  const isStale = results !== deferredResults;

  const search = useCallback(async (q: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsSearching(true);
    try {
      const res = await apiRequest.get<{ data: SearchResult[] }>("/products", {
        params: { search: q, limit: 8 },
        noAuth: true,
      });
      const raw = res?.data ?? [];
      const items = raw.filter((item, index, self) => self.findIndex((t) => t.id === item.id) === index);
      staleResultsRef.current = items;
      startTransition(() => setResults(items));
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
      startTransition(() => setResults([]));
      setIsSearching(false);
      return;
    }
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const resetState = () => {
    setQuery("");
    staleResultsRef.current = [];
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    startTransition(() => setResults([]));
    setIsSearching(false);
    setSelecting(null);
    setBlockedId(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSelect = async (item: SearchResult) => {
    if (selecting) return;
    const itemRootSlug = getRootSlug(item.category);
    if (lockedCategorySlug && item.category && itemRootSlug !== lockedCategorySlug) {
      setBlockedId(item.id);
      return;
    }

    setSelecting(item.id);
    setBlockedId(null);
    try {
      const res = await apiRequest.get<{ data: ProductDetail }>(`/products/slug/${item.slug}`, { noAuth: true });
      if (res?.data) {
        const detail = res.data;
        if (lockedCategorySlug) {
          const detailRootSlug = getRootSlug(detail.category);
          if (detailRootSlug !== lockedCategorySlug) {
            setBlockedId(item.id);
            return;
          }
        }
        onSelect(detail);
        handleClose();
      }
    } catch {
      console.error("Không thể tải thông tin sản phẩm");
    } finally {
      setSelecting(null);
    }
  };

  const showSkeleton = isSearching && staleResultsRef.current.length === 0;
  const displayResults = deferredResults;

  return (
    <Popzy
      isOpen={isOpen}
      onClose={handleClose}
      closeMethods={["button", "overlay", "escape"]}
      content={
        <div className="pt-1 overflow-y-auto" style={{ maxHeight: "calc(85dvh - 2rem)" }}>
          <div className="mb-5">
            <h2 className="text-[15px] font-semibold text-primary tracking-tight mb-0.5">Thêm sản phẩm so sánh</h2>
            {lockedCategorySlug ? (
              <div className="flex items-center flex-wrap gap-1.5 mt-1">
                <span className="text-xs text-neutral-dark">Danh mục:</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-neutral px-2 py-0.5 rounded-md">{lockedCategorySlug}</span>
                <span className="text-xs text-neutral-dark">— chỉ so sánh sản phẩm cùng danh mục</span>
              </div>
            ) : (
              <p className="text-xs text-neutral-dark">Tìm và chọn sản phẩm bạn muốn đưa vào bảng so sánh</p>
            )}
          </div>

          <div className="relative flex items-stretch mb-5 rounded-2xl overflow-hidden bg-neutral shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center pl-4 text-neutral-dark pointer-events-none">
              <Search className={`w-4 h-4 transition-opacity duration-200 ${isSearching ? "opacity-30" : "opacity-60"}`} />
            </div>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Tìm kiếm tên sản phẩm..."
              className="flex-1 px-3 py-3 text-sm bg-transparent text-primary placeholder:text-neutral-dark/50 outline-none"
            />
            {isSearching && (
              <div className="flex items-center pr-4">
                <div className="w-4 h-4 border-2 border-neutral border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className={`min-h-[200px] transition-opacity duration-200 ${isStale ? "opacity-40" : "opacity-100"}`}>
            {!query.trim() && !isSearching && (
              <div className="flex flex-col items-center justify-center h-[200px] gap-3 text-neutral-dark">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-neutral">
                  <Search className="w-5 h-5 opacity-40" />
                </div>
                <p className="text-sm opacity-60">Nhập tên sản phẩm để tìm kiếm</p>
              </div>
            )}

            {showSkeleton && (
              <ul className="space-y-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonItem key={i} />
                ))}
              </ul>
            )}

            {!isSearching && query.trim() && displayResults.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[200px] gap-2 text-neutral-dark">
                <p className="text-sm">
                  Không tìm thấy kết quả cho <span className="text-primary font-medium">"{query}"</span>
                </p>
              </div>
            )}

            {displayResults.length > 0 && (
              <ul className="max-h-[220px] sm:max-h-[320px] overflow-y-auto space-y-0.5 scrollbar-thin -mx-1 px-1">
                {displayResults.map((item, i) => {
                  const discount = calcDiscount(item.priceOrigin, item.price.base);
                  const isAdded = excludeIds.includes(item.id);
                  const itemRootSlug = getRootSlug(item.category);
                  const isBlocked = blockedId === item.id || (!!lockedCategorySlug && item.category && itemRootSlug !== lockedCategorySlug);
                  const isFetching = selecting === item.id;
                  const isDisabled = isAdded || isBlocked || !!selecting;

                  return (
                    <li key={item.id} style={{ animationDelay: `${i * 30}ms` }} className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
                      <button
                        disabled={isDisabled}
                        onClick={() => handleSelect(item)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150
                          ${
                            isAdded || isBlocked
                              ? "opacity-35 cursor-not-allowed"
                              : selecting && !isFetching
                                ? "opacity-40 cursor-not-allowed"
                                : isFetching
                                  ? "opacity-60 cursor-wait bg-neutral/60"
                                  : "hover:bg-neutral/70 cursor-pointer group"
                          }`}
                      >
                        <div className="shrink-0 w-11 h-11 rounded-xl overflow-hidden border border-neutral flex items-center justify-center bg-neutral-light">
                          {isFetching ? (
                            <div className="w-4 h-4 border-2 border-neutral border-t-primary rounded-full animate-spin" />
                          ) : item.thumbnail ? (
                            <Image src={item.thumbnail} alt={item.name} width={44} height={44} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full bg-neutral rounded-xl" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-primary font-medium truncate leading-snug group-hover:text-accent-hover transition-colors">{item.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[12px] font-semibold text-primary">{formatVND(item.price.base)}</span>
                            {discount > 0 && <span className="text-[10px] font-medium text-white bg-promotion px-1.5 py-0.5 rounded-md">-{discount}%</span>}
                            {!item.inStock && <span className="text-[10px] text-neutral-darker">Hết hàng</span>}
                          </div>
                        </div>

                        {isAdded && <span className="text-[10px] shrink-0 px-2 py-0.5 rounded-lg bg-neutral text-neutral-darker">Đã thêm</span>}
                        {isBlocked && <span className="text-[10px] shrink-0 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">Khác danh mục</span>}
                        {isFetching && <span className="text-[10px] text-neutral-dark shrink-0">Đang tải…</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      }
    />
  );
}

// ── Compare Rows ──────────────────────────────────────────────────────────
type CompareRow = {
  label: string;
  render: (p: ProductDetail) => React.ReactNode;
};

const ROWS: CompareRow[] = [
  {
    label: "Thương hiệu",
    render: (p) => <span className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] sm:text-[12px] font-medium bg-neutral text-primary">{p.brand.name}</span>,
  },
  {
    label: "Giá bán",
    render: (p) => (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[13px] sm:text-[15px] font-bold tracking-tight text-primary">{formatVND(p.price.hasPromotion ? p.price.final : p.price.base)}</span>
        {p.price.hasPromotion && (
          <div className="flex items-center gap-1 flex-wrap justify-center">
            <span className="text-[10px] text-neutral-darker line-through">{formatVND(p.price.base)}</span>
            <span className="text-[10px] font-semibold text-white bg-emerald-500 px-1.5 py-0.5 rounded-md">-{p.price.discountPercentage}%</span>
          </div>
        )}
      </div>
    ),
  },
  {
    label: "Đánh giá",
    render: (p) =>
      p.rating.total > 0 ? (
        <div className="flex flex-col items-center gap-1">
          <StarRating average={p.rating.average} />
          <span className="text-[10px] sm:text-[11px] text-neutral-darker">
            {p.rating.average.toFixed(1)} · {p.rating.total}
          </span>
        </div>
      ) : (
        <span className="text-[10px] sm:text-[11px] text-neutral-darker italic">Chưa có đánh giá</span>
      ),
  },
  {
    label: "Tình trạng",
    render: (p) =>
      p.stockStatus === "in_stock" ? (
        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
          Còn hàng
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-primary bg-promotion-light border border-promotion-light-active px-2 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-promotion inline-block shrink-0" />
          Hết hàng
        </span>
      ),
  },
  {
    label: "Bảo hành",
    render: (p) => <span className="text-[11px] sm:text-[12px] text-primary font-medium">{p.warranty}</span>,
  },
  {
    label: "Điểm nổi bật",
    render: (p) => (
      <div className="flex flex-col gap-1.5 items-center w-full">
        {p.highlights.length > 0 ? (
          p.highlights.map((h) => (
            <div key={h.id} className="text-[10px] sm:text-[11px] text-neutral-dark text-center leading-relaxed">
              {h.name}:{" "}
              <span className="font-semibold text-primary">
                {h.value} {h.unit ?? ""}
              </span>
            </div>
          ))
        ) : (
          <span className="text-neutral-dark/40 text-lg">—</span>
        )}
      </div>
    ),
  },
];

function collectSpecKeys(products: ProductDetail[]): string[] {
  const seen = new Set<string>();
  const keys: string[] = [];
  for (const p of products) {
    for (const g of p.highlightGroups ?? []) {
      for (const item of g.items) {
        if (!seen.has(item.name)) {
          seen.add(item.name);
          keys.push(item.name);
        }
      }
    }
  }
  return keys;
}

function getSpecValue(p: ProductDetail, name: string): string | null {
  for (const g of p.highlightGroups ?? []) {
    for (const item of g.items) {
      if (item.name === name) {
        return item.value + (item.unit ? ` ${item.unit}` : "");
      }
    }
  }
  return null;
}

// ── Empty State ───────────────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-5 text-center px-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-neutral">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-dark opacity-60">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <path d="M17.5 17.5m-3 0a3 3 0 1 0 6 0 3 3 0 1 0 -6 0" />
          <path d="M19.5 15.5v-1.5M15.5 17.5h-1.5" />
        </svg>
      </div>
      <div>
        <p className="text-[15px] font-semibold text-primary mb-1">Chưa có sản phẩm nào</p>
        <p className="text-[13px] text-neutral-darker">Thêm sản phẩm để bắt đầu so sánh tính năng và giá cả</p>
      </div>
      <button onClick={onAdd} className="inline-flex items-center gap-2 text-[13px] font-medium text-primary border border-neutral rounded-xl px-5 py-2.5 hover:bg-neutral/50 transition-colors">
        <Plus size={15} />
        Thêm sản phẩm đầu tiên
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ComparePage() {
  const { items, rootCategorySlug, remove, add, clear, maxCompare } = useCompareStore();
  const isMobile = useIsMobile();
  const MAX_SLOTS = maxCompare(isMobile);

  const [modalOpen, setModalOpen] = useState(false);
  const [stickyHeaderVisible, setStickyHeaderVisible] = useState(false);

  // Nếu đang ở mobile và có 3 sản phẩm → tự động remove sản phẩm thứ 3
  useEffect(() => {
    if (isMobile && items.length > 2) {
      remove(items[2].id);
    }
  }, [isMobile, items, remove]);

  const slots: (ProductDetail | null)[] = Array.from({ length: MAX_SLOTS }, (_, i) => items[i] ?? null);

  const specKeys = collectSpecKeys(items);

  useEffect(() => {
    const handleScroll = () => {
      setStickyHeaderVisible(window.scrollY > 420 && items.length >= 2);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items.length]);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* ── Sticky Compare Header (chỉ 1 lần) ── */}
      <StickyCompareHeader products={items} maxSlots={MAX_SLOTS} onRemove={remove} />

      {/* ── Spacer khi sticky header hiển thị ── */}
      {stickyHeaderVisible && <div className="h-16 sm:h-20" />}

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-[18px] sm:text-[22px] font-bold text-primary leading-tight tracking-tight">So sánh sản phẩm</h1>
          <p className="text-[12px] sm:text-[13px] text-neutral-darker mt-0.5">
            Tối đa {MAX_SLOTS} sản phẩm cùng lúc
            {isMobile && <span className="ml-1 text-accent text-[11px]">(xem trên máy tính để so sánh 3 sản phẩm)</span>}
          </p>
        </div>
        {items.length > 0 && (
          <button onClick={clear} className="inline-flex items-center gap-1.5 text-[12px] text-neutral-dark hover:text-primary transition-colors group self-start sm:self-auto">
            <Trash2 size={13} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            Xóa tất cả
          </button>
        )}
      </div>

      {/* ── Empty state ── */}
      {items.length === 0 && (
        <div className="rounded-2xl border border-neutral overflow-hidden bg-neutral-light">
          <EmptyState onAdd={() => setModalOpen(true)} />
        </div>
      )}

      {/* ── AI Summary ── */}
      {items.length >= 2 && <AICompareSummary products={items} />}

      {/* ── Compare table ── */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-neutral overflow-hidden mt-4 bg-neutral-light shadow-sm">
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
            <table
              className="w-full border-collapse"
              style={{
                tableLayout: "fixed",
                minWidth: isMobile ? "340px" : "520px",
              }}
            >
              <colgroup>
                <col style={{ width: "120px" }} />
                {Array.from({ length: MAX_SLOTS }).map((_, i) => (
                  <col key={i} />
                ))}
              </colgroup>

              <thead className="sticky top-0 z-10">
                <tr className="border-b border-neutral bg-neutral-light backdrop-blur-sm">
                  <th className="px-2 sm:px-5 py-4 sm:py-5 align-bottom text-left">
                    <span className="text-[9px] sm:text-[11px] font-medium text-neutral-darker uppercase tracking-widest">Thuộc tính</span>
                  </th>
                  {slots.map((p, i) => (
                    <th key={i} className="px-2 sm:px-4 py-4 sm:py-5 align-top">
                      {p ? (
                        <div className="relative flex flex-col items-center gap-2 sm:gap-3">
                          <button
                            onClick={() => remove(p.id)}
                            title="Xóa sản phẩm"
                            className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all duration-150 bg-neutral hover:bg-promotion-light text-neutral-dark hover:text-primary border border-neutral hover:border-promotion-light-active cursor-pointer"
                          >
                            <X size={10} />
                          </button>
                          <div className="w-12 h-12 sm:w-20 sm:h-20 relative rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-light border border-neutral">
                            {p.currentVariant.images?.[0]?.imageUrl ? (
                              <Image src={p.currentVariant.images[0].imageUrl} alt={p.name} fill className="object-contain p-1.5 sm:p-2" />
                            ) : (
                              <div className="w-full h-full bg-neutral rounded-xl" />
                            )}
                          </div>
                          <Link
                            href={`/products/${p.slug}`}
                            className="text-[10px] sm:text-[12px] font-semibold text-primary hover:text-accent-hover transition-colors text-center leading-snug line-clamp-2 px-1"
                          >
                            {p.name}
                          </Link>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-2">
                          <button
                            onClick={() => setModalOpen(true)}
                            className="flex flex-col items-center gap-1.5 sm:gap-2 w-full py-5 sm:py-7 rounded-xl sm:rounded-2xl transition-all duration-200 group border border-dashed border-neutral hover:border-accent/40 hover:bg-neutral/30 cursor-pointer"
                          >
                            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200 border border-neutral group-hover:border-accent/30 group-hover:bg-accent-light">
                              <Plus size={13} className="text-neutral-dark group-hover:text-accent transition-colors" />
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-darker group-hover:text-primary transition-colors">Thêm</span>
                          </button>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {ROWS.map((row, i) => (
                  <tr key={row.label} className={`border-t border-neutral/60 transition-colors ${i % 2 !== 0 ? "bg-neutral-light-active" : "bg-transparent"}`}>
                    <td className="px-2 sm:px-5 py-3 sm:py-4 align-middle">
                      <span className="text-[9px] sm:text-[11px] font-medium text-neutral-darker whitespace-nowrap">{row.label}</span>
                    </td>
                    {slots.map((p, j) => (
                      <td key={j} className="text-center text-[12px] sm:text-[13px] text-primary px-2 sm:px-4 py-3 sm:py-4 align-middle">
                        {p ? row.render(p) : <span className="text-neutral-dark/30 text-base">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}

                {specKeys.length > 0 && (
                  <tr className="border-t-2 border-neutral">
                    <td colSpan={MAX_SLOTS + 1} className="px-2 sm:px-5 py-3 bg-neutral">
                      <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-darker">Thông số kỹ thuật</span>
                    </td>
                  </tr>
                )}

                {specKeys.map((key, i) => (
                  <tr key={key} className={`border-t border-neutral/60 ${i % 2 === 0 ? "bg-neutral-light-active" : "bg-transparent"}`}>
                    <td className="px-2 sm:px-5 py-2.5 sm:py-3 align-middle">
                      <span className="text-[9px] sm:text-[11px] text-neutral-darker leading-snug">{key}</span>
                    </td>
                    {slots.map((p, j) => {
                      const val = p ? getSpecValue(p, key) : null;
                      return (
                        <td key={j} className="text-center px-2 sm:px-4 py-2.5 sm:py-3 align-middle">
                          {val ? <span className="text-[10px] sm:text-[12px] font-semibold text-primary">{val}</span> : <span className="text-neutral-dark/30 text-base">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-5 sm:mt-6">
        <Link href="/" className="inline-flex items-center gap-2 text-[13px] text-neutral-darker hover:text-primary transition-colors group self-center sm:self-auto">
          <ArrowLeft size={14} className="transition-transform duration-150 group-hover:-translate-x-0.5" />
          Tiếp tục mua sắm
        </Link>
        {items.length > 0 && items.length < MAX_SLOTS && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 text-[13px] font-medium text-primary border border-neutral rounded-xl px-4 py-2.5 sm:py-2 hover:bg-neutral/50 transition-colors w-full sm:w-auto"
          >
            <Plus size={14} />
            Thêm sản phẩm
          </button>
        )}
      </div>

      {/* ── Modal ── */}
      <SearchProductModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSelect={(p) => add(p, isMobile)} excludeIds={items.map((p) => p.id)} lockedCategorySlug={rootCategorySlug} />
    </div>
  );
}
