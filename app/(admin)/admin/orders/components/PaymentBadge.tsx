import { PAYMENT_STATUS_CONFIG } from "../const";
import { PaymentStatus } from "../order.types";

interface PaymentBadgeProps {
  status: PaymentStatus;
  size?: "sm" | "md";
}

export function PaymentBadge({ status, size = "md" }: PaymentBadgeProps) {
  const cfg = PAYMENT_STATUS_CONFIG[status] ?? {
    label: status,
    dot: "bg-neutral-dark",
    pill: "bg-neutral-light-active text-neutral-darker border border-neutral",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap border ${cfg.pill} ${size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-[12px]"}`}>
      <span className={`rounded-full shrink-0 ${cfg.dot} ${size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5"}`} />
      {cfg.label}
    </span>
  );
}
