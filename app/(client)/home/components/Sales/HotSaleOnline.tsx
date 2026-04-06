"use client";

/**
 * HotSaleOnline — Flash Sale section
 *
 * Props:
 *   saleSchedule: HomeSaleScheduleData — từ home data
 *
 * Flow:
 * 1. Render tabs từ schedule (7 ngày), mỗi tab = 1 ngày
 * 2. Tab hôm nay: dùng todayProducts (load sẵn)
 * 3. Tab ngày khác: fetch /home/sale-by-date?date=YYYY-MM-DD khi click
 * 4. Countdown đếm ngược đến endDate của promotion active hôm nay
 */

import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { Slidezy } from "@/components/Slider";
import { Flame, ChevronRight, Calendar } from "lucide-react";
import HotSaleProductCard from "./HotSaleProductCard";
import apiRequest from "@/lib/api";
import { formatTime as formatLocaleTime } from "@/helpers";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SaleScheduleRule {
  actionType: string;
  discountValue: number | null;
}

interface SaleSchedulePromotion {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  priority: number;
  targetsCount: number;
  rules: SaleScheduleRule[];
}

interface SaleScheduleDay {
  date: string;
  isToday: boolean;
  hasActiveSale: boolean;
  promotions: SaleSchedulePromotion[];
}

interface SaleProduct {
  card: any;
  pricingContext: any;
}

interface TodayProducts {
  products: SaleProduct[];
  total: number;
  date: string;
  startDate: string | null;
  endDate: string | null;
  promotions: Array<{
    id: string;
    name: string;
    description: string | null;
    priority: number;
  }>;
}

export interface HomeSaleScheduleData {
  schedule: SaleScheduleDay[];
  todayProducts: TodayProducts;
}

