"use client";

import type { ConversionFunnel } from "../analytics.types";

const STEPS: { key: keyof ConversionFunnel; label: string; color: string; bg: string }[] = [
  { key: "requested", label: "Chatbot yêu cầu", color: "#93c5fd", bg: "bg-blue-200" },
  { key: "pending", label: "Chờ xác nhận", color: "#4979e4", bg: "bg-accent" },
  { key: "processing", label: "Đang xử lý", color: "#f59e0b", bg: "bg-amber-400" },
  { key: "shipped", label: "Đang giao", color: "#8b5cf6", bg: "bg-violet-500" },
  { key: "delivered", label: "Giao thành công", color: "#10b981", bg: "bg-emerald-500" },
  { key: "cancelled", label: "Đã huỷ", color: "#ef4444", bg: "bg-red-500" },
];

export function ConversionFunnelChart({ data }: { data: ConversionFunnel }) {
  // Total = all orders that entered the funnel (excluding chatbot requests as they're pre-order)
  const totalOrders = data.pending + data.processing + data.shipped + data.delivered + data.cancelled;
  const total = Math.max(totalOrders, 1);
  const maxVal = Math.max(...STEPS.map((s) => data[s.key]), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-600">Phễu chuyển đổi</h3>
        <span className="text-[10px] text-emerald-600 font-semibold">{total > 0 ? ((data.delivered / total) * 100).toFixed(1) : "0"}% giao thành công</span>
      </div>

      <div className="space-y-1.5 flex-1">
        {STEPS.map((step) => {
          const val = data[step.key];
          // For chatbot requests: show % of all entries; for others: % of total orders
          const base = step.key === "requested" ? Math.max(data.requested + totalOrders, 1) : total;
          const pct = ((val / base) * 100).toFixed(1);
          const barW = (val / maxVal) * 100;

          return (
            <div key={step.key} className="flex items-center gap-2">
              <div className="w-20 shrink-0">
                <span className="text-[10px] text-slate-600 truncate block leading-tight">{step.label}</span>
              </div>
              <div className="flex-1 h-4 bg-slate-100 rounded overflow-hidden relative">
                <div className="h-full rounded transition-all" style={{ width: `${barW}%`, backgroundColor: step.color }} />
              </div>
              <div className="w-12 text-right shrink-0">
                <span className="text-[11px] font-semibold text-slate-800">{val}</span>
                <span className="text-[9px] text-slate-400 ml-1">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-50 grid grid-cols-2 gap-x-3 gap-y-0.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-400">Tỉ lệ huỷ</span>
          <span className="text-[10px] font-semibold text-red-500">{total > 0 ? ((data.cancelled / total) * 100).toFixed(1) : "0"}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-400">Tổng đơn</span>
          <span className="text-[10px] font-semibold text-slate-700">{totalOrders}</span>
        </div>
      </div>
    </div>
  );
}
