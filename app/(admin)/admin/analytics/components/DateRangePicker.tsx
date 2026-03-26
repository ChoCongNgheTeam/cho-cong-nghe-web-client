"use client";

import type { TimeGranularity } from "../analytics.types";

// ─── Granularity Selector ─────────────────────────────────────────────────────

const GRANULARITIES: { value: TimeGranularity; label: string }[] = [
  { value: "day", label: "Theo ngày" },
  { value: "week", label: "Theo tuần" },
  { value: "month", label: "Theo tháng" },
];

interface GranularitySelectorProps {
  value: TimeGranularity;
  onChange: (g: TimeGranularity) => void;
}

export function GranularitySelector({ value, onChange }: GranularitySelectorProps) {
  return (
    <div className="inline-flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
      {GRANULARITIES.map((g) => (
        <button
          key={g.value}
          onClick={() => onChange(g.value)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${value === g.value ? "bg-accent text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}

// ─── Quick Range Presets ──────────────────────────────────────────────────────

export type QuickRange = "7d" | "30d" | "90d" | "ytd" | "custom";

const PRESETS: { value: QuickRange; label: string }[] = [
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "90d", label: "90 ngày" },
  { value: "ytd", label: "Năm nay" },
  { value: "custom", label: "Tuỳ chọn" },
];

/** Format Date → "YYYY-MM-DD" */
const toDateStr = (d: Date) => d.toISOString().split("T")[0];

/** Resolve preset → { from, to } */
export const resolvePreset = (preset: QuickRange, customFrom?: string, customTo?: string): { from: string; to: string } => {
  const now = new Date();
  const today = toDateStr(now);

  switch (preset) {
    case "7d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { from: toDateStr(from), to: today };
    }
    case "30d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 29);
      return { from: toDateStr(from), to: today };
    }
    case "90d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 89);
      return { from: toDateStr(from), to: today };
    }
    case "ytd": {
      const from = new Date(now.getFullYear(), 0, 1);
      return { from: toDateStr(from), to: today };
    }
    case "custom":
      return { from: customFrom ?? today, to: customTo ?? today };
  }
};

interface DateRangePickerProps {
  preset: QuickRange;
  from: string;
  to: string;
  onPresetChange: (preset: QuickRange) => void;
  onCustomChange: (from: string, to: string) => void;
}

export function DateRangePicker({ preset, from, to, onPresetChange, onCustomChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset buttons */}
      <div className="inline-flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
        {PRESETS.filter((p) => p.value !== "custom").map((p) => (
          <button
            key={p.value}
            onClick={() => onPresetChange(p.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${preset === p.value ? "bg-accent text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date inputs */}
      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
        <input
          type="date"
          value={from}
          max={to}
          onChange={(e) => {
            onPresetChange("custom");
            onCustomChange(e.target.value, to);
          }}
          className="text-xs text-slate-700 bg-transparent outline-none cursor-pointer"
        />
        <span className="text-slate-300 text-xs">→</span>
        <input
          type="date"
          value={to}
          min={from}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => {
            onPresetChange("custom");
            onCustomChange(from, e.target.value);
          }}
          className="text-xs text-slate-700 bg-transparent outline-none cursor-pointer"
        />
      </div>
    </div>
  );
}
