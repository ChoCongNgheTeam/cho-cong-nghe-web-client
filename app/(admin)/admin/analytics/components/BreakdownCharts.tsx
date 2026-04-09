"use client";

import {
   PieChart,
   Pie,
   Cell,
   Tooltip,
   ResponsiveContainer,
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   LabelList,
} from "recharts";
import { TooltipProps } from "recharts";
import {
   NameType,
   ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type {
   RevenueByPaymentMethod,
   RevenueByCategory,
} from "../analytics.types";
import { formatVND } from "@/helpers";

const fmtShort = (v: number) => {
   if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}T`;
   if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
   if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
   return String(v);
};

const PALETTE = [
   "#4979e4",
   "#10b981",
   "#f59e0b",
   "#ef4444",
   "#8b5cf6",
   "#06b6d4",
   "#f97316",
];

// ─── Payment Tooltip ──────────────────────────────────────────────────────────

function PaymentTooltip({
   active,
   payload,
}: TooltipProps<ValueType, NameType> & { payload?: any[] }) {
   if (!active || !payload?.length) return null;
   const d = payload[0]?.payload as RevenueByPaymentMethod;
   return (
      <div className="bg-primary text-white rounded-lg px-2.5 py-1.5 shadow-xl text-xs">
         <p className="font-semibold">{d.method}</p>
         <p className="text-primary text-[10px]">
            {formatVND(d.revenue)}
         </p>
         <p className="text-neutral-dark text-[10px]">
            {d.orderCount} đơn · {d.percentage.toFixed(1)}%
         </p>
      </div>
   );
}

export function PaymentMethodChart({
   data,
}: {
   data: RevenueByPaymentMethod[];
}) {
   return (
      <div className="bg-neutral-light rounded-xl border border-neutral px-4 py-3 shadow-sm">
         <h3 className="font-semibold text-primary mb-2">
            Doanh thu theo PTTT
         </h3>

         {data.length === 0 ? (
            <p className="text-[11px] text-neutral-dark text-center py-6">
               Không có dữ liệu
            </p>
         ) : (
            <div className="flex items-center gap-3">
               {/* Donut — màu business giữ nguyên qua PALETTE */}
               <div className="shrink-0">
                  <ResponsiveContainer width={100} height={100}>
                     <PieChart>
                        <Pie
                           data={data}
                           dataKey="revenue"
                           nameKey="method"
                           cx="50%"
                           cy="50%"
                           innerRadius={28}
                           outerRadius={46}
                           paddingAngle={2}
                           strokeWidth={0}
                        >
                           {data.map((_, i) => (
                              <Cell
                                 key={i}
                                 fill={PALETTE[i % PALETTE.length]}
                              />
                           ))}
                        </Pie>
                        <Tooltip content={<PaymentTooltip />} />
                     </PieChart>
                  </ResponsiveContainer>
               </div>

               {/* Legend */}
               <div className="flex-1 space-y-1.5 min-w-0">
                  {data.map((d, i) => (
                     <div key={d.methodCode}>
                        <div className="flex items-center justify-between mb-0.5">
                           <div className="flex items-center gap-1 min-w-0">
                              <span
                                 className="w-2 h-2 rounded-full shrink-0"
                                 style={{
                                    background: PALETTE[i % PALETTE.length],
                                 }}
                              />
                              <span className="text-[10px] text-primary truncate">
                                 {d.method}
                              </span>
                           </div>
                           <span className="text-[10px] font-bold text-primary ml-1 shrink-0">
                              {d.percentage.toFixed(1)}%
                           </span>
                        </div>
                        {/* Progress track — bg semantic, fill business color */}
                        <div className="h-1 bg-neutral rounded-full overflow-hidden">
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
         )}
      </div>
   );
}

// ─── Category Tooltip ─────────────────────────────────────────────────────────

function CategoryTooltip({
   active,
   payload,
}: TooltipProps<ValueType, NameType> & { payload?: any[] }) {
   if (!active || !payload?.length) return null;
   const d = payload[0]?.payload as RevenueByCategory;
   return (
      <div className="bg-primary text-white rounded-lg px-2.5 py-1.5 shadow-xl text-xs">
         <p className="font-semibold text-[11px]">{d.categoryName}</p>
         <p className="text-primary text-[10px]">
            {formatVND(d.revenue)}
         </p>
         <p className="text-neutral-dark text-[10px]">
            {d.unitsSold} SP · {d.percentage.toFixed(1)}%
         </p>
      </div>
   );
}

export function CategoryChart({ data }: { data: RevenueByCategory[] }) {
   const chartData = data.map((d, i) => ({
      ...d,
      fill: PALETTE[i % PALETTE.length],
   }));
   const chartH = Math.max(data.length * 22, 100);

   return (
      <div className="bg-neutral-light rounded-xl border border-neutral px-4 py-3 shadow-sm">
         <h3 className="text-xs font-semibold text-primary mb-2">
            Doanh thu theo danh mục
         </h3>

         {data.length === 0 ? (
            <p className="text-[11px] text-neutral-dark text-center py-6">
               Không có dữ liệu
            </p>
         ) : (
            <ResponsiveContainer width="100%" height={chartH}>
               <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
                  barCategoryGap="30%"
               >
                  {/* Grid — dùng CSS variable, tự đổi theo theme */}
                  <CartesianGrid
                     strokeDasharray="3 3"
                     stroke="var(--color-neutral)"
                     horizontal={false}
                  />
                  <XAxis
                     type="number"
                     tickFormatter={fmtShort}
                     tick={{ fontSize: 8, fill: "var(--color-neutral-dark)" }}
                     axisLine={false}
                     tickLine={false}
                  />
                  <YAxis
                     type="category"
                     dataKey="categoryName"
                     tick={{ fontSize: 9, fill: "var(--color-primary)" }}
                     axisLine={false}
                     tickLine={false}
                     width={96}
                  />
                  <Tooltip
                     content={<CategoryTooltip />}
                     cursor={{ fill: "var(--color-neutral)" }}
                  />
                  <Bar dataKey="revenue" radius={[0, 3, 3, 0]} maxBarSize={12}>
                     {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                     ))}
                     <LabelList
                        dataKey="percentage"
                        position="right"
                        formatter={(v: unknown) =>
                           typeof v === "number" ? `${v.toFixed(1)}%` : ""
                        }
                        style={{
                           fontSize: 9,
                           fill: "var(--color-neutral-dark)",
                        }}
                     />
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         )}
      </div>
   );
}
