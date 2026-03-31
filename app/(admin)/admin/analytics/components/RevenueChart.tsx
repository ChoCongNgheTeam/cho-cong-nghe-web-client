"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TooltipProps } from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { RevenueDataPoint } from "../analytics.types";

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtShort = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}T`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
};

const fmtFull = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

const fmtPeriod = (p?: string) => {
  if (!p) return "--";
  const d = new Date(p);
  if (isNaN(d.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(d);
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function CustomTooltip(props: TooltipProps<ValueType, NameType> & { payload?: any; label?: string }) {
  const { active, payload, label } = props;
  if (!active || !payload?.length) return null;
  const main = payload.find((p: any) => p.dataKey === "revenue");
  const cmp = payload.find((p: any) => p.dataKey === "compareRevenue");
  const d = main?.payload as (RevenueDataPoint & { compareRevenue?: number }) | undefined;
  return (
    <div className="bg-slate-900 text-white rounded-xl px-3 py-2 shadow-xl text-xs min-w-[148px]">
      <p className="text-slate-400 mb-1 text-[10px]">{fmtPeriod(label)}</p>
      {d && (
        <>
          <p className="font-bold">{fmtFull(d.revenue)}</p>
          <p className="text-slate-400 text-[10px]">
            {d.orderCount} đơn · AOV {fmtShort(d.averageOrderValue)}
          </p>
        </>
      )}
      {cmp && d?.compareRevenue !== undefined && <p className="text-slate-500 text-[10px] mt-1 pt-1 border-t border-slate-700">So sánh: {fmtFull(d.compareRevenue)}</p>}
    </div>
  );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function EmptyChart() {
  return (
    <div className="h-[130px] flex flex-col items-center justify-center gap-2 text-slate-400">
      <svg width="52" height="36" viewBox="0 0 52 36" fill="none">
        <path d="M2 30 Q12 20 18 24 Q26 28 32 12 Q38 2 50 6" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="2" cy="30" r="2.5" fill="#e2e8f0" />
        <circle cx="18" cy="24" r="2.5" fill="#e2e8f0" />
        <circle cx="32" cy="12" r="2.5" fill="#e2e8f0" />
        <circle cx="50" cy="6" r="2.5" fill="#e2e8f0" />
        <path d="M2 34 L50 34" stroke="#e2e8f0" strokeWidth="1" />
      </svg>
      <p className="text-[11px]">Không có dữ liệu trong khoảng thời gian này</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface RevenueChartProps {
  data: RevenueDataPoint[];
  comparison?: RevenueDataPoint[];
}

export function RevenueChart({ data, comparison }: RevenueChartProps) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
        <h3 className="text-xs font-semibold text-slate-600 mb-1">Doanh thu theo thời gian</h3>
        <EmptyChart />
      </div>
    );
  }

  // Merge comparison into main data by index (same length alignment)
  const merged = data.map((d, i) => ({
    ...d,
    label: fmtPeriod(d.period),
    compareRevenue: comparison?.[i]?.revenue,
  }));

  const hasComparison = (comparison?.length ?? 0) > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-semibold text-slate-600">Doanh thu theo thời gian</h3>
        {hasComparison && (
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-accent inline-block rounded" />
              Kỳ này
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-slate-300 inline-block rounded border-dashed border border-slate-300" />
              Kỳ trước
            </span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={merged} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gMain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4979e4" stopOpacity={0.16} />
              <stop offset="95%" stopColor="#4979e4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gCmp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

          <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={fmtShort} tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={44} />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#4979e4", strokeWidth: 1, strokeDasharray: "3 2" }} />

          {/* Comparison area (behind) */}
          {hasComparison && <Area type="monotoneX" dataKey="compareRevenue" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#gCmp)" dot={false} activeDot={false} />}

          {/* Main area */}
          <Area type="monotoneX" dataKey="revenue" stroke="#4979e4" strokeWidth={2} fill="url(#gMain)" dot={false} activeDot={{ r: 4, fill: "#4979e4", stroke: "#fff", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
