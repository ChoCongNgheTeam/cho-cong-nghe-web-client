"use client";
import { useSearchParams } from "next/navigation";

import { useState, useMemo, memo, useEffect, useCallback } from "react";
import {
   Flame,
   Search,
   ChevronDown,
   X,
   Tag,
   ArrowUpDown,
   ChevronLeft,
   ChevronRight,
   Calendar,
} from "lucide-react";
import HotSaleProductCard from "../home/components/Sales/HotSaleProductCard";
import { SaleProduct, SaleScheduleData } from "../home/_libs";
import apiRequest from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const PRICE_RANGES = [
   { label: "Tất cả", min: 0, max: Infinity },
   { label: "Dưới 2tr", min: 0, max: 2_000_000 },
   { label: "2tr – 5tr", min: 2_000_000, max: 5_000_000 },
   { label: "5tr – 10tr", min: 5_000_000, max: 10_000_000 },
   { label: "10tr – 20tr", min: 10_000_000, max: 20_000_000 },
   { label: "20tr – 30tr", min: 20_000_000, max: 30_000_000 },
   { label: "Trên 30tr", min: 30_000_000, max: Infinity },
];

const SORT_OPTIONS = [
   { value: "default", label: "Mặc định" },
   { value: "price_asc", label: "Giá tăng dần" },
   { value: "price_desc", label: "Giá giảm dần" },
   { value: "discount_desc", label: "Giảm nhiều nhất" },
];

const PAGE_SIZE = 20;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type CachedDayData = {
   products: SaleProduct[];
   total: number;
   promotions: Array<{
      id: string;
      name: string;
      description: string | null;
      priority: number;
   }>;
   endDate: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatDateTab(dateStr: string): string {
   const d = new Date(dateStr);
   return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatDateLabel(dateStr: string): string {
   return new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
   });
}

function normalizeProduct(item: SaleProduct) {
   const raw = (item as any).card ?? item;
   return {
      ...raw,
      price: raw.price ?? {
         base: raw.priceOrigin ?? 0,
         final: raw.priceOrigin ?? 0,
         discountAmount: 0,
         discountPercentage: 0,
         hasPromotion: false,
      },
   };
}

function getProductPrice(p: any): number {
   return p.price?.final ?? p.priceOrigin ?? 0;
}

