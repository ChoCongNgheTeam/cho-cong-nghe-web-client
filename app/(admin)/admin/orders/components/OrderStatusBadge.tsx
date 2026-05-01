import { ORDER_STATUS_CONFIG } from "../const";
import { OrderStatus } from "../order.types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md";
}

export function OrderStatusBadge({ status, size = "md" }: OrderStatusBadgeProps) {
  const cfg = ORDER_STATUS_CONFIG[status];
  if (!cfg) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap border ${cfg.pill} ${size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-[12px]"}`}>
      <span className={`rounded-full shrink-0 ${cfg.dot} ${size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5"}`} />
      {cfg.label}
    </span>
  );
}
