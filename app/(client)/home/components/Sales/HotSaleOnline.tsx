"use client";

import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { Slidezy } from "@/components/Slider";
import { Flame, ChevronRight, Calendar } from "lucide-react";
import HotSaleProductCard from "./HotSaleProductCard";
import apiRequest from "@/lib/api";
import { formatTime as formatLocaleTime } from "@/helpers";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES (giữ nguyên)
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
  promotions: Array<{ id: string; name: string; description: string | null; priority: number }>;
}

export interface HomeSaleScheduleData {
  schedule: SaleScheduleDay[];
  todayProducts: TodayProducts;
}

interface CachedDayData {
  products: SaleProduct[];
  total: number;
  promotions: Array<{ id: string; name: string; description: string | null; priority: number }>;
  endDate: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — giữ màu gốc
// ─────────────────────────────────────────────────────────────────────────────

const BRAND_RED = "#e63946";
const BRAND_RED_DARK = "#c1121f";
const BRAND_RED_DEEPER = "#8b1a22";

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
// COUNTDOWN
// ─────────────────────────────────────────────────────────────────────────────

const DigitBox = memo(function DigitBox({ value }: { value: string }) {
  return (
    <span
      className="inline-flex items-center justify-center font-black tabular-nums"
      style={{
        background: "rgba(0,0,0,0.35)",
        color: "#fff",
        fontSize: "clamp(15px, 3.5vw, 20px)",
        minWidth: "clamp(26px, 5.5vw, 34px)",
        height: "clamp(28px, 6vw, 38px)",
        borderRadius: 6,
        letterSpacing: "-0.02em",
        /* Chiều sâu: bóng trong + viền mờ */
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.06), 0 1px 0 rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.1)",
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
    <div className="flex items-center gap-2 flex-wrap" suppressHydrationWarning>
      <span className="text-[11px] font-semibold text-white/60 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1">
        <DigitBox value={pad(timeLeft.hours)} />
        <span className="font-black text-white/40 text-sm leading-none mx-0.5">:</span>
        <DigitBox value={pad(timeLeft.minutes)} />
        <span className="font-black text-white/40 text-sm leading-none mx-0.5">:</span>
        <DigitBox value={pad(timeLeft.seconds)} />
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// TAB ITEM — tab active "nổi lên" bằng background sáng + underline trắng
// ─────────────────────────────────────────────────────────────────────────────

function TabItem({ day, isActive, isLoading, onClick }: { day: SaleScheduleDay; isActive: boolean; isLoading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 min-w-[100px] px-4 py-2.5 text-center transition-all cursor-pointer relative"
      style={{
        background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
        /* Phân cách dưới tab active = đường trắng */
        borderBottom: isActive ? "2.5px solid rgba(255,255,255,0.9)" : "2.5px solid transparent",
        opacity: !day.hasActiveSale && !day.isToday ? 0.4 : 1,
      }}
    >
      {/* Label chính */}
      <div className="font-bold text-white text-sm leading-tight flex items-center justify-center gap-1.5">
        {day.isToday ? (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase" style={{ background: "rgba(255,255,255,0.22)", color: "#fff" }}>
            Hôm nay
          </span>
        ) : (
          <span>{formatDateTab(day.date)}</span>
        )}
        {isLoading && <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />}
      </div>

      {/* Sub: giờ kết thúc hôm nay */}
      {day.isToday && day.promotions[0]?.endDate && (
        <div className="text-[10px] mt-0.5 text-white/65">
          Kết thúc: <span className="font-semibold text-white">{formatTime(day.promotions[0].endDate)}</span>
        </div>
      )}

      {/* Sub: nhãn sắp mở */}
      {!day.isToday && day.hasActiveSale && (
        <div className="mt-1">
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}>
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
      <Flame style={{ width: 72, height: 72, color: BRAND_RED, opacity: 0.18 }} strokeWidth={1.5} />
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
  const countdownEndDate = currentData?.endDate ?? todayPromotion?.endDate ?? null;
  const isCountingDown = activeDate === todayDate && !!countdownEndDate;

  return (
    <section className="py-6 md:py-8 bg-neutral-light-active">
      <div className="container">
        {/*
         * ── Outer shell ──────────────────────────────────────────────────────
         * Viền đỏ gốc + shadow có màu → tạo "hào quang" nhẹ quanh khối
         */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: `2px solid ${BRAND_RED_DARK}`,
            boxShadow: `0 2px 0 ${BRAND_RED_DEEPER}, 0 4px 0 ${BRAND_RED_DEEPER}cc, 0 6px 24px ${BRAND_RED}30`,
          }}
        >
          {/* ════════════════════════════════════════════════════════════════
           *  HEADER — gradient đỏ gốc
           * ════════════════════════════════════════════════════════════════ */}
          <div
            className="relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${BRAND_RED_DARK} 0%, ${BRAND_RED} 70%, #ff6b6b 100%)`,
            }}
          >
            {/* Radial glow trang trí */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 80% 50%, rgba(255,180,0,0.10) 0%, transparent 70%)",
              }}
            />

            {/* ── Title + Countdown ── */}
            <div className="relative z-10 flex items-center justify-between px-4 pt-3.5 pb-2.5 gap-3 flex-wrap">
              {/* Title */}
              <div className="flex items-center gap-2">
                <Flame className="shrink-0" style={{ width: 26, height: 26, color: "#FFD600", fill: "#FFD600" }} />
                <span className="font-black tracking-[0.1em] uppercase" style={{ fontSize: "clamp(18px, 4vw, 32px)", color: "#FFD600" }}>
                  Flash Sale
                </span>
              </div>

              {/* Countdown — bên phải title */}
              {isCountingDown && <Countdown endDate={countdownEndDate} label="Kết thúc sau" />}
            </div>

            {/*
             * ── Divider phân cách title ↔ tabs ───────────────────────────
             * Đường kẻ mờ trắng tạo nhịp thở, không dùng màu lạ
             */}
            <div
              className="relative z-10 mx-0"
              style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.2) 80%, transparent)",
              }}
            />

            {/* ── Tabs ── */}
            <div className="relative z-10 flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

          {/*
           * ── Phân cách header ↔ body ───────────────────────────────────────
           * Strip đỏ đậm hơn = "ngưỡng cửa" rõ ràng, tạo chiều sâu
           */}
          <div
            style={{
              height: 3,
              background: `linear-gradient(90deg, ${BRAND_RED_DEEPER}, ${BRAND_RED_DARK} 40%, ${BRAND_RED_DEEPER})`,
            }}
          />

          {/* ════════════════════════════════════════════════════════════════
           *  BODY — products
           * ════════════════════════════════════════════════════════════════ */}
          <div className="px-2 pt-3" style={{ background: "rgb(var(--neutral-light))" }}>
            {loadingDate === activeDate ? (
              <SkeletonGrid />
            ) : products.length > 0 ? (
              <ProductGrid products={products} activeDay={activeDay} />
            ) : (
              <EmptyState isUpcoming={!!activeDay && !activeDay.isToday} dateLabel={activeDay && !activeDay.isToday ? formatDateTab(activeDay.date) : undefined} />
            )}
          </div>

          {/* ── Footer ── */}
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
    </section>
  );
}
