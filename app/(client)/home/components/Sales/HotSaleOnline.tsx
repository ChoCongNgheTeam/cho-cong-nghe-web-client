"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ChevronRight, Calendar, Flame } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import apiRequest from "@/lib/api";
import { flashSale } from "./flashSaleTheme";
import { FlashSaleCountdown } from "./FlashSaleCountdown";
import { FlashSaleTabItem, formatDateTab } from "./FlashSaleTabs";
import { FlashSaleProductGrid, FlashSaleSkeletonGrid, FlashSaleEmptyState } from "./FlashSaleProductGrid";
import type { SaleScheduleData, SaleScheduleRule, CachedDayData, TodayProductPromotion, SaleByDateApiResponse } from "../../_lib/types";

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
      const res = await apiRequest.get<{ data: SaleByDateApiResponse }>("/home/sale-by-date", { params: { date, limit: 20 } });
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
    } catch {
      setProductsCache((prev) => ({ ...prev, [date]: { products: [], total: 0, promotions: [] as TodayProductPromotion[], endDate: null } }));
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
    <section className="py-1 md:py-3">
      <div className="container">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            borderTop: "1.5px solid rgba(255,255,255,0.05)",
            borderLeft: `3px solid ${flashSale.promotionDark}`,
            borderRight: "1.5px solid rgba(255,255,255,0.05)",
            borderBottom: `2px solid ${flashSale.promotion}`,
            boxShadow: `0 4px 32px rgba(0,0,0,0.18), 0 0 0 1px rgb(var(--promotion) / 0.07), 0 8px 24px rgb(var(--promotion) / 0.06)`,
          }}
        >
          {/* HEADER */}
          <div className="relative overflow-hidden rounded-t-2xl" style={{ background: flashSale.headerGradient }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: flashSale.headerGlow }} />

            <div className="rounded-2xl relative z-10 flex items-center justify-between px-4 pt-4 pb-3 gap-3 flex-wrap ">
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

            <div
              className="relative z-10"
              style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 20%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.07) 80%, transparent)" }}
            />

            <div className="relative z-10 flex lg:gap-10 md:gap-8 gap-4 items-center justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {hasSaleDays ? (
                <>
                  {/* Left decoration */}
                  <div className="shrink-0 flex items-center gap-1.5 px-2 pointer-events-none select-none">
                    <Image src="/2026_left_icon.png" alt="" width={55} height={55} className="animate-bounce" style={{ animationDuration: "4s", animationDelay: "0s" }} />
                  </div>

                  {/* Tabs */}
                  <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {schedule.map((day) => (
                      <FlashSaleTabItem key={day.date} day={day} isActive={activeDate === day.date} isLoading={loadingDate === day.date} onClick={tabClickHandlers[day.date]} />
                    ))}
                  </div>

                  {/* Right decoration */}
                  {/* Right decoration */}
                  <div className="shrink-0 flex items-center gap-3 px-2 pointer-events-none select-none">
                    <Image src="/2026_right_icon.png" alt="" width={55} height={55} className="animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.6s" }} />
                  </div>

                  {/* Firework — tách riêng, ghim sát phải */}
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
                <div className="flex items-center gap-2 px-4 py-3 text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <Calendar size={14} />
                  Không có chương trình sale nào sắp diễn ra
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              height: 2,
              background: `linear-gradient(90deg, transparent 0%, ${flashSale.promotionDark} 15%, ${flashSale.promotion} 50%, ${flashSale.promotionDark} 85%, transparent 100%)`,
              boxShadow: `0 0 10px rgb(var(--promotion) / 0.45)`,
            }}
          />

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
    </section>
  );
}
