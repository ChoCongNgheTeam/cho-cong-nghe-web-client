import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { SHIPMENT_STATUS_CONFIG } from "@/app/(admin)/admin/shipments/_lib/constants";
import type { ShipmentStatus } from "@/app/(admin)/admin/shipments/shipment.types";

export function ShipmentStatusBadge({ status, size = "md" }: { status: ShipmentStatus; size?: "sm" | "md" }) {
  const cfg = SHIPMENT_STATUS_CONFIG[status];
  return <StatusBadge label={cfg.label} className={cfg.pill} size={size} />;
}
