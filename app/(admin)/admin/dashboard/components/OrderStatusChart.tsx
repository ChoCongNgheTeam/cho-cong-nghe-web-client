"use client";

import type { OrderStatusBreakdown } from "../dashboard.types";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Chờ xác nhận", color: "#4979e4", bg: "bg-accent" },
  PROCESSING: { label: "Đang xử lý", color: "#3b82f6", bg: "bg-blue-500" },
  SHIPPED: { label: "Đang giao", color: "#f59e0b", bg: "bg-amber-500" },
  DELIVERED: { label: "Đã giao", color: "#10b981", bg: "bg-emerald-500" },
  CANCELLED: { label: "Đã hủy", color: "#ef4444", bg: "bg-red-500" },
  REQUEST_PENDING: { label: "Chatbot pending", color: "#93c5fd", bg: "bg-blue-300" },
};

// ─── Donut SVG ────────────────────────────────────────────────────────────────

interface DonutProps {
  data: OrderStatusBreakdown[];
}

function DonutChart({ data }: DonutProps) {
  const SIZE = 160;
  const STROKE = 28;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  const total = data.reduce((acc, d) => acc + d.count, 0);
  if (total === 0) {
    return (
      <div className="w-40 h-40 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
        <span className="text-xs text-slate-400">Không có dữ liệu</span>
      </div>
    );
  }

  const arcs = data.reduce<Array<(typeof data)[number] & { startAngle: number; angle: number }>>((acc, d) => {
    const prev = acc[acc.length - 1];
    const startAngle = prev ? prev.startAngle + prev.angle : -90;
    const angle = (d.count / total) * 360;
    acc.push({ ...d, startAngle, angle });
    return acc;
  }, []);

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) };
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width={SIZE} height={SIZE} className="drop-shadow-sm">
        {arcs.map((arc) => {
          const cfg = STATUS_CONFIG[arc.status] ?? { color: "#94a3b8" };
          const start = polarToCartesian(arc.startAngle);
          const end = polarToCartesian(arc.startAngle + arc.angle);
          const largeArc = arc.angle > 180 ? 1 : 0;
          const d = `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y}`;
          return <path key={arc.status} d={d} fill="none" stroke={cfg.color} strokeWidth={STROKE} strokeLinecap="butt" />;
        })}
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-slate-900">{total}</span>
        <span className="text-xs text-slate-400">đơn hàng</span>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface OrderStatusChartProps {
  data: OrderStatusBreakdown[];
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full">
      <h3 className="text-sm font-semibold text-slate-700 mb-5">Trạng thái đơn hàng</h3>

      <DonutChart data={data} />

      <div className="mt-5 space-y-2.5">
        {data.map((item) => {
          const cfg = STATUS_CONFIG[item.status] ?? { label: item.status, bg: "bg-slate-400", color: "#94a3b8" };
          return (
            <div key={item.status} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.bg} shrink-0`} />
                <span className="text-slate-600">{cfg.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{item.count}</span>
                <span className="text-slate-400 text-xs w-10 text-right">{item.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