interface CachedDayData {
  products: SaleProduct[];
  total: number;
  promotions: Array<{
    id: string;
    name: string;
    description: string | null;
    priority: number;
  }>;
  endDate: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatDateTab(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "";
  return formatLocaleTime(dateStr);
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTDOWN — mỗi digit trong box riêng, phong cách flip-clock
// ─────────────────────────────────────────────────────────────────────────────

const DigitBox = memo(function DigitBox({ value }: { value: string }) {
  return (
    <span
      className="inline-flex items-center justify-center font-black tabular-nums rounded-md"
      style={{
        background: "#1a0a00",
        color: "#fff",
        fontSize: "clamp(16px, 4vw, 22px)",
        minWidth: "clamp(28px, 6vw, 36px)",
        height: "clamp(32px, 7vw, 42px)",
        letterSpacing: "-0.02em",
        boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {value}
    </span>
  );
});

const Countdown = memo(function Countdown({ endDate, label }: { endDate: string | null; label: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, endDate ? new Date(endDate).getTime() - Date.now() : 0);
      setTimeLeft({
        hours: Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff / 60_000) % 60),
        seconds: Math.floor((diff / 1_000) % 60),
      });
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5 flex-wrap" suppressHydrationWarning>
      <span className="text-[11px] font-semibold text-white/70 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1">
        <DigitBox value={pad(timeLeft.hours)} />
        <span className="font-black text-white/60 text-base leading-none">:</span>
        <DigitBox value={pad(timeLeft.minutes)} />
        <span className="font-black text-white/60 text-base leading-none">:</span>
        <DigitBox value={pad(timeLeft.seconds)} />
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// TAB ITEM
// ─────────────────────────────────────────────────────────────────────────────

function TabItem({ day, isActive, isLoading, onClick }: { day: SaleScheduleDay; isActive: boolean; isLoading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 min-w-[110px] px-4 py-2.5 text-center transition-all cursor-pointer relative ${
        isActive ? "bg-white/15 border-b-2 border-white" : day.hasActiveSale ? "hover:bg-white/10 opacity-80 hover:opacity-100" : "opacity-40 hover:opacity-60"
      }`}
    >
      <div className="font-bold text-white text-sm leading-tight flex items-center justify-center gap-1.5">
        {day.isToday ? (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase" style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}>
            Hôm nay
          </span>
        ) : (
          <span>{formatDateTab(day.date)}</span>
        )}
        {isLoading && <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />}
      </div>

      {day.isToday && day.promotions[0]?.endDate && (
        <div className="text-[10px] mt-0.5 text-white/70">
          Kết thúc: <span className="font-semibold text-white">{formatTime(day.promotions[0].endDate)}</span>
        </div>
      )}

      {!day.isToday && day.hasActiveSale && (
        <div className="mt-1">
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
            Sắp mở
          </span>
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE — min-height cố định tránh layout shift
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ isUpcoming, dateLabel }: { isUpcoming: boolean; dateLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6" style={{ minHeight: "320px" }}>
      <Flame style={{ width: 72, height: 72, color: "#e63946", opacity: 0.18 }} strokeWidth={1.5} />
      <p className="text-sm font-semibold" style={{ color: "rgb(var(--neutral-dark))" }}>
        {isUpcoming ? "Chương trình sale sắp diễn ra" : "Sản phẩm Sale đang được cập nhật..."}
      </p>
      {dateLabel && (
        <p className="text-xs" style={{ color: "rgb(var(--neutral-dark))", opacity: 0.5 }}>
          Ngày {dateLabel}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT GRID — cố định min-height để tránh layout shift
// ─────────────────────────────────────────────────────────────────────────────

function ProductGrid({ products, activeDay }: { products: SaleProduct[]; activeDay: SaleScheduleDay | undefined }) {
  const flashPromoRule = useMemo(
    () => activeDay?.promotions?.flatMap((p) => p.rules).find((r) => (r.actionType === "DISCOUNT_PERCENT" || r.actionType === "DISCOUNT_FIXED") && r.discountValue != null) ?? null,
    [activeDay],
  );

  const isUpcoming = !!activeDay && !activeDay.isToday;

  const renderCard = (item: SaleProduct, index: number) => {
    const raw = item.card ?? item;
    const product = {
      ...raw,
      price: raw.price ?? {
        base: raw.priceOrigin ?? 0,
        final: raw.priceOrigin ?? 0,
        discountAmount: 0,
        discountPercentage: 0,
        hasPromotion: false,
      },
    };

    return <HotSaleProductCard key={`${product.id}-${index}`} product={product} index={index} flashPromoRule={flashPromoRule} isUpcoming={isUpcoming} />;
  };

  if (products.length <= 4) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-stretch" style={{ minHeight: "320px" }}>
        {products.map(renderCard)}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "320px" }}>
      <Slidezy
        items={{ mobile: 2, tablet: 2, lg: 3, desktop: 4 }}
        gap={16}
        speed={300}
        loop={false}
        nav={true}
        controls={{ mobile: false, tablet: false, lg: true, desktop: true }}
        slideBy={1}
        draggable={true}
      >
        {products.map(renderCard)}
      </Slidezy>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON LOADER — same min-height
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-4" style={{ minHeight: "320px" }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-neutral bg-neutral-light-active animate-pulse h-52" />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

// Design token — đỏ ấm "design red", không phải đỏ cảnh báo
const BRAND_RED = "#e63946";
const BRAND_RED_DARK = "#c1121f";
const BRAND_RED_DEEPER = "#8b1a22";

interface HotSaleOnlineProps {
  saleSchedule: HomeSaleScheduleData;
}

export function HotSaleOnline({ saleSchedule }: HotSaleOnlineProps) {
  const { schedule, todayProducts } = saleSchedule;

  const todayDate = schedule.find((d) => d.isToday)?.date ?? schedule[0]?.date ?? "";

  const [activeDate, setActiveDate] = useState<string>(todayDate);
  const [loadingDate, setLoadingDate] = useState<string | null>(null);

  const [productsCache, setProductsCache] = useState<Record<string, CachedDayData>>(() => {
    if (!todayDate || !todayProducts?.products?.length) return {};
    return {
      [todayDate]: {
        products: todayProducts.products,
        total: todayProducts.total,
        promotions: todayProducts.promotions ?? [],
        endDate: todayProducts.endDate,
      },
    };
  });

  const fetchProductsForDate = useCallback(
    async (date: string) => {
      if (productsCache[date] !== undefined) return;
      setLoadingDate(date);
      try {
        const res = await apiRequest.get<any>("/home/sale-by-date", {
          params: { date, limit: 20 },
        });
        const result = res.data;
        setProductsCache((prev) => ({
          ...prev,
          [date]: {
            products: result.data ?? [],
            total: result.total ?? 0,
            promotions: result.promotions ?? [],
            endDate: result.endDate ?? null,
          },
        }));
      } catch {
        setProductsCache((prev) => ({
          ...prev,
          [date]: { products: [], total: 0, promotions: [], endDate: null },
        }));
      } finally {
        setLoadingDate(null);
      }
    },
    [productsCache],
  );

  const handleTabClick = (date: string) => {
    setActiveDate(date);
    fetchProductsForDate(date);
  };

  const currentData = productsCache[activeDate];
  const activeDay = schedule.find((d) => d.date === activeDate);

  const products = useMemo(
    () =>
      [...(currentData?.products ?? [])].sort((a, b) => {
        const priceA = (a.card ?? a)?.price?.final ?? (a.card ?? a)?.priceOrigin ?? 0;
        const priceB = (b.card ?? b)?.price?.final ?? (b.card ?? b)?.priceOrigin ?? 0;
        return priceA - priceB;
      }),
    [currentData],
  );

  const hasSaleDays = schedule.some((d) => d.hasActiveSale);
  const todayPromotion = schedule.find((d) => d.isToday)?.promotions[0] ?? null;

  // Thời gian của tab hôm nay: countdown kết thúc hoặc bắt đầu
  const countdownEndDate = currentData?.endDate ?? todayPromotion?.endDate ?? null;
  const isCountingDown = activeDate === todayDate && !!countdownEndDate;

  return (
    <section className="py-6 md:py-8">
      <div className="container">
        <div className="relative">
          {/* ── Outer wrapper với border đỏ ấm ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: `3px solid ${BRAND_RED}`,
              boxShadow: `0 4px 32px ${BRAND_RED}28`,
            }}
          >
            {/* ── Header: gradient đỏ đẹp + title + countdown ── */}
            <div
              className="relative overflow-hidden"
              style={{
                background: `linear-gradient(
                              135deg,
                              ${BRAND_RED_DARK} 0%,
                              ${BRAND_RED} 70%,
                              #ff6b6b 100%
                           )`,
              }}
            >
              {/* Decorative radial glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at 80% 50%, rgba(255,180,0,0.12) 0%, transparent 70%)",
                }}
              />

              {/* Title row */}
              <div className="relative flex items-center justify-between px-4 pt-3 pb-1 gap-4 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <Flame className="shrink-0" style={{ width: 28, height: 28, color: "#FFD600", fill: "#FFD600" }} />
                  <span
                    className="font-black tracking-[0.12em] uppercase"
                    style={{
                      fontSize: "clamp(16px, 4vw, 22px)",
                      color: "#FFD600",
                      textShadow: "0 1px 8px rgba(0,0,0,0.3)",
                    }}
                  >
                    Flash Sale
                  </span>
                </div>

                {/* Countdown — chỉ hiện khi đang xem tab hôm nay */}
                {isCountingDown && <Countdown endDate={countdownEndDate} label="Kết thúc sau" />}
              </div>

              {/* ── Tabs ── */}
              <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mt-1">
                {hasSaleDays ? (
                  schedule.map((day) => <TabItem key={day.date} day={day} isActive={activeDate === day.date} isLoading={loadingDate === day.date} onClick={() => handleTabClick(day.date)} />)
                ) : (
                  <div className="flex items-center gap-2 px-4 py-3 text-[13px] text-white/60">
                    <Calendar size={14} />
                    Không có chương trình sale nào sắp diễn ra
                  </div>
                )}
              </div>
            </div>

            {/* ── Products area ── */}
            <div className="px-2 pt-3" style={{ background: "rgb(var(--neutral-light))" }}>
              {loadingDate === activeDate ? (
                <SkeletonGrid />
              ) : products.length > 0 ? (
                <ProductGrid products={products} activeDay={activeDay} />
              ) : (
                <EmptyState isUpcoming={!!activeDay && !activeDay.isToday} dateLabel={activeDay && !activeDay.isToday ? formatDateTab(activeDay.date) : undefined} />
              )}
            </div>

            {/* ── Footer link ── */}
            {products.length > 0 && (
              <div
                className="px-4 py-2.5 flex justify-end border-t"
                style={{
                  background: "rgb(var(--neutral-light))",
                  borderColor: "rgb(var(--neutral))",
                }}
              >
                <Link href={`/flash-sale?date=${activeDate}`} className="flex items-center gap-1 text-[12px] font-semibold hover:underline" style={{ color: BRAND_RED }}>
                  Xem tất cả <ChevronRight size={13} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
