"use client";

import { memo } from "react";
import { flashSale } from "./flashSaleTheme";
import { formatTime as formatLocaleTime } from "@/helpers";
import type { SaleScheduleDay } from "../../_lib/types";

function formatDateTab(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const FlashSaleTabItem = memo(function FlashSaleTabItem({ day, isActive, isLoading, onClick }: { day: SaleScheduleDay; isActive: boolean; isLoading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 min-w-25 px-1 py-1 text-center transition-all duration-200 cursor-pointer rounded-lg mx-1 my-1.5"
      style={{
        opacity: !day.hasActiveSale && !day.isToday ? 0.4 : 1,
        backdropFilter: isActive ? "blur(12px)" : "blur(6px)",
        WebkitBackdropFilter: isActive ? "blur(12px)" : "blur(6px)",
        background: isActive ? "linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.14) 100%)" : "rgba(255,255,255,0.08)",
        border: isActive ? "1px solid rgba(255,255,255,0.55)" : "1px solid rgba(255,255,255,0.15)",
        boxShadow: isActive ? `0 4px 16px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.3) inset, 0 -1px 0 rgba(0,0,0,0.15) inset, 0 0 0 1px ${flashSale.promotion}55` : "0 1px 4px rgba(0,0,0,0.12)",
        transform: isActive ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      <div className="font-bold text-white text-sm leading-tight flex items-center justify-center gap-1.5">
        {day.isToday ? (
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase"
            style={{
              background: isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
              color: "#fff",
              textShadow: isActive ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
            }}
          >
            Hôm nay
          </span>
        ) : (
          <span style={{ textShadow: isActive ? "0 1px 3px rgba(0,0,0,0.3)" : "none" }}>{formatDateTab(day.date)}</span>
        )}
        {isLoading && <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />}
      </div>

      {day.isToday && day.promotions[0]?.endDate && (
        <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
          Kết thúc: <span style={{ color: "#fff", fontWeight: 600 }}>{formatLocaleTime(day.promotions[0].endDate)}</span>
        </div>
      )}

      {!day.isToday && day.hasActiveSale && (
        <div className="mt-1">
          <span
            className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
            style={{
              background: isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.10)",
              color: "#fff",
            }}
          >
            Sắp mở
          </span>
        </div>
      )}
    </button>
  );
});

export { formatDateTab };