function getProductDiscount(p: any): number {
   return p.price?.discountPercentage ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTDOWN
// ─────────────────────────────────────────────────────────────────────────────

const Countdown = memo(function Countdown({
   endDate,
}: {
   endDate: string | null;
}) {
   const [t, setT] = useState({ h: 0, m: 0, s: 0 });

   useEffect(() => {
      const calc = () => {
         const diff = Math.max(
            0,
            endDate ? new Date(endDate).getTime() - Date.now() : 0,
         );
         setT({
            h: Math.floor(diff / 3_600_000),
            m: Math.floor((diff % 3_600_000) / 60_000),
            s: Math.floor((diff % 60_000) / 1000),
         });
      };
      calc();
      const id = setInterval(calc, 1000);
      return () => clearInterval(id);
   }, [endDate]);

   const pad = (n: number) => String(n).padStart(2, "0");

   return (
      <div className="flex items-center gap-1" suppressHydrationWarning>
         {[
            { val: t.h, unit: "GIỜ" },
            { val: t.m, unit: "PHÚT" },
            { val: t.s, unit: "GIÂY" },
         ].map(({ val, unit }, i) => (
            <span key={unit} className="flex items-center gap-1">
               <span className="inline-flex flex-col items-center bg-white/20 backdrop-blur rounded-lg px-2 py-1 min-w-[40px]">
                  <span className="font-black text-xl tabular-nums text-white leading-none">
                     {pad(val)}
                  </span>
                  <span className="text-[8px] text-white/80 font-semibold tracking-widest">
                     {unit}
                  </span>
               </span>
               {i < 2 && (
                  <span className="text-white font-black text-lg">:</span>
               )}
            </span>
         ))}
      </div>
   );
});

// ─────────────────────────────────────────────────────────────────────────────
// DATE TABS
// ─────────────────────────────────────────────────────────────────────────────

function DateTabs({
   schedule,
   activeDate,
   loadingDate,
   onSelect,
}: {
   schedule: SaleScheduleData["schedule"];
   activeDate: string;
   loadingDate: string | null;
   onSelect: (d: string) => void;
}) {
   return (
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
         {schedule.map((day) => {
            const isActive = activeDate === day.date;
            const isLoading = loadingDate === day.date;
            return (
               <button
                  key={day.date}
                  onClick={() => onSelect(day.date)}
                  className={`shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${
                     isActive
                        ? "bg-[#c0392b] text-white border-[#c0392b] shadow-lg shadow-[#c0392b]/30"
                        : day.hasActiveSale
                          ? "bg-neutral-light border-neutral text-primary hover:border-promotion/50 hover:bg-promotion-light"
                          : "bg-neutral-light border-neutral text-neutral-dark hover:bg-neutral-light-active"
                  }`}
               >
                  <span className="flex items-center gap-1 text-xs font-bold">
                     {day.isToday ? "Hôm nay" : formatDateTab(day.date)}
                     {isLoading && (
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                     )}
                  </span>
                  <span
                     className={`text-[10px] mt-0.5 ${
                        isActive
                           ? "text-yellow-200"
                           : day.hasActiveSale
                             ? "text-promotion"
                             : "text-neutral-dark"
                     }`}
                  >
                     {day.hasActiveSale
                        ? day.isToday
                           ? "Đang diễn ra"
                           : "Sắp tới"
                        : "Không có sale"}
                  </span>
               </button>
            );
         })}
      </div>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER BAR
// ─────────────────────────────────────────────────────────────────────────────

function FilterBar({
   search,
   onSearchChange,
   priceRange,
   onPriceChange,
   sort,
   onSortChange,
   total,
   filtered,
}: {
   search: string;
   onSearchChange: (v: string) => void;
   priceRange: number;
   onPriceChange: (v: number) => void;
   sort: string;
   onSortChange: (v: string) => void;
   total: number;
   filtered: number;
}) {
   return (
      <div className="bg-neutral-light rounded-2xl border border-neutral p-4 shadow-sm space-y-4">
         {/* Search input */}
         <div className="relative">
            <Search
               size={16}
               className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark"
            />
            <input
               type="text"
               placeholder="Tìm sản phẩm trong Flash Sale..."
               value={search}
               onChange={(e) => onSearchChange(e.target.value)}
               className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-neutral bg-neutral-light-active text-primary placeholder:text-neutral-dark focus:bg-neutral-light focus:border-promotion focus:ring-2 focus:ring-promotion/10 outline-none transition-all"
            />
            {search && (
               <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary"
               >
                  <X size={14} />
               </button>
            )}
         </div>

         {/* Price ranges + Sort */}
         <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
               <Tag size={14} className="text-neutral-dark shrink-0" />
               <span className="text-xs font-semibold text-neutral-dark uppercase tracking-wide shrink-0 mr-1">
                  Giá:
               </span>
               {PRICE_RANGES.map((range, i) => (
                  <button
                     key={i}
                     onClick={() => onPriceChange(i)}
                     className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium border transition-all cursor-pointer ${
                        priceRange === i
                           ? "bg-promotion text-white border-promotion"
                           : "bg-neutral-light text-primary border-neutral hover:border-promotion/50 hover:bg-promotion-light"
                     }`}
                  >
                     {range.label}
                  </button>
               ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
               <ArrowUpDown size={14} className="text-neutral-dark shrink-0" />
               <div className="relative">
                  <select
                     value={sort}
                     onChange={(e) => onSortChange(e.target.value)}
                     className="text-xs pl-3 pr-7 py-2 rounded-xl border border-neutral bg-neutral-light text-primary font-medium appearance-none cursor-pointer focus:outline-none focus:border-promotion"
                  >
                     {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                           {opt.label}
                        </option>
                     ))}
                  </select>
                  <ChevronDown
                     size={12}
                     className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none"
                  />
               </div>
            </div>
         </div>

         {(search || priceRange !== 0) && (
            <p className="text-xs text-neutral-dark">
               Hiển thị{" "}
               <span className="font-semibold text-promotion">{filtered}</span>{" "}
               / {total} sản phẩm
            </p>
         )}
      </div>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────

function Pagination({
   current,
   total,
   onChange,
}: {
   current: number;
   total: number;
   onChange: (p: number) => void;
}) {
   if (total <= 1) return null;
   const pages = Array.from({ length: total }, (_, i) => i + 1);
   return (
      <div className="flex items-center justify-center gap-1.5 pt-6">
         <button
            onClick={() => onChange(current - 1)}
            disabled={current === 1}
            className="p-2 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50 transition-all cursor-pointer"
         >
            <ChevronLeft size={16} />
         </button>
         {pages.map((p, i) => {
            const showEllipsis = pages[i - 1] && p - pages[i - 1] > 1;
            return (
               <span key={p} className="flex items-center gap-1.5">
                  {showEllipsis && (
                     <span className="text-neutral-400 text-sm">…</span>
                  )}
                  <button
                     onClick={() => onChange(p)}
                     className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                        p === current
                           ? "bg-[#e24c5a] text-white shadow-md shadow-[#e24c5a]/30"
                           : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                     }`}
                  >
                     {p}
                  </button>
               </span>
            );
         })}
         <button
            onClick={() => onChange(current + 1)}
            disabled={current === total}
            className="p-2 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50 transition-all cursor-pointer"
         >
            <ChevronRight size={16} />
         </button>
      </div>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CLIENT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
   saleSchedule: SaleScheduleData;
}

export function FlashSaleClient({ saleSchedule }: Props) {
   const { schedule, todayProducts } = saleSchedule;

   const searchParams = useSearchParams();
   const dateParam = searchParams.get("date");
   const defaultDate = useMemo(() => {
      // Nếu có date param hợp lệ trong schedule → dùng nó
      if (dateParam && schedule.some((d) => d.date === dateParam))
         return dateParam;
      return schedule.find((d) => d.isToday)?.date ?? schedule[0]?.date ?? "";
   }, [schedule, dateParam]);

   const [activeDate, setActiveDate] = useState(defaultDate);
   const [loadingDate, setLoadingDate] = useState<string | null>(null);

   const [productsCache, setProductsCache] = useState<
      Record<string, CachedDayData>
   >(() => {
      const todayKey = schedule.find((d) => d.isToday)?.date ?? "";
      if (!todayKey || !todayProducts?.products?.length) return {};
      return {
         [todayKey]: {
            products: todayProducts.products,
            total: todayProducts.total,
            promotions: todayProducts.promotions ?? [],
            endDate: todayProducts.endDate,
         },
      };
   });

   // Filter state
   const [search, setSearch] = useState("");
   const [priceRange, setPriceRange] = useState(0);
   const [sort, setSort] = useState("price_asc");
   const [page, setPage] = useState(1);

   const fetchProductsForDate = useCallback(async (date: string) => {
      // Kiểm tra cache bằng cách dùng ref thay vì closure
      setProductsCache((prev) => {
         if (prev[date] !== undefined) return prev; // đã có, không fetch
         return prev; // trả về nguyên, việc fetch xử lý bên dưới
      });

      // Dùng ref để check cache tránh stale closure
      setLoadingDate(date);
      try {
         const res = await apiRequest.get<any>("/home/sale-by-date", {
            params: { date, limit: 100 },
         });
         const result = res.data;
         setProductsCache((prev) => {
            if (prev[date] !== undefined) return prev; // double-check
            return {
               ...prev,
               [date]: {
                  products: result.data ?? [],
                  total: result.total ?? 0,
                  promotions: result.promotions ?? [],
                  endDate: result.endDate ?? null,
               },
            };
         });
      } catch {
         setProductsCache((prev) => {
            if (prev[date] !== undefined) return prev;
            return {
               ...prev,
               [date]: {
                  products: [],
                  total: 0,
                  promotions: [],
                  endDate: null,
               },
            };
         });
      } finally {
         setLoadingDate(null);
      }
   }, []);

   useEffect(() => {
      if (!defaultDate) return;
      setActiveDate(defaultDate);
      // Chỉ fetch nếu chưa có trong cache
      setProductsCache((prev) => {
         if (prev[defaultDate] === undefined) {
            fetchProductsForDate(defaultDate);
         }
         return prev;
      });
   }, [defaultDate]);

   const handleDateSelect = (date: string) => {
      setActiveDate(date);
      setSearch("");
      setPriceRange(0);
      setSort("price_asc"); // ← thay "default"
      setPage(1);
      fetchProductsForDate(date);
   };

   // Data của ngày đang active
   const activeDay = schedule.find((d) => d.date === activeDate);
   const currentData = productsCache[activeDate];
   const isLoadingCurrent = loadingDate === activeDate;

   // Promotions: ưu tiên từ cache (có data thực), fallback sang schedule metadata
   const promotions = currentData?.promotions?.length
      ? currentData.promotions
      : (activeDay?.promotions?.map((p) => ({
           id: p.id,
           name: p.name,
           description: p.description,
           priority: p.priority,
        })) ?? []);

   const flashPromoRule = useMemo(
      () =>
         activeDay?.promotions
            ?.flatMap((p) => p.rules)
            .find(
               (r) =>
                  (r.actionType === "DISCOUNT_PERCENT" ||
                     r.actionType === "DISCOUNT_FIXED") &&
                  r.discountValue != null,
            ) ?? null,
      [activeDay],
   );

   // Normalize + filter + sort — chỉ chạy khi currentData thay đổi
   const allProducts = useMemo(
      () => (currentData?.products ?? []).map(normalizeProduct),
      [currentData],
   );

   const filtered = useMemo(() => {
      let list = [...allProducts];

      if (search.trim()) {
         const q = search.toLowerCase();
         list = list.filter(
            (p) =>
               p.name?.toLowerCase().includes(q) ||
               p.title?.toLowerCase().includes(q),
         );
      }

      const range = PRICE_RANGES[priceRange];
      if (range && (range.min > 0 || range.max !== Infinity)) {
         list = list.filter((p) => {
            const price = getProductPrice(p);
            return price >= range.min && price <= range.max;
         });
      }

      if (sort === "price_asc")
         list.sort((a, b) => getProductPrice(a) - getProductPrice(b));
      else if (sort === "price_desc")
         list.sort((a, b) => getProductPrice(b) - getProductPrice(a));
      else if (sort === "discount_desc")
         list.sort((a, b) => getProductDiscount(b) - getProductDiscount(a));

      return list;
   }, [allProducts, search, priceRange, sort]);

   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
   const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
   const hasSaleDays = schedule.some((d) => d.hasActiveSale);

   return (
      <div className="min-h-screen bg-neutral-light">
         {/* Date tabs */}
         <div className="container">
            {hasSaleDays && schedule.length > 0 && (
               <div className="mt-6">
                  <DateTabs
                     schedule={schedule}
                     activeDate={activeDate}
                     loadingDate={loadingDate}
                     onSelect={handleDateSelect}
                  />
               </div>
            )}
         </div>

         {/* Main content */}
         <div className="container py-6 space-y-5">
            {/* Promotion badges */}
            {promotions.length > 0 && (
               <div className="flex flex-wrap gap-2">
                  {promotions.map((promo) => (
                     <span
                        key={promo.id}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#e24c5a]/10 text-[#e24c5a] font-semibold border border-[#e24c5a]/20"
                     >
                        <Flame size={11} className="fill-[#e24c5a]" />
                        {promo.name}
                     </span>
                  ))}
               </div>
            )}

            {/* Loading skeleton */}
            {isLoadingCurrent ? (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                     <div
                        key={i}
                        className="rounded-xl border border-neutral bg-neutral-light-active animate-pulse h-64"
                     />
                  ))}
               </div>
            ) : allProducts.length > 0 ? (
               /* Có products */
               <>
                  <FilterBar
                     search={search}
                     onSearchChange={(v) => {
                        setSearch(v);
                        setPage(1);
                     }}
                     priceRange={priceRange}
                     onPriceChange={(v) => {
                        setPriceRange(v);
                        setPage(1);
                     }}
                     sort={sort}
                     onSortChange={(v) => {
                        setSort(v);
                        setPage(1);
                     }}
                     total={allProducts.length}
                     filtered={filtered.length}
                  />

                  {paginated.length > 0 ? (
                     <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                           {paginated.map((product, index) => (
                              <HotSaleProductCard
                                 key={`${product.id}-${index}`}
                                 product={product}
                                 index={index}
                                 flashPromoRule={flashPromoRule}
                                 isUpcoming={!!activeDay && !activeDay.isToday}
                              />
                           ))}
                        </div>
                        <Pagination
                           current={page}
                           total={totalPages}
                           onChange={(p) => {
                              setPage(p);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                           }}
                        />
                     </>
                  ) : (
                     <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Search className="w-12 h-12 text-neutral-200" />
                        <p className="text-base font-semibold text-neutral-400">
                           Không tìm thấy sản phẩm phù hợp
                        </p>
                        <button
                           onClick={() => {
                              setSearch("");
                              setPriceRange(0);
                           }}
                           className="text-sm text-[#e24c5a] hover:underline font-medium"
                        >
                           Xóa bộ lọc
                        </button>
                     </div>
                  )}
               </>
            ) : (
               /* Không có products */
               <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-20 h-20 rounded-full bg-[#e24c5a]/10 flex items-center justify-center">
                     <Calendar className="w-10 h-10 text-[#e24c5a]/40" />
                  </div>
                  <div className="text-center">
                     <p className="text-base font-semibold text-neutral-500">
                        {activeDay?.isToday
                           ? "Chưa có sản phẩm flash sale hôm nay"
                           : "Chương trình sale sắp diễn ra"}
                     </p>
                     {!activeDay?.isToday && activeDate && (
                        <p className="text-sm text-neutral-400 mt-1">
                           Ngày {formatDateLabel(activeDate)}
                        </p>
                     )}
                  </div>

                  {/* Preview promotions cho ngày sắp tới */}
                  {!activeDay?.isToday &&
                     (activeDay?.promotions?.length ?? 0) > 0 && (
                        <div className="flex flex-col items-center gap-2 mt-2">
                           <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide">
                              Chương trình sắp có
                           </p>
                           <div className="flex flex-wrap gap-2 justify-center">
                              {activeDay?.promotions.map((promo) => (
                                 <span
                                    key={promo.id}
                                    className="text-xs px-3 py-1.5 rounded-full border border-[#e24c5a]/30 text-[#e24c5a] font-medium"
                                 >
                                    {promo.name}
                                 </span>
                              ))}
                           </div>
                        </div>
                     )}
               </div>
            )}
         </div>
      </div>
   );
}
