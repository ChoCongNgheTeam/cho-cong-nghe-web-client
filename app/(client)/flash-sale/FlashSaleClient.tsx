"use client";

/**
 * FlashSaleClient
 *
 * Nhận saleSchedule từ SSR (page.tsx), KHÔNG fetch thêm API nào.
 * Products đã có trong saleSchedule.todayProducts và schedule[].promotions.
 *
 * Tất cả filter/search/sort đều client-side.
 */

import { useState, useMemo, memo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
   Flame,
   Search,
   ChevronDown,
   X,
   Tag,
   ArrowUpDown,
   ChevronLeft,
   ChevronRight,
   Loader2,
   Calendar,
} from "lucide-react";
import HotSaleProductCard from "../home/components/Sales/HotSaleProductCard";
import { SaleProduct, SaleScheduleData } from "../home/_libs";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const PRICE_RANGES = [
   { label: "Tất cả", min: 0, max: Infinity },
   { label: "Dưới 500k", min: 0, max: 500_000 },
   { label: "500k – 1tr", min: 500_000, max: 1_000_000 },
   { label: "1tr – 2tr", min: 1_000_000, max: 2_000_000 },
   { label: "2tr – 5tr", min: 2_000_000, max: 5_000_000 },
   { label: "Trên 5tr", min: 5_000_000, max: Infinity },
];

const SORT_OPTIONS = [
   { value: "default", label: "Mặc định" },
   { value: "price_asc", label: "Giá tăng dần" },
   { value: "price_desc", label: "Giá giảm dần" },
   { value: "discount_desc", label: "Giảm nhiều nhất" },
];

