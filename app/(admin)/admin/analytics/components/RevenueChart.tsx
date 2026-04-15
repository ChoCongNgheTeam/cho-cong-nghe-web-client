"use client";

import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
} from "recharts";
import { TooltipProps } from "recharts";
import {
   NameType,
   ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type { RevenueDataPoint } from "../analytics.types";

// ─── Fill Missing Dates ───────────────────────────────────────────────────────

function toDateKey(period: string): string {
   if (/^\d{4}-\d{2}-\d{2}$/.test(period)) return period;
   const d = new Date(period);
   if (isNaN(d.getTime())) return period;
   return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number): string {
   const d = new Date(dateStr + "T00:00:00Z");
   d.setUTCDate(d.getUTCDate() + n);
   return d.toISOString().slice(0, 10);
}

function fillMissingDates(
   data: RevenueDataPoint[],
   comparison?: RevenueDataPoint[],
): {
   filledData: RevenueDataPoint[];
   filledComparison: RevenueDataPoint[] | undefined;
} {
   if (!data.length) return { filledData: [], filledComparison: undefined };

   const allSources = [...data, ...(comparison ?? [])];
   const allKeys = allSources.map((d) => toDateKey(d.period));
   const minDate = allKeys.reduce((a, b) => (a < b ? a : b));
   const maxDate = allKeys.reduce((a, b) => (a > b ? a : b));

   const days: string[] = [];
   let cur = minDate;
   while (cur <= maxDate) {
      days.push(cur);
      cur = addDays(cur, 1);
   }

   function buildMap(arr: RevenueDataPoint[]): Map<string, RevenueDataPoint> {
      return new Map(arr.map((d) => [toDateKey(d.period), d]));
   }

   function fillArray(
      arr: RevenueDataPoint[],
      map: Map<string, RevenueDataPoint>,
   ): RevenueDataPoint[] {
      return days.map(
         (day) =>
            map.get(day) ?? {
               period: day,
               revenue: 0,
               orderCount: 0,
               averageOrderValue: 0,
            },
      );
   }

   const filledData = fillArray(data, buildMap(data));
   const filledComparison = comparison?.length
      ? fillArray(comparison, buildMap(comparison))
      : undefined;

   return { filledData, filledComparison };
}

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtShort = (v: number) => {
   if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}T`;
   if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
   if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
   return String(v);
};

const fmtFull = (v: number) =>
   new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
   }).format(v);

const fmtPeriod = (p?: string) => {
   if (!p) return "--";

   const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(p);
   if (dateOnly) {
      const [, month, day] = p.split("-").map(Number);
      return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
   }

   const d = new Date(p);
   if (isNaN(d.getTime())) return "--";
   return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC",
   }).format(d);
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function CustomTooltip(
   props: TooltipProps<ValueType, NameType> & {
      payload?: any;
      label?: string;
   },
) {
   const { active, payload, label } = props;
   if (!active || !payload?.length) return null;
   const main = payload.find((p: any) => p.dataKey === "revenue");
   const cmp = payload.find((p: any) => p.dataKey === "compareRevenue");
   const d = main?.payload as
      | (RevenueDataPoint & { compareRevenue?: number })
      | undefined;

   return (
      <div className="bg-primary text-white rounded-xl px-3 py-2 shadow-xl text-xs min-w-[148px]">
         <p className="text-neutral-dark mb-1 text-[10px]">{label}</p>
         {d && (
            <>
               <p className="font-bold">{fmtFull(d.revenue)}</p>
               <p className="text-neutral-dark text-[10px]">
                  {d.orderCount} đơn · AOV {fmtShort(d.averageOrderValue)}
               </p>
            </>
         )}
         {cmp && d?.compareRevenue !== undefined && (
            <p className="text-neutral-dark-hover text-[10px] mt-1 pt-1 border-t border-primary">
               So sánh: {fmtFull(d.compareRevenue)}
            </p>
         )}
      </div>
   );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function EmptyChart() {
   return (
      <div className="h-[130px] flex flex-col items-center justify-center gap-2 text-neutral-dark">
         <svg width="52" height="36" viewBox="0 0 52 36" fill="none">
            <rect
               x="2"
               y="20"
               width="8"
               height="14"
               rx="1.5"
               fill="var(--color-neutral)"
            />
            <rect
               x="14"
               y="12"
               width="8"
               height="22"
               rx="1.5"
               fill="var(--color-neutral)"
            />
            <rect
               x="26"
               y="6"
               width="8"
               height="28"
               rx="1.5"
               fill="var(--color-neutral)"
            />
            <rect
               x="38"
               y="16"
               width="8"
               height="18"
               rx="1.5"
               fill="var(--color-neutral)"
            />
            <path
               d="M2 34 L50 34"
               stroke="var(--color-neutral)"
               strokeWidth="1"
            />
         </svg>
         <p className="text-[11px]">
            Không có dữ liệu trong khoảng thời gian này
         </p>
      </div>
   );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface RevenueChartProps {
   data: RevenueDataPoint[];
   comparison?: RevenueDataPoint[];
}

export function RevenueChart({ data, comparison }: RevenueChartProps) {
   const { filledData, filledComparison } = fillMissingDates(data, comparison);

   if (!filledData.length) {
      return (
         <div className="bg-neutral-light rounded-xl border border-neutral px-4 py-3 shadow-sm">
            <h3 className="text-xs font-semibold text-primary mb-1">
               Doanh thu theo ngày
            </h3>
            <EmptyChart />
         </div>
      );
   }

   const merged = filledData.map((d, i) => ({
      ...d,
      label: fmtPeriod(d.period),
      compareRevenue: filledComparison?.[i]?.revenue,
   }));

   const hasComparison = (filledComparison?.length ?? 0) > 0;

   return (
      <div className="bg-neutral-light rounded-xl border border-neutral px-4 py-3 shadow-sm">
         <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-semibold text-primary">
               Doanh thu theo ngày
            </h3>
            {hasComparison && (
               <div className="flex items-center gap-3 text-[10px] text-neutral-dark">
                  <span className="flex items-center gap-1">
                     <span className="w-3 h-2 bg-accent inline-block rounded-sm" />
                     Kỳ này
                  </span>
                  <span className="flex items-center gap-1">
                     <span className="w-3 h-2 bg-neutral-dark inline-block rounded-sm" />
                     Kỳ trước
                  </span>
               </div>
            )}
         </div>

         <ResponsiveContainer width="100%" height={160}>
            <BarChart
               data={merged}
               margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
               barCategoryGap="30%"
               barGap={2}
            >
               <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-neutral)"
                  vertical={false}
               />
               <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "var(--color-neutral-dark)" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
               />
               <YAxis
                  tickFormatter={fmtShort}
                  tick={{ fontSize: 9, fill: "var(--color-neutral-dark)" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
               />
               <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "var(--color-neutral)", opacity: 0.5 }}
               />

               {hasComparison && (
                  <Bar
                     dataKey="compareRevenue"
                     fill="var(--color-neutral-dark)"
                     opacity={0.4}
                     radius={[3, 3, 0, 0]}
                  />
               )}

               <Bar dataKey="revenue" fill="#4979e4" radius={[3, 3, 0, 0]} />
            </BarChart>
         </ResponsiveContainer>
      </div>
   );
}
