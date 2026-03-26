"use client";

import type { DashboardPeriod } from "../dashboard.types";

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "today", label: "Hôm nay" },
  { value: "week", label: "7 ngày" },
  { value: "month", label: "Tháng này" },
  { value: "year", label: "Năm nay" },
];

interface PeriodSelectorProps {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="inline-flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${value === p.value ? "bg-accent text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
