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
      className="shrink-0 min-w-[100px] px-4 py-2.5 text-center transition-all cursor-pointer"
      style={{
        background: isActive ? "rgb(var(--promotion) / 0.15)" : "transparent",
        borderBottom: isActive ? `2.5px solid ${flashSale.promotion}` : "2.5px solid transparent",
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
          Kết thúc: <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{formatLocaleTime(day.promotions[0].endDate)}</span>
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
});

export { formatDateTab };
