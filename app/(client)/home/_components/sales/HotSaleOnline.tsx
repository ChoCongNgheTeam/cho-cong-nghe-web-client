"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ChevronRight, Calendar, Flame } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { flashSale } from "./flashSaleTheme";
import FlashSaleCountdown from "./FlashSaleCountdown";
import { FlashSaleTabItem, formatDateTab } from "./FlashSaleTabs";
import { FlashSaleProductGrid, FlashSaleSkeletonGrid, FlashSaleEmptyState } from "./FlashSaleProductGrid";
import type { SaleScheduleData, SaleScheduleRule, CachedDayData, TodayProductPromotion } from "@/(client)/home/_lib/types";
import { logError } from "@/lib/monitoring/log-error";
import { fetchSaleByDate } from "@/(client)/home/_lib/home.api";

interface HotSaleOnlineProps {
  saleSchedule: SaleScheduleData;
}

export function HotSaleOnline({ saleSchedule }: HotSaleOnlineProps) {
  const { schedule, todayProducts } = saleSchedule;
  const todayDate = schedule.find((d) => d.isToday)?.date ?? schedule[0]?.date ?? "";

  const [activeDate, setActiveDate] = useState<string>(todayDate);
  const [loadingDate, setLoadingDate] = useState<string | null>(null);
  const [productsCache, setProductsCache] = useState<Record<string, CachedDayData>>(() => {
    if (!todayDate || !todayProducts?.products?.length) return {};
    return { [todayDate]: { products: todayProducts.products, total: todayProducts.total, promotions: todayProducts.promotions ?? [], endDate: todayProducts.endDate } };
  });

  const productsCacheRef = useRef(productsCache);
  useEffect(() => {
    productsCacheRef.current = productsCache;
  }, [productsCache]);

  const fetchProductsForDate = useCallback(async (date: string) => {
    if (productsCacheRef.current[date] !== undefined) return;
    setLoadingDate(date);
    try {
      const res = await fetchSaleByDate(date, 20);
      const payload = res.data;
      setProductsCache((prev) => ({
        ...prev,
        [date]: {
          products: payload.data ?? [],
          total: payload.total ?? 0,
          promotions: payload.promotions ?? [],
          endDate: payload.endDate ?? null,
        },
      }));
    } catch (error) {
      logError("HotSaleOnline: fetchSaleByDate failed", error, { date });
      setProductsCache((prev) => ({
        ...prev,
        [date]: { products: [], total: 0, promotions: [] as TodayProductPromotion[], endDate: null },
      }));
    } finally {
      setLoadingDate(null);
    }
  }, []);

  const tabClickHandlers = useMemo(
    () =>
      Object.fromEntries(
        schedule.map((day) => [
          day.date,
          () => {
            setActiveDate(day.date);
            fetchProductsForDate(day.date);
          },
        ]),
      ),
    [schedule, fetchProductsForDate],
  );

  const currentData = productsCache[activeDate];
  const activeDay = useMemo(() => schedule.find((d) => d.date === activeDate), [schedule, activeDate]);

  const products = useMemo(
    () =>
      (Array.isArray(currentData?.products) ? [...currentData.products] : []).sort((a, b) => {
        const priceA = a.price?.final ?? a.priceOrigin ?? 0;
        const priceB = b.price?.final ?? b.priceOrigin ?? 0;
        return priceA - priceB;
      }),
    [currentData],
  );

  const flashPromoRule: SaleScheduleRule | null = useMemo(
    () => activeDay?.promotions?.flatMap((p) => p.rules).find((r) => (r.actionType === "DISCOUNT_PERCENT" || r.actionType === "DISCOUNT_FIXED") && r.discountValue != null) ?? null,
    [activeDay],
  );

  const isUpcoming = !!activeDay && !activeDay.isToday;
  const hasSaleDays = schedule.some((d) => d.hasActiveSale);
  const todayPromotion = schedule.find((d) => d.isToday)?.promotions[0] ?? null;
  const countdownEndDate = currentData?.endDate ?? todayPromotion?.endDate ?? null;
  const isCountingDown = activeDate === todayDate && !!countdownEndDate;

  return (
    <section className="py-1 md:py-3 mt-10">
      <div className="container">
        <div className="relative">
          {/* Banner — nhô lên trên đỉnh dome, tự fade vào nền xanh */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-10 md:-top-14 z-30 pointer-events-none select-none w-[46%] max-w-[440px]"
            style={{
              maskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
            }}
          >
            <Image src="/flash-sale-banner.png" alt="" width={1536} height={540} className="w-full h-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]" priority />
          </div>

          {/* DOME XANH — đứng riêng, KHÔNG nằm trong overflow-hidden của card dưới */}
          <div
            className="relative"
            style={{
              background: flashSale.headerGradient,
              borderRadius: "50% 50% 0 0 / 40px 40px 0 0",
              borderTop: "1.5px solid rgba(255,255,255,0.05)",
              borderLeft: `3px solid ${flashSale.promotionDark}`,
              borderRight: "1.5px solid rgba(255,255,255,0.05)",
              paddingTop: 30,
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: flashSale.headerGlow, borderRadius: "50% 50% 0 0 / 40px 40px 0 0" }} />

            <div className="relative z-10 flex items-center justify-between px-4 pt-2 pb-3 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div style={{ filter: `drop-shadow(0 0 8px rgb(var(--accent) / 0.75))` }}>
                  <Flame style={{ width: 28, height: 28, color: flashSale.accent, fill: flashSale.accent }} />
                </div>
                <div className="flex flex-col leading-none gap-1">
                  <span className="font-black uppercase tracking-[0.14em] text-white" style={{ fontSize: "clamp(17px, 3.8vw, 27px)", textShadow: `0 0 20px rgb(var(--promotion) / 0.3)` }}>
                    Flash Sale
                  </span>
                  <span
                    className="block rounded-full"
                    style={{
                      height: 2.5,
                      width: "55%",
                      background: `linear-gradient(90deg, ${flashSale.promotion} 0%, rgb(var(--promotion) / 0.3) 70%, transparent 100%)`,
                      boxShadow: `0 0 6px rgb(var(--promotion) / 0.5)`,
                    }}
                  />
                </div>
              </div>

              {isCountingDown && <FlashSaleCountdown endDate={countdownEndDate} label="Kết thúc sau" />}
            </div>
          </div>

          {/* CARD DƯỚI — divider + tabs + body + footer, GIỮ overflow-hidden + bo góc riêng cho phần này */}
          <div
            className="rounded-b-2xl overflow-hidden"
            style={{
              borderLeft: `3px solid ${flashSale.promotionDark}`,
              borderRight: "1.5px solid rgba(255,255,255,0.05)",
              borderBottom: `2px solid ${flashSale.promotion}`,
              boxShadow: `0 4px 32px rgba(0,0,0,0.18), 0 0 0 1px rgb(var(--promotion) / 0.07), 0 8px 24px rgb(var(--promotion) / 0.06)`,
            }}
          >
            {/* Đường viền sắc nét phân tách dome xanh với phần tabs */}
            <div
              className="relative z-10"
              style={{
                height: 3,
                background: `linear-gradient(90deg, transparent 0%, ${flashSale.promotionDark} 15%, ${flashSale.promotion} 50%, ${flashSale.promotionDark} 85%, transparent 100%)`,
                boxShadow: `0 0 12px rgb(var(--promotion) / 0.5)`,
              }}
            />

            {/* TABS — nền surface, padding gọn lại để hết khoảng trắng chết */}
            <div className="bg-surface px-2 py-1.5">
              <div className="relative z-10 flex lg:gap-6 md:gap-4 gap-2 items-center justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border border-surface-border rounded-full">
                {hasSaleDays ? (
                  <>
                    {/* Left decoration */}
                    <div className="shrink-0 flex items-center gap-1.5 px-2 pointer-events-none select-none">
                      <Image src="/2026_left_icon.png" alt="" width={32} height={32} className="animate-bounce" style={{ animationDuration: "4s", animationDelay: "0s" }} />
                    </div>

                    {/* Tabs */}
                    <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ">
                      {schedule.map((day) => (
                        <FlashSaleTabItem key={day.date} day={day} isActive={activeDate === day.date} isLoading={loadingDate === day.date} onClick={tabClickHandlers[day.date]} />
                      ))}
                    </div>

                    {/* Right decoration */}
                    <div className="shrink-0 flex items-center gap-3 px-2 pointer-events-none select-none">
                      <Image src="/2026_right_icon.png" alt="" width={32} height={32} className="animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.6s" }} />
                    </div>

                    {/* Firework — ghim sát phải */}
                    <div className="absolute right-3 bottom-1 pointer-events-none select-none">
                      <div className="relative w-20 h-20">
                        <style>{`
      @keyframes fw-burst {
        0%   { transform: scale(0); opacity: 1; }
        60%  { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.3); opacity: 0; }
      }
      @keyframes fw-particle {
        0%   { transform: translate(0,0) scale(1); opacity: 1; }
        100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
      }
      .fw-dot {
        position: absolute;
        width: 6px; height: 6px;
        border-radius: 50%;
        top: 50%; left: 50%;
        margin: -3px 0 0 -3px;
        animation: fw-particle 1.4s ease-out infinite;
        animation-delay: var(--delay, 0s);
      }
      .fw-core {
        position: absolute;
        inset: 30%;
        border-radius: 50%;
        animation: fw-burst 1.4s ease-out infinite;
      }
    `}</style>

                        <span className="fw-core" style={{ background: flashSale.accent }} />

                        {[
                          { tx: "-22px", ty: "-22px", delay: "0s", color: flashSale.accent },
                          { tx: "0px", ty: "-28px", delay: "0.1s", color: "#fff" },
                          { tx: "22px", ty: "-22px", delay: "0s", color: flashSale.promotion },
                          { tx: "28px", ty: "0px", delay: "0.15s", color: flashSale.accent },
                          { tx: "22px", ty: "22px", delay: "0.05s", color: "#fff" },
                          { tx: "0px", ty: "28px", delay: "0.1s", color: flashSale.promotion },
                          { tx: "-22px", ty: "22px", delay: "0s", color: flashSale.accent },
                          { tx: "-28px", ty: "0px", delay: "0.15s", color: "#fff" },
                          { tx: "-16px", ty: "-28px", delay: "0.08s", color: flashSale.promotion },
                          { tx: "16px", ty: "-28px", delay: "0.12s", color: flashSale.accent },
                          { tx: "28px", ty: "-16px", delay: "0.06s", color: "#fff" },
                          { tx: "28px", ty: "16px", delay: "0.14s", color: flashSale.promotion },
                        ].map((p, i) => (
                          <span
                            key={i}
                            className="fw-dot"
                            style={
                              {
                                "--tx": p.tx,
                                "--ty": p.ty,
                                "--delay": p.delay,
                                background: p.color,
                                animationDelay: p.delay,
                              } as React.CSSProperties
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-3 text-[13px] font-medium" style={{ color: "rgb(var(--primary) / 0.65)" }}>
                    <Calendar size={14} />
                    Không có chương trình sale nào sắp diễn ra
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="px-2 py-3 bg-surface">
              {loadingDate === activeDate ? (
                <FlashSaleSkeletonGrid />
              ) : products.length > 0 ? (
                <FlashSaleProductGrid products={products} flashPromoRule={flashPromoRule} isUpcoming={isUpcoming} />
              ) : (
                <FlashSaleEmptyState isUpcoming={isUpcoming} dateLabel={activeDay && !activeDay.isToday ? formatDateTab(activeDay.date) : undefined} />
              )}
            </div>

            {products.length > 0 && (
              <div className="px-4 py-2.5 flex justify-end border-t border-surface-border bg-surface">
                <Link
                  href={`/flash-sale?date=${activeDate}`}
                  className="flex items-center gap-1 text-[12px] font-semibold hover:underline transition-opacity hover:opacity-80"
                  style={{ color: flashSale.promotion }}
                >
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
