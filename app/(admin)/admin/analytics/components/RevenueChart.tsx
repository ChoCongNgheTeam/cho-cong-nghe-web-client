"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TooltipProps } from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

import type { RevenueDataPoint } from "../analytics.types";

const formatVND = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
};

const formatVNDFull = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);

const formatPeriod = (p?: string) => {
  if (!p) return "--";

  const d = new Date(p);

  if (isNaN(d.getTime())) return "--";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(d);
};
// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip(props: TooltipProps<ValueType, NameType>) {
  const { active, payload, label } = props as TooltipProps<ValueType, NameType> & {
    payload?: any;
    label?: string;
  };

  if (!active || !payload?.length) return null;

  const d = payload[0].payload as RevenueDataPoint;

  return (
    <div className="bg-slate-900 text-white rounded-xl px-3 py-2.5 shadow-xl text-xs min-w-[140px]">
      <p className="text-slate-400 mb-1">{formatPeriod(label)}</p>
      <p className="font-bold text-sm">{formatVNDFull(d.revenue)}</p>
      <p className="text-slate-400 mt-0.5">
        {d.orderCount} đơn · AOV {formatVND(d.averageOrderValue)}
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-[220px] flex items-center justify-center text-slate-400 text-sm">Không có dữ liệu</div>;
  }

  const chartData = data.map((d) => ({ ...d, label: formatPeriod(d.period) }));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Doanh thu theo thời gian</h3>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4979e4" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#4979e4" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />

          <YAxis tickFormatter={formatVND} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={48} />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#4979e4", strokeWidth: 1, strokeDasharray: "4 2" }} />

          <Area type="monotone" dataKey="revenue" stroke="#4979e4" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: "#4979e4", stroke: "#fff", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
