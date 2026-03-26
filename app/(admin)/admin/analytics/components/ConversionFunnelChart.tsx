"use client";

import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import type { ConversionFunnel } from "../analytics.types";
import { TooltipProps } from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

const STEPS: { key: keyof ConversionFunnel; label: string; color: string }[] = [
  { key: "requested", label: "Chatbot gửi yêu cầu", color: "#93c5fd" },
  { key: "pending", label: "Chờ xác nhận", color: "#4979e4" },
  { key: "processing", label: "Đang xử lý", color: "#f59e0b" },
  { key: "shipped", label: "Đang giao", color: "#8b5cf6" },
  { key: "delivered", label: "Giao thành công", color: "#10b981" },
  { key: "cancelled", label: "Đã huỷ", color: "#ef4444" },
];

function FunnelTooltip(props: TooltipProps<ValueType, NameType>) {
  const { active, payload } = props as TooltipProps<ValueType, NameType> & {
    payload?: any[];
  };

  if (!active || !payload?.length) return null;

  const d = payload[0]?.payload;

  if (!d) return null;

  return (
    <div className="bg-slate-900 text-white rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold">{d.label}</p>
      <p className="text-slate-300 mt-0.5">{d.value?.toLocaleString("vi-VN")} đơn</p>
      <p className="text-slate-400">{d.pct}% tổng</p>
    </div>
  );
}
interface ConversionFunnelProps {
  data: ConversionFunnel;
}

export function ConversionFunnelChart({ data }: ConversionFunnelProps) {
  const total = Math.max(data.requested + data.pending, 1);

  const chartData = STEPS.map((s) => ({
    label: s.label,
    value: data[s.key],
    color: s.color,
    pct: ((data[s.key] / total) * 100).toFixed(1),
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Phễu chuyển đổi đơn hàng</h3>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart layout="vertical" data={chartData} margin={{ top: 0, right: 56, left: 4, bottom: 0 }} barCategoryGap="22%">
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={116} />
          <Tooltip content={<FunnelTooltip />} cursor={{ fill: "#f8fafc" }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            <LabelList dataKey="value" position="right" formatter={(v: number) => v.toLocaleString("vi-VN")} style={{ fontSize: 10, fill: "#94a3b8" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-1 pt-3 border-t border-slate-50 flex items-center justify-between">
        <span className="text-xs text-slate-500">Tỉ lệ giao thành công</span>
        <span className="text-sm font-bold text-emerald-600">{total > 0 ? ((data.delivered / total) * 100).toFixed(1) : "0"}%</span>
      </div>
    </div>
  );
}
