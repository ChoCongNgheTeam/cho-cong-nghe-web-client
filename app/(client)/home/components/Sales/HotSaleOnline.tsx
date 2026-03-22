"use client";

/**
 * HotSaleOnline — Flash Sale section
 *
 * Dùng data từ GET /home (saleSchedule) + GET /home/sale-by-date
 *
 * Props:
 *   saleSchedule: HomeSaleScheduleResponse — từ home data
 *
 * Flow:
 * 1. Render tabs từ schedule (7 ngày), mỗi tab = 1 ngày
 * 2. Tab hôm nay: dùng todayProducts (load sẵn, không request thêm)
 * 3. Tab ngày khác: fetch /home/sale-by-date?date=YYYY-MM-DD khi click
 * 4. Countdown đếm ngược đến endDate của promotion active hôm nay
 */

import { useState, useEffect, useCallback, memo } from "react";
import { Slidezy } from "@/components/Slider";
import { Flame, ChevronRight, Calendar } from "lucide-react";
import HotSaleProductCard from "./HotSaleProductCard";
import apiRequest from "@/lib/api";

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
  promotions: Array<{ id: string; name: string; description: string | null; priority: number }>;
}

export interface HomeSaleScheduleData {
  schedule: SaleScheduleDay[];
  todayProducts: TodayProducts;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Format "18/03" từ ISO date string */
function formatDateTab(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

/** Format "HH:MM" từ ISO date string */
function formatTime(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

/** Label rút gọn của rule discount */
function getRuleLabel(rules: SaleScheduleRule[]): string {
  if (!rules.length) return "";
  const r = rules[0];
  if (r.actionType === "DISCOUNT_PERCENT" && r.discountValue) return `Giảm ${r.discountValue}%`;
  if (r.actionType === "DISCOUNT_FIXED" && r.discountValue) {
    const val = r.discountValue >= 1_000_000 ? `${(r.discountValue / 1_000_000).toFixed(0)}tr` : `${(r.discountValue / 1000).toFixed(0)}k`;
    return `Giảm ${val}`;
  }
  if (r.actionType === "BUY_X_GET_Y") return "Mua 1 tặng 1";
  if (r.actionType === "GIFT_PRODUCT") return "Tặng quà";
  if (r.actionType === "FREE_SHIPPING") return "Miễn ship";
  return "";
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTDOWN
// ─────────────────────────────────────────────────────────────────────────────

const Countdown = memo(function Countdown({ endDate }: { endDate: string | null }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, endDate ? new Date(endDate).getTime() - Date.now() : 0);
      setTimeLeft({
        hours: Math.floor(diff / 1000 / 3600),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <span className="font-bold text-promotion tabular-nums" suppressHydrationWarning>
      {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
    </span>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// TAB ITEM
// ─────────────────────────────────────────────────────────────────────────────

function TabItem({ day, isActive, isLoading, onClick }: { day: SaleScheduleDay; isActive: boolean; isLoading: boolean; onClick: () => void }) {
  const mainPromotion = day.promotions[0];
  const ruleLabel = mainPromotion ? getRuleLabel(mainPromotion.rules) : "";
  const endTime = mainPromotion?.endDate ? formatTime(mainPromotion.endDate) : null;
  const startTime = mainPromotion?.startDate ? formatTime(mainPromotion.startDate) : null;

  return (
    <button
      onClick={onClick}
      className={`shrink-0 min-w-[120px] px-4 py-3 text-center transition-all cursor-pointer relative ${
        isActive ? "bg-promotion-light border-b-2 border-promotion-hover" : day.hasActiveSale ? "hover:bg-neutral-light-active" : "hover:bg-neutral-light-active opacity-60"
      }`}
    >
      {/* Ngày */}
      <div className="font-semibold text-primary text-sm leading-tight flex items-center justify-center gap-1">
        {day.isToday ? <span className="text-promotion font-bold">Hôm nay</span> : <span>{formatDateTab(day.date)}</span>}
        {isLoading && <span className="w-3 h-3 border border-promotion border-t-transparent rounded-full animate-spin" />}
      </div>

      {/* Thời gian hoặc rule label */}
      <div className="text-[11px] mt-0.5 leading-tight">
        {day.isToday && mainPromotion?.endDate ? (
          <span className="text-primary">
            Kết thúc: <Countdown endDate={mainPromotion.endDate} />
          </span>
        ) : day.hasActiveSale ? (
          <span className="text-neutral-dark">{startTime && endTime ? `${startTime} – ${endTime}` : ruleLabel || "Có sale"}</span>
        ) : (
          <span className="text-neutral-dark/50">Không có sale</span>
        )}
      </div>

      {/* Badge rule label (không phải hôm nay) */}
      {/* {!day.isToday && ruleLabel && (
        <div className="mt-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-promotion/10 text-promotion font-medium">{ruleLabel}</span>
        </div>
      )} */}
      {!day.isToday && day.hasActiveSale && (
        <div className="mt-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-promotion/10 text-promotion font-medium">Sắp diễn ra</span>
        </div>
      )}

      {/* Badge "Nhiều KM" nếu > 1 promotion */}
      {/* {day.promotions.length > 1 && (
        <div className="absolute -top-1 -right-1">
          <span className="text-[9px] px-1 py-0.5 rounded-full bg-promotion text-white font-bold">{day.promotions.length}</span>
        </div>
      )} */}
    </button>
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

  // Tab đang được chọn — default là ngày hôm nay (index 0)
  const [activeDate, setActiveDate] = useState<string>(schedule.find((d) => d.isToday)?.date ?? schedule[0]?.date ?? "");
  const [loadingDate, setLoadingDate] = useState<string | null>(null);

  // Cache products theo ngày đã fetch
  const [productsCache, setProductsCache] = useState<
    Record<
      string,
      {
        products: SaleProduct[];
        total: number;
        promotions: Array<{ id: string; name: string; description: string | null; priority: number }>;
        endDate: string | null;
      }
    >
  >(() => {
    // Seed cache với today products
    const todayKey = schedule.find((d) => d.isToday)?.date ?? "";
    if (!todayKey || !todayProducts.products.length) return {};
    return {
      [todayKey]: {
        products: todayProducts.products,
        total: todayProducts.total,
        promotions: todayProducts.promotions,
        endDate: todayProducts.endDate,
      },
    };
  });

  // Fetch products cho 1 ngày
  const fetchProductsForDate = useCallback(
    async (date: string) => {
      if (productsCache[date] !== undefined) return; // đã có cache
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
        // Nếu lỗi — cache empty để không retry liên tục
        setProductsCache((prev) => ({ ...prev, [date]: { products: [], total: 0, promotions: [], endDate: null } }));
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
  const products = currentData?.products ?? [];
  const currentPromotions = currentData?.promotions ?? [];
  const currentEndDate = currentData?.endDate ?? null;
  const activeDay = schedule.find((d) => d.date === activeDate);

  // Nếu không có ngày nào có sale
  const hasSaleDays = schedule.some((d) => d.hasActiveSale);

  return (
    <section className="py-6 md:py-8">
      <div className="container">
        <div className="relative">
          {/* ── Header ── */}
          <div className="flex justify-center relative z-10">
            <div className="bg-promotion px-16 py-3 flex items-center gap-2 rounded-t-2xl">
              <Flame className="w-10 h-10 text-yellow-400 fill-yellow-400" />
              <h2 className="text-xl md:text-2xl font-black text-yellow-300 tracking-wider">FLASH SALE</h2>
            </div>
          </div>

          <div className="relative rounded-3xl border-4 border-promotion overflow-hidden bg-neutral-light -mt-1">
            {/* ── Tabs (7 ngày) ── */}
            <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-neutral">
              {hasSaleDays ? (
                schedule.map((day) => <TabItem key={day.date} day={day} isActive={activeDate === day.date} isLoading={loadingDate === day.date} onClick={() => handleTabClick(day.date)} />)
              ) : (
                // Fallback khi không có lịch sale nào
                <div className="flex items-center gap-2 px-4 py-3 text-[13px] text-neutral-dark">
                  <Calendar size={14} />
                  Không có chương trình sale nào sắp diễn ra
                </div>
              )}
            </div>

            {/* ── Promotion info bar (nếu có nhiều promotion trong ngày) ── */}
            {/* {currentPromotions.length > 1 && (
              <div className="flex gap-2 px-4 py-2 bg-promotion/5 border-b border-promotion/20 overflow-x-auto [scrollbar-width:none]">
                {currentPromotions.map((promo) => (
                  <span key={promo.id} className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-promotion/10 text-promotion font-medium whitespace-nowrap">
                    {promo.name}
                  </span>
                ))}
              </div>
            )} */}

            {/* ── Products ── */}
            <div className="px-4 py-3">
              {loadingDate === activeDate ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-neutral bg-neutral-light-active animate-pulse h-52" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                products.length <= 4 ? (
                  // ít card → dùng grid cố định 4 cột, card không bị stretch
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-2">
                    {products.map((item, index) => {
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
                      const flashPromoRule =
                        activeDay?.promotions?.flatMap((p) => p.rules).find((r) => (r.actionType === "DISCOUNT_PERCENT" || r.actionType === "DISCOUNT_FIXED") && r.discountValue != null) ?? null;

                      const isUpcoming = !!activeDay && !activeDay.isToday;

                      return (
                        <HotSaleProductCard
                          key={`${product.id}-${index}`}
                          product={product}
                          index={index}
                          flashPromoRule={flashPromoRule} // ← đổi prop
                          isUpcoming={isUpcoming}
                        />
                      );
                    })}
                  </div>
                ) : (
                  // nhiều card → dùng slider
                  <Slidezy
                    items={{ mobile: 1, tablet: 2, lg: 3, desktop: 4 }}
                    gap={16}
                    speed={300}
                    loop={false}
                    nav={true}
                    controls={{ mobile: false, tablet: false, lg: true, desktop: true }}
                    slideBy={1}
                    draggable={true}
                  >
                    {products.map((item, index) => {
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
                      const flashPromoRule =
                        activeDay?.promotions?.flatMap((p) => p.rules).find((r) => (r.actionType === "DISCOUNT_PERCENT" || r.actionType === "DISCOUNT_FIXED") && r.discountValue != null) ?? null;

                      const isUpcoming = !!activeDay && !activeDay.isToday;

                      return (
                        <HotSaleProductCard
                          key={`${product.id}-${index}`}
                          product={product}
                          index={index}
                          flashPromoRule={flashPromoRule} // ← đổi prop
                          isUpcoming={isUpcoming}
                        />
                      );
                    })}
                  </Slidezy>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Flame className="w-10 h-10 text-neutral opacity-30" />
                  <p className="text-[13px] text-neutral-dark">{activeDay?.hasActiveSale ? "Đang tải sản phẩm..." : "Chương trình sale sắp diễn ra"}</p>
                  {activeDay && !activeDay.isToday && activeDay.hasActiveSale && <p className="text-[12px] text-neutral-dark/60">Ngày {formatDateTab(activeDay.date)}</p>}
                </div>
              )}
            </div>

            {/* ── Footer link ── */}
            {products.length > 0 && (
              <div className="px-4 pb-3 flex justify-end">
                <a href={`/flash-sale?date=${activeDate}`} className="flex items-center gap-1 text-[12px] text-promotion font-medium hover:underline">
                  Xem tất cả <ChevronRight size={13} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
