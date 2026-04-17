// DateRangePicker.tsx — bỏ GranularitySelector độc lập, thay bằng auto-suggest

"use client";

import type { TimeGranularity } from "../analytics.types";

// ─── Auto-detect granularity theo range ───────────────────────────────────────
// Mirror đúng logic BE (analytics.validation.ts) để FE và BE luôn nhất quán
export function autoGranularity(from: string, to: string): TimeGranularity {
  const diffDays = (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 1) return "day";
  if (diffDays <= 90) return "day";
  if (diffDays <= 180) return "week";
  return "month";
}

// Chỉ show granularity options hợp lệ với range hiện tại
export function getValidGranularities(from: string, to: string): TimeGranularity[] {
  const diffDays = (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 7) return ["day"];
  if (diffDays <= 90) return ["day", "week"];
  if (diffDays <= 180) return ["week", "month"];
  return ["week", "month"];
}

// ─── Granularity ──────────────────────────────────────────────────────────────

const GRANULARITY_LABELS: Record<TimeGranularity, string> = {
  day: "Ngày",
  week: "Tuần",
  month: "Tháng",
};

interface GranularitySelectorProps {
  value: TimeGranularity;
  onChange: (g: TimeGranularity) => void;
  from: string; // cần biết range để filter options hợp lệ
  to: string;
}

export function GranularitySelector({ value, onChange, from, to }: GranularitySelectorProps) {
  const validOptions = getValidGranularities(from, to);

  return (
    <div className="inline-flex items-center bg-neutral rounded-lg p-0.5 gap-0.5">
      {validOptions.map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${value === g ? "bg-accent text-white shadow-sm" : "text-neutral-dark hover:text-primary"}`}
        >
          {GRANULARITY_LABELS[g]}
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
      <div className="inline-flex items-center bg-neutral rounded-lg p-0.5 gap-0.5">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPresetChange(p.value)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${preset === p.value ? "bg-accent text-white shadow-sm" : "text-neutral-dark hover:text-primary"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 bg-neutral-light border border-neutral rounded-lg px-2.5 py-1">
        <input
          type="date"
          value={from}
          max={to}
          onChange={(e) => {
            onPresetChange("custom");
            onCustomChange(e.target.value, to);
          }}
          className="text-[11px] text-primary bg-transparent outline-none cursor-pointer w-[90px]"
        />
        <span className="text-neutral-dark text-[11px]">→</span>
        <input
          type="date"
          value={to}
          min={from}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => {
            onPresetChange("custom");
            onCustomChange(from, e.target.value);
          }}
          className="text-[11px] text-primary bg-transparent outline-none cursor-pointer w-[90px]"
        />
      </div>
    </div>
  );
}
