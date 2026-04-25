"use client";

import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { Slidezy } from "@/components/Slider";
import { Flame, ChevronRight, Calendar } from "lucide-react";
import HotSaleProductCard from "./HotSaleProductCard";
import apiRequest from "@/lib/api";
import { formatTime as formatLocaleTime } from "@/helpers";
import Link from "next/link";
import { FeaturedProduct } from "../../types";

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

export interface SaleProduct {
  card: any;
  pricingContext: any;
}

interface TodayProducts {
  products: FeaturedProduct[];
  total: number;
  date: string;
  startDate: string | null;
  endDate: string | null;
  promotions: Array<{ id: string; name: string; description: string | null; priority: number }>;
}

export interface HomeSaleScheduleData {
  schedule: SaleScheduleDay[];
  todayProducts: TodayProducts;
}

interface CachedDayData {
  products: FeaturedProduct[];
  total: number;
  promotions: Array<{ id: string; name: string; description: string | null; priority: number }>;
  endDate: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_RED = "#e63946";
const ACCENT_RED_DARK = "#c1121f";

// Header navy — sync với site header xanh đậm
const HEADER_BG_FROM = "#1f3042";
const HEADER_BG_MID = "#162035";
const HEADER_BG_TO = "#1e2d45";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatDateTab(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "";
  return formatLocaleTime(dateStr);
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTDOWN — pill nổi, dấu ":" đỏ accent
// ─────────────────────────────────────────────────────────────────────────────

const DigitBox = memo(function DigitBox({ value }: { value: string }) {
  return (
    <span
      className="inline-flex items-center justify-center font-black tabular-nums"
      style={{
        background: "rgba(0,0,0,0.55)",
        color: "#ffffff",
        fontSize: "clamp(14px, 3vw, 20px)",
        minWidth: "clamp(28px, 5.5vw, 36px)",
        height: "clamp(30px, 6vw, 40px)",
        borderRadius: 7,
        letterSpacing: "-0.01em",
        // ✅ Ring trắng mỏng → digit cell nổi rõ trên nền navy
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -2px 0 rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.15)",
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

  // ✅ Separator đỏ accent thay vì trắng mờ → "bắn lửa" giữa các số
  const Sep = () => (
    <span className="font-black select-none" style={{ color: ACCENT_RED, fontSize: "clamp(16px, 3vw, 22px)", lineHeight: 1, marginBottom: 1 }}>
      :
    </span>
  );

  return (
    // ✅ Bọc trong pill tối + border trắng → cả khối countdown nổi như badge
    <div
      className="flex items-center gap-2 flex-wrap px-3 py-1.5 rounded-xl"
      style={{
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
      suppressHydrationWarning
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "rgba(255,255,255,0.5)" }}>
        {label}
      </span>
      <div className="flex items-center gap-1">
        <DigitBox value={pad(timeLeft.hours)} />
        <Sep />
        <DigitBox value={pad(timeLeft.minutes)} />
        <Sep />
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
      className="shrink-0 min-w-[100px] px-4 py-2.5 text-center transition-all cursor-pointer"
      style={{
        background: isActive ? "rgba(230, 57, 70, 0.15)" : "transparent",
        borderBottom: isActive ? `2.5px solid ${ACCENT_RED}` : "2.5px solid transparent",
        opacity: !day.hasActiveSale && !day.isToday ? 0.4 : 1,
      }}
    >
      <div className="font-bold text-white text-sm leading-tight flex items-center justify-center gap-1.5">
        {day.isToday ? (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
            Hôm nay
          </span>
        ) : (
          <span>{formatDateTab(day.date)}</span>
        )}
        {isLoading && <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />}
      </div>

      {day.isToday && day.promotions[0]?.endDate && (
        <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
          Kết thúc: <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{formatTime(day.promotions[0].endDate)}</span>
        </div>
      )}

      {!day.isToday && day.hasActiveSale && (
        <div className="mt-1">
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.10)", color: "#fff" }}>
            Sắp mở
          </span>
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ isUpcoming, dateLabel }: { isUpcoming: boolean; dateLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6" style={{ minHeight: 320 }}>
      <Flame style={{ width: 72, height: 72, color: ACCENT_RED, opacity: 0.18 }} strokeWidth={1.5} />
      <p className="text-sm font-semibold" style={{ color: "rgb(var(--neutral-dark))" }}>
        {isUpcoming ? "Chương trình sale sắp diễn ra" : "Sản phẩm Sale đang được cập nhật..."}
      </p>
      {dateLabel && (
        <p className="text-xs opacity-50" style={{ color: "rgb(var(--neutral-dark))" }}>
          Ngày {dateLabel}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT GRID
// ─────────────────────────────────────────────────────────────────────────────

function ProductGrid({ products, activeDay }: { products: FeaturedProduct[]; activeDay: SaleScheduleDay | undefined }) {
  const flashPromoRule = useMemo(
    () => activeDay?.promotions?.flatMap((p) => p.rules).find((r) => (r.actionType === "DISCOUNT_PERCENT" || r.actionType === "DISCOUNT_FIXED") && r.discountValue != null) ?? null,
    [activeDay],
  );

  const isUpcoming = !!activeDay && !activeDay.isToday;

  const renderCard = (item: FeaturedProduct, index: number) => {
    const product = {
      ...item,
      price: item.price ?? {
        base: item.priceOrigin ?? 0,
        final: item.priceOrigin ?? 0,
        discountAmount: 0,
        discountPercentage: 0,
        hasPromotion: false,
      },
    };
    return <HotSaleProductCard key={`${product.id}-${index}`} product={product} index={index} flashPromoRule={flashPromoRule} isUpcoming={isUpcoming} />;
  };

  if (products.length <= 4) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-stretch" style={{ minHeight: 320 }}>
        {products.map(renderCard)}
      </div>
    );
  }

  return (
    <div style={{ minHeight: 320 }}>
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
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-4" style={{ minHeight: 320 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-neutral bg-neutral-light-active animate-pulse h-52" />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

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
        const res = await apiRequest.get<any>("/home/sale-by-date", { params: { date, limit: 20 } });
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
        const priceA = a.price?.final ?? a.priceOrigin ?? 0;
        const priceB = b.price?.final ?? b.priceOrigin ?? 0;
        return priceA - priceB;
      }),
    [currentData],
  );

  const hasSaleDays = schedule.some((d) => d.hasActiveSale);
  const todayPromotion = schedule.find((d) => d.isToday)?.promotions[0] ?? null;
  const countdownEndDate = currentData?.endDate ?? todayPromotion?.endDate ?? null;
  const isCountingDown = activeDate === todayDate && !!countdownEndDate;

  return (
    <section className="py-6 md:py-8 bg-neutral-light">
      <div className="container">
        {/*
         * ✅ Outer shell:
         * - Left border đỏ 3px → signature nhận dạng sale
         * - Bottom border đỏ → "ngưỡng cửa" chuyển sang content
         * - Box shadow có tint đỏ rất nhẹ → glow ambient sale
         */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            borderTop: "1.5px solid rgba(255,255,255,0.05)",
            borderLeft: `3px solid ${ACCENT_RED_DARK}`,
            borderRight: "1.5px solid rgba(255,255,255,0.05)",
            borderBottom: `2px solid ${ACCENT_RED}`,
            boxShadow: `
              0 4px 32px rgba(13,27,42,0.22),
              0 0 0 1px rgba(230,57,70,0.07),
              0 8px 24px rgba(230,57,70,0.06)
            `,
          }}
        >
          {/* ════════════════════════════════════════════════════════════
           *  HEADER — navy + glow đỏ từ dưới (lửa bốc)
           * ════════════════════════════════════════════════════════════ */}
          <div
            className="relative overflow-hidden"
            style={{
              background: `linear-gradient(160deg, ${HEADER_BG_FROM} 0%, ${HEADER_BG_MID} 55%, ${HEADER_BG_TO} 100%)`,
            }}
          >
            {/* ✅ Glow đỏ từ dưới-trái + dưới-phải → hiệu ứng "lửa bốc lên" */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(ellipse at 12% 130%, rgba(230,57,70,0.25) 0%, transparent 48%),
                  radial-gradient(ellipse at 88% 130%, rgba(230,57,70,0.12) 0%, transparent 38%)
                `,
              }}
            />

            {/* Title + Countdown row */}
            <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-3 gap-3 flex-wrap">
              {/* Title */}
              <div className="flex items-center gap-3">
                {/* ✅ Icon lửa với drop-shadow đỏ-cam → nổi bật */}
                <div style={{ filter: "drop-shadow(0 0 8px rgba(255,100,50,0.75))" }}>
                  <Flame style={{ width: 28, height: 28, color: "#FF6B35", fill: "#FF6B35" }} />
                </div>

                <div className="flex flex-col leading-none gap-1">
                  <span
                    className="font-black uppercase tracking-[0.14em] text-white"
                    style={{
                      fontSize: "clamp(17px, 3.8vw, 27px)",
                      // ✅ Text glow đỏ nhẹ → chữ có warmth trên nền lạnh
                      textShadow: "0 0 20px rgba(230,57,70,0.3)",
                    }}
                  >
                    Flash Sale
                  </span>
                  {/* Gạch accent đỏ glow bên dưới chữ */}
                  <span
                    className="block rounded-full"
                    style={{
                      height: 2.5,
                      width: "55%",
                      background: `linear-gradient(90deg, ${ACCENT_RED} 0%, rgba(230,57,70,0.3) 70%, transparent 100%)`,
                      boxShadow: `0 0 6px rgba(230,57,70,0.5)`,
                    }}
                  />
                </div>
              </div>

              {/* ✅ Countdown pill */}
              {isCountingDown && <Countdown endDate={countdownEndDate} label="Kết thúc sau" />}
            </div>

            {/* Divider mờ */}
            <div
              className="relative z-10"
              style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 20%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.07) 80%, transparent)",
              }}
            />

            {/* Tabs */}
            <div className="relative z-10 flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {hasSaleDays ? (
                schedule.map((day) => <TabItem key={day.date} day={day} isActive={activeDate === day.date} isLoading={loadingDate === day.date} onClick={() => handleTabClick(day.date)} />)
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <Calendar size={14} />
                  Không có chương trình sale nào sắp diễn ra
                </div>
              )}
            </div>
          </div>

          {/* ✅ Phân cách header ↔ body: đường đỏ có glow */}
          <div
            style={{
              height: 2,
              background: `linear-gradient(90deg, transparent 0%, ${ACCENT_RED_DARK} 15%, ${ACCENT_RED} 50%, ${ACCENT_RED_DARK} 85%, transparent 100%)`,
              boxShadow: `0 0 10px rgba(230,57,70,0.45)`,
            }}
          />

          {/* Body */}
          <div className="px-2 pt-3" style={{ background: "rgb(var(--neutral-light))" }}>
            {loadingDate === activeDate ? (
              <SkeletonGrid />
            ) : products.length > 0 ? (
              <ProductGrid products={products} activeDay={activeDay} />
            ) : (
              <EmptyState isUpcoming={!!activeDay && !activeDay.isToday} dateLabel={activeDay && !activeDay.isToday ? formatDateTab(activeDay.date) : undefined} />
            )}
          </div>

          {/* Footer */}
          {products.length > 0 && (
            <div className="px-4 py-2.5 flex justify-end border-t" style={{ background: "rgb(var(--neutral-light))", borderColor: "rgb(var(--neutral))" }}>
              <Link
                href={`/flash-sale?date=${activeDate}`}
                className="flex items-center gap-1 text-[12px] font-semibold hover:underline transition-opacity hover:opacity-80"
                style={{ color: ACCENT_RED }}
              >
                Xem tất cả <ChevronRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
