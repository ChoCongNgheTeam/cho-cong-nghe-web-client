import { ORDER_STATUS_CONFIG } from "../const";
import { OrderStatus } from "../order.types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
   const cfg = ORDER_STATUS_CONFIG[status];
   return (
      <span
         className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap ${cfg.pill}`}
      >
         <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
         {cfg.label}
      </span>
   );
}
