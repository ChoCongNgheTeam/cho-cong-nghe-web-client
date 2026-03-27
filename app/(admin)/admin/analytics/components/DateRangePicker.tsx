"use client";

import type { TimeGranularity } from "../analytics.types";

// ─── Granularity ──────────────────────────────────────────────────────────────

const GRANULARITIES: { value: TimeGranularity; label: string }[] = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
];

export function GranularitySelector({ value, onChange }: { value: TimeGranularity; onChange: (g: TimeGranularity) => void }) {
  return (
    <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
      {GRANULARITIES.map((g) => (
        <button
          key={g.value}
          onClick={() => onChange(g.value)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${value === g.value ? "bg-accent text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}

// ─── Quick Range ──────────────────────────────────────────────────────────────

export type QuickRange = "7d" | "30d" | "90d" | "ytd" | "custom";

const PRESETS: { value: QuickRange; label: string }[] = [
  { value: "7d", label: "7N" },
  { value: "30d", label: "30N" },
  { value: "90d", label: "90N" },
  { value: "ytd", label: "Năm" },
];

const toStr = (d: Date) => d.toISOString().split("T")[0];

export const resolvePreset = (preset: QuickRange, customFrom?: string, customTo?: string): { from: string; to: string } => {
  const now = new Date();
  const today = toStr(now);
  switch (preset) {
    case "7d": {
      const f = new Date(now);
      f.setDate(f.getDate() - 6);
      return { from: toStr(f), to: today };
    }
    case "30d": {
      const f = new Date(now);
      f.setDate(f.getDate() - 29);
      return { from: toStr(f), to: today };
    }
    case "90d": {
      const f = new Date(now);
      f.setDate(f.getDate() - 89);
      return { from: toStr(f), to: today };
    }
    case "ytd":
      return { from: toStr(new Date(now.getFullYear(), 0, 1)), to: today };
    case "custom":
      return { from: customFrom ?? today, to: customTo ?? today };
  }
};

interface DateRangePickerProps {
  preset: QuickRange;
  from: string;
  to: string;
  onPresetChange: (p: QuickRange) => void;
  onCustomChange: (from: string, to: string) => void;
}

export function DateRangePicker({ preset, from, to, onPresetChange, onCustomChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-1.5">
      {/* Preset buttons */}
      <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPresetChange(p.value)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${preset === p.value ? "bg-accent text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
        <input
          type="date"
          value={from}
          max={to}
          onChange={(e) => {
            onPresetChange("custom");
            onCustomChange(e.target.value, to);
          }}
          className="text-[11px] text-slate-700 bg-transparent outline-none cursor-pointer w-[90px]"
        />
        <span className="text-slate-300 text-[11px]">→</span>
        <input
          type="date"
          value={to}
          min={from}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => {
            onPresetChange("custom");
            onCustomChange(from, e.target.value);
          }}
          className="text-[11px] text-slate-700 bg-transparent outline-none cursor-pointer w-[90px]"
        />
      </div>
    </div>
  );
}
