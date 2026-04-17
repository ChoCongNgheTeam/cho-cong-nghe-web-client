"use client";

import type { ConversionFunnel } from "../analytics.types";

const STEPS: { key: keyof ConversionFunnel; label: string; color: string }[] = [
  // { key: "requested", label: "Chatbot yêu cầu", color: "#93c5fd" },
  { key: "pending", label: "Chờ xác nhận", color: "#4979e4" },
  { key: "processing", label: "Đang xử lý", color: "#f59e0b" },
  { key: "shipped", label: "Đang giao", color: "#8b5cf6" },
  { key: "delivered", label: "Giao thành công", color: "#10b981" },
  { key: "cancelled", label: "Đã huỷ", color: "#ef4444" },
];

export function ConversionFunnelChart({ data }: { data: ConversionFunnel }) {
  const totalOrders = data.pending + data.processing + data.shipped + data.delivered + data.cancelled;
  const total = Math.max(totalOrders, 1);
  const maxVal = Math.max(...STEPS.map((s) => data[s.key]), 1);

  return (
    <div className="bg-neutral-light rounded-xl border border-neutral px-4 py-3 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-primary">Phân bố đơn hàng</h3>
        <span className="text-[10px] text-accent font-semibold">{total > 0 ? ((data.delivered / total) * 100).toFixed(1) : "0"}% giao thành công</span>
      </div>

      <div className="space-y-1.5 flex-1">
        {STEPS.map((step) => {
          const val = data[step.key];
          // const base = step.key === "requested" ? Math.max(data.requested + totalOrders, 1) : total;
          const base = Math.max(totalOrders, 1);
          const pct = ((val / base) * 100).toFixed(1);
          const barW = (val / maxVal) * 100;

          return (
            <div key={step.key} className="flex items-center gap-2">
              <div className="w-20 shrink-0">
                <span className="text-[10px] text-primary truncate block leading-tight">{step.label}</span>
              </div>
              {/* Track — semantic; fill — business color */}
              <div className="flex-1 h-4 bg-neutral rounded overflow-hidden relative">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${barW}%`,
                    backgroundColor: step.color,
                  }}
                />
              </div>
              <div className="w-12 text-right shrink-0">
                <span className="text-[11px] font-semibold text-primary">{val}</span>
                <span className="text-[9px] text-neutral-dark ml-1">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 pt-2 border-t border-neutral grid grid-cols-2 gap-x-3 gap-y-0.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-neutral-dark">Tỉ lệ huỷ</span>
          <span className="text-[10px] font-semibold text-promotion">{total > 0 ? ((data.cancelled / total) * 100).toFixed(1) : "0"}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-neutral-dark">Tổng đơn</span>
          <span className="text-[10px] font-semibold text-primary">{totalOrders}</span>
        </div>
      </div>
    </div>
  );
}
