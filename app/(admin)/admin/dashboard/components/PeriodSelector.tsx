"use client";

import type { DashboardPeriod } from "../dashboard.types";

const PERIODS: { value: DashboardPeriod; label: string }[] = [
   { value: "today", label: "Hôm nay" },
   { value: "week", label: "7 ngày" },
   { value: "month", label: "Tháng" },
   { value: "year", label: "Năm" },
];

export function PeriodSelector({
   value,
   onChange,
}: {
   value: DashboardPeriod;
   onChange: (p: DashboardPeriod) => void;
}) {
   return (
      <div className="inline-flex items-center bg-neutral-light rounded-lg p-0.5 gap-0.5">
         {PERIODS.map((p) => (
            <button
               key={p.value}
               onClick={() => onChange(p.value)}
               className={`
            px-3 py-1 rounded-md text-[11px] font-semibold transition-all
            ${
               value === p.value
                  ? "bg-accent text-white shadow-sm"
                  : "text-neutral-muted hover:text-primary hover:bg-neutral"
            }
          `}
            >
               {p.label}
            </button>
         ))}
      </div>
   );
}
