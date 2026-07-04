"use client";

import { memo } from "react";
import { flashSale } from "./flashSaleTheme";
import { formatTime as formatLocaleTime } from "@/helpers";
import type { SaleScheduleDay } from "@/(client)/home/_lib/types";

function formatDateTab(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const FlashSaleTabItem = memo(({ day, isActive, isLoading, onClick }: { day: SaleScheduleDay; isActive: boolean; isLoading: boolean; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="shrink-0 min-w-25 px-1 py-1 text-center transition-all duration-200 cursor-pointer rounded-lg mx-1 my-1.5"
      style={{
        opacity: !day.hasActiveSale && !day.isToday ? 0.4 : 1,
        backdropFilter: isActive ? "blur(12px)" : "blur(6px)",
        WebkitBackdropFilter: isActive ? "blur(12px)" : "blur(6px)",
        border: isActive ? `1px solid rgb(var(--promotion) / 0.5)` : "1px solid rgb(var(--surface-border))",
        boxShadow: isActive ? `0 4px 16px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.4) inset, 0 0 0 1px ${flashSale.promotion}33` : "0 1px 4px rgba(0,0,0,0.06)",
        transform: isActive ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      <div className="font-bold text-sm leading-tight flex items-center justify-center gap-1.5" style={{ color: "rgb(var(--primary))" }}>
        {day.isToday ? (
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase"
            style={{
              background: isActive ? `rgb(var(--promotion) / 0.15)` : "rgb(var(--neutral) / 0.6)",
              color: isActive ? flashSale.promotion : "rgb(var(--primary))",
            }}
          >
            Hôm nay
          </span>
        ) : (
          <span style={{ color: "rgb(var(--primary))" }}>{formatDateTab(day.date)}</span>
        )}
        {isLoading && <span className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: "rgb(var(--primary) / 0.4)", borderTopColor: "transparent" }} />}
      </div>

      {day.isToday && day.promotions[0]?.endDate && (
        <div className="text-[10px] mt-0.5" style={{ color: "rgb(var(--neutral-dark))" }}>
          Kết thúc: <span style={{ color: "rgb(var(--primary))", fontWeight: 600 }}>{formatLocaleTime(day.promotions[0].endDate)}</span>
        </div>
      )}

      {!day.isToday && day.hasActiveSale && (
        <div className="mt-1">
          <span
            className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
            style={{
              background: isActive ? `rgb(var(--promotion) / 0.15)` : "rgb(var(--neutral) / 0.6)",
              color: flashSale.promotion,
            }}
          >
            Sắp mở
          </span>
        </div>
      )}
    </button>
  );
});

FlashSaleTabItem.displayName = "FlashSaleTabItem";

export { formatDateTab };
