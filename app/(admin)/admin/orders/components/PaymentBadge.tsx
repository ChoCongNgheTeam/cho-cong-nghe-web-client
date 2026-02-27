import { PAYMENT_STATUS_CONFIG } from "../const";
import { PaymentStatus } from "../order.types";

export function PaymentBadge({ status }: { status: PaymentStatus }) {
   const cfg = PAYMENT_STATUS_CONFIG[status] ?? {
      label: status,
      dot: "bg-neutral-dark",
      pill: "bg-neutral-light-active text-neutral-darker border border-neutral",
   };
   return (
      <span
         className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-inters font-medium whitespace-nowrap ${cfg.pill}`}
      >
         <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`}
         />
         {cfg.label}
      </span>
   );
}
