"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import type { RevenueByPaymentMethod, RevenueByCategory } from "../analytics.types";
import { TooltipProps } from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

const formatVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);

const formatVNDShort = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
};

const PALETTE = ["#4979e4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

// ─── Payment Method Chart (Pie) ───────────────────────────────────────────────

function PaymentTooltip(props: TooltipProps<ValueType, NameType>) {
  const { active, payload } = props as TooltipProps<ValueType, NameType> & {
    payload?: any[];
  };

  if (!active || !payload?.length) return null;

  const d = payload[0]?.payload as RevenueByPaymentMethod;

  if (!d) return null;

  return (
    <div className="bg-slate-900 text-white rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold">{d.method}</p>
      <p className="text-slate-300 mt-0.5">{formatVND(d.revenue)}</p>
      <p className="text-slate-400">
        {d.orderCount} đơn · {d.percentage.toFixed(1)}%
      </p>
    </div>
  );
}

interface PaymentMethodChartProps {
  data: RevenueByPaymentMethod[];
}

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Doanh thu theo PTTT</h3>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="shrink-0">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie data={data} dataKey="revenue" nameKey="method" cx="50%" cy="50%" innerRadius={40} outerRadius={64} paddingAngle={2} strokeWidth={0}>
                {data.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<PaymentTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5 min-w-0">
          {data.map((d, i) => (
            <div key={d.methodCode}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                  <span className="text-slate-600 truncate font-medium">{d.method}</span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="font-bold text-slate-900">{d.percentage.toFixed(1)}%</span>
                  <p className="text-slate-400 text-[10px]">{d.orderCount} đơn</p>
                </div>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${d.percentage}%`,
                    background: PALETTE[i % PALETTE.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Category Chart (Horizontal Bar) ─────────────────────────────────────────

function CategoryTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as RevenueByCategory;
  return (
    <div className="bg-slate-900 text-white rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold">{d.categoryName}</p>
      <p className="text-slate-300 mt-0.5">{formatVND(d.revenue)}</p>
      <p className="text-slate-400">
        {d.unitsSold} sản phẩm · {d.percentage.toFixed(1)}%
      </p>
    </div>
  );
}

interface CategoryChartProps {
  data: RevenueByCategory[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] }));
  const chartHeight = Math.max(data.length * 36, 160);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Doanh thu theo danh mục</h3>

      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Không có dữ liệu</div>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart layout="vertical" data={chartData} margin={{ top: 0, right: 64, left: 0, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tickFormatter={formatVNDShort} tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="categoryName" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={110} />
            <Tooltip content={<CategoryTooltip />} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={14}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
              <LabelList dataKey="percentage" position="right" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontSize: 10, fill: "#94a3b8" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
