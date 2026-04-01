"use client";

import type { OrderStatusBreakdown } from "../dashboard.types";

const STATUS_CONFIG: Record<
   string,
   { label: string; color: string; bg: string }
> = {
   PENDING: { label: "Chờ xác nhận", color: "#4979e4", bg: "bg-accent" },
   PROCESSING: { label: "Đang xử lý", color: "#3b82f6", bg: "bg-blue-500" },
   SHIPPED: { label: "Đang giao", color: "#f59e0b", bg: "bg-amber-500" },
   DELIVERED: { label: "Đã giao", color: "#10b981", bg: "bg-emerald-500" },
   CANCELLED: { label: "Đã hủy", color: "#ef4444", bg: "bg-red-500" },
   REQUEST_PENDING: {
      label: "Chatbot pending",
      color: "#93c5fd",
      bg: "bg-blue-300",
   },
};

function EmptyState() {
   return (
      <div className="flex flex-col items-center justify-center py-6 gap-2">
         <svg width="56" height="44" viewBox="0 0 56 44" fill="none">
            <rect
               x="4"
               y="22"
               width="9"
               height="18"
               rx="2"
               fill="currentColor"
               className="text-neutral"
            />
            <rect
               x="18"
               y="14"
               width="9"
               height="26"
               rx="2"
               fill="currentColor"
               className="text-neutral"
            />
            <rect
               x="32"
               y="8"
               width="9"
               height="32"
               rx="2"
               fill="currentColor"
               className="text-neutral"
            />
            <rect
               x="46"
               y="16"
               width="9"
               height="24"
               rx="2"
               fill="currentColor"
               className="text-neutral"
            />
            <path
               d="M2 42 L54 42"
               stroke="currentColor"
               strokeWidth="1"
               strokeLinecap="round"
               className="text-neutral-hover"
            />
         </svg>
         <p className="text-[11px] text-neutral-dark">Không có dữ liệu</p>
      </div>
   );
}

function DonutChart({
   data,
   total,
}: {
   data: (OrderStatusBreakdown & { pct: number })[];
   total: number;
}) {
   const SIZE = 120,
      STROKE = 20,
      GAP = 2;
   const R = (SIZE - STROKE) / 2;
   const cx = SIZE / 2,
      cy = SIZE / 2;

   if (total === 0) return <EmptyState />;

   const polar = (angle: number) => {
      const r = (angle * Math.PI) / 180;
      return { x: cx + R * Math.cos(r), y: cy + R * Math.sin(r) };
   };

   const arcs = data.reduce<
      Array<(typeof data)[number] & { startAngle: number; angle: number }>
   >((acc, d) => {
      const prev = acc[acc.length - 1];
      const startAngle = prev ? prev.startAngle + prev.angle + GAP : -90;
      const angle = Math.max(
         (d.count / total) * (360 - data.length * GAP),
         0.1,
      );
      acc.push({ ...d, startAngle, angle });
      return acc;
   }, []);

   return (
      <div className="relative flex items-center justify-center">
         <svg width={SIZE} height={SIZE}>
            {/* Track ring — dùng CSS variable để đổi màu theo theme */}
            <circle
               cx={cx}
               cy={cy}
               r={R}
               fill="none"
               stroke="var(--color-neutral)"
               strokeWidth={STROKE}
            />
            {arcs.map((arc) => {
               if (arc.angle < 0.5) return null;
               const cfg = STATUS_CONFIG[arc.status] ?? { color: "#94a3b8" };
               const start = polar(arc.startAngle);
               const end = polar(arc.startAngle + arc.angle);
               const largeArc = arc.angle > 180 ? 1 : 0;
               return (
                  <path
                     key={arc.status}
                     d={`M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y}`}
                     fill="none"
                     stroke={cfg.color} // ← giữ nguyên màu business
                     strokeWidth={STROKE}
                     strokeLinecap="round"
                  />
               );
            })}
         </svg>
         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-bold text-primary">{total}</span>
            <span className="text-[10px] text-neutral-dark">đơn</span>
         </div>
      </div>
   );
}

export function OrderStatusChart({ data }: { data: OrderStatusBreakdown[] }) {
   const total = data.reduce((acc, d) => acc + d.count, 0);
   const normalized = data.map((item) => ({
      ...item,
      pct: total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0,
   }));

   return (
      <div className="bg-neutral-light rounded-xl border border-neutral px-4 py-3 shadow-sm h-full flex flex-col">
         <h3 className="font-semibold text-primary mb-2">
            Trạng thái đơn hàng
         </h3>
         <DonutChart data={normalized} total={total} />
         <div className="mt-2 space-y-1.5 flex-1">
            {normalized.length === 0 ? (
               <p className="text-[11px] text-neutral-dark text-center">
                  Chưa có dữ liệu
               </p>
            ) : (
               normalized.map((item) => {
                  const cfg = STATUS_CONFIG[item.status] ?? {
                     label: item.status,
                     bg: "bg-neutral-dark",
                     color: "#94a3b8",
                  };
                  return (
                     <div
                        key={item.status}
                        className="flex items-center gap-1.5"
                     >
                        {/* Dot — giữ màu business qua inline style */}
                        <span
                           className="w-1.5 h-1.5 rounded-full shrink-0"
                           style={{ backgroundColor: cfg.color }}
                        />
                        <span className="text-[11px] text-primary flex-1 truncate">
                           {cfg.label}
                        </span>
                        {/* Progress track */}
                        <div className="w-12 h-1 bg-neutral rounded-full overflow-hidden">
                           <div
                              className="h-full rounded-full"
                              style={{
                                 width: `${item.pct}%`,
                                 backgroundColor: cfg.color,
                              }}
                           />
                        </div>
                        <span className="text-[11px] font-semibold text-primary w-4 text-right">
                           {item.count}
                        </span>
                        <span className="text-[10px] text-neutral-dark w-8 text-right">
                           {item.pct}%
                        </span>
                     </div>
                  );
               })
            )}
         </div>
      </div>
   );
}