const PAGE_SIZE = 20;

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
   onSelect,
}: {
   schedule: SaleScheduleData["schedule"];
   activeDate: string;
   onSelect: (d: string) => void;
}) {
   return (
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
         {schedule.map((day) => {
            const isActive = activeDate === day.date;
            return (
               <button
                  key={day.date}
                  onClick={() => onSelect(day.date)}
                  className={`shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${
                     isActive
                        ? "bg-[#e24c5a] text-white border-[#e24c5a] shadow-lg shadow-[#e24c5a]/30"
                        : day.hasActiveSale
                          ? "bg-white border-neutral-200 text-neutral-700 hover:border-[#e24c5a]/50 hover:bg-[#e24c5a]/5"
                          : "bg-neutral-50 border-neutral-200 text-neutral-400 hover:bg-neutral-100"
                  }`}
               >
                  <span className="text-xs font-bold">
                     {day.isToday ? "Hôm nay" : formatDateTab(day.date)}
                  </span>
                  <span
                     className={`text-[10px] mt-0.5 ${isActive ? "text-yellow-200" : "text-[#e24c5a]"} ${!day.hasActiveSale ? "opacity-40 text-neutral-400" : ""}`}
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
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm space-y-4">
         {/* Search */}
         <div className="relative">
            <Search
               size={16}
               className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
               type="text"
               placeholder="Tìm sản phẩm trong Flash Sale..."
               value={search}
               onChange={(e) => onSearchChange(e.target.value)}
               className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-[#e24c5a] focus:ring-2 focus:ring-[#e24c5a]/10 outline-none transition-all"
            />
            {search && (
               <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
               >
                  <X size={14} />
               </button>
            )}
         </div>

         {/* Price + Sort */}
         <div className="flex flex-wrap gap-3 items-center">
            <div className="flex flex-wrap items-center gap-1.5">
               <Tag size={14} className="text-neutral-500 shrink-0" />
               <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide shrink-0">
                  Giá:
               </span>
               {PRICE_RANGES.map((range, i) => (
                  <button
                     key={i}
                     onClick={() => onPriceChange(i)}
                     className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all cursor-pointer ${
                        priceRange === i
                           ? "bg-[#e24c5a] text-white border-[#e24c5a]"
                           : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-[#e24c5a]/50"
                     }`}
                  >
                     {range.label}
                  </button>
               ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
               <ArrowUpDown size={14} className="text-neutral-500 shrink-0" />
               <div className="relative">
                  <select
                     value={sort}
                     onChange={(e) => onSortChange(e.target.value)}
                     className="text-xs pl-3 pr-7 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 font-medium appearance-none cursor-pointer focus:outline-none focus:border-[#e24c5a]"
                  >
                     {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                           {opt.label}
                        </option>
                     ))}
                  </select>
                  <ChevronDown
                     size={12}
                     className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                  />
               </div>
            </div>
         </div>

         {/* Result count */}
         {(search || priceRange !== 0) && (
            <p className="text-xs text-neutral-500">
               Hiển thị{" "}
               <span className="font-semibold text-[#e24c5a]">{filtered}</span>{" "}
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
   initialDate: string | null;
}

export function FlashSaleClient({ saleSchedule, initialDate }: Props) {
   const router = useRouter();
   const { schedule, todayProducts } = saleSchedule;

   // Xác định ngày active: ưu tiên URL param → hôm nay → đầu tiên
   const defaultDate = useMemo(() => {
      if (initialDate && schedule.find((d) => d.date === initialDate))
         return initialDate;
      return schedule.find((d) => d.isToday)?.date ?? schedule[0]?.date ?? "";
   }, [schedule, initialDate]);

   const [activeDate, setActiveDate] = useState(defaultDate);

   // Filter state
   const [search, setSearch] = useState("");
   const [priceRange, setPriceRange] = useState(0);
   const [sort, setSort] = useState("default");
   const [page, setPage] = useState(1);

   // Sync URL khi chuyển tab
   const handleDateSelect = (date: string) => {
      setActiveDate(date);
      setSearch("");
      setPriceRange(0);
      setSort("default");
      setPage(1);
      router.replace(`/flash-sale?date=${date}`, { scroll: false });
   };

   // ── Lấy products của ngày đang xem từ saleSchedule ──
   // Hôm nay: lấy từ todayProducts (đã có sẵn)
   // Ngày khác: không có API riêng → hiển thị thông tin promotion từ schedule
   const activeDay = schedule.find((d) => d.date === activeDate);
   const isToday = activeDay?.isToday ?? false;

   // Chỉ có products cho hôm nay (todayProducts)
   // Ngày khác chỉ có thể show "Sắp diễn ra" (không có products)
   const rawProducts: SaleProduct[] = useMemo(() => {
      if (isToday && todayProducts?.products?.length) {
         return todayProducts.products;
      }
      return [];
   }, [isToday, todayProducts]);

   const endDate = isToday ? (todayProducts?.endDate ?? null) : null;
   const promotions = isToday
      ? (todayProducts?.promotions ?? [])
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

   const isUpcoming = !!activeDay && !activeDay.isToday;

   // ── Normalize products ──
   const allProducts = useMemo(
      () => rawProducts.map(normalizeProduct),
      [rawProducts],
   );

   // ── Filter + Sort (client-side) ──
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

   // ── Pagination ──
   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
   const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

   const hasSaleDays = schedule.some((d) => d.hasActiveSale);

   return (
      <div className="min-h-screen bg-neutral-50">
         {/* ── Hero Banner ── */}
            <div className="container">
               {/* Date tabs */}
               {hasSaleDays && schedule.length > 0 && (
                  <div className="mt-6">
                     <DateTabs
                        schedule={schedule}
                        activeDate={activeDate}
                        onSelect={handleDateSelect}
                     />
                  </div>
               )}
            </div>

         {/* ── Main content ── */}
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

            {/* Có products (hôm nay) */}
            {isToday && allProducts.length > 0 ? (
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
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                           {paginated.map((product, index) => (
                              <HotSaleProductCard
                                 key={`${product.id}-${index}`}
                                 product={product}
                                 index={index}
                                 flashPromoRule={flashPromoRule}
                                 isUpcoming={false}
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
               /* Ngày khác / không có products */
               <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-20 h-20 rounded-full bg-[#e24c5a]/10 flex items-center justify-center">
                     <Calendar className="w-10 h-10 text-[#e24c5a]/40" />
                  </div>
                  <div className="text-center">
                     <p className="text-base font-semibold text-neutral-500">
                        {isToday
                           ? "Chưa có sản phẩm flash sale hôm nay"
                           : "Chương trình sale sắp diễn ra"}
                     </p>
                     {!isToday && activeDate && (
                        <p className="text-sm text-neutral-400 mt-1">
                           Ngày {formatDateLabel(activeDate)}
                        </p>
                     )}
                  </div>
                  {/* Hiển thị promotions preview cho ngày sắp tới */}
                  {!isToday && (activeDay?.promotions?.length ?? 0) > 0 && (
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
