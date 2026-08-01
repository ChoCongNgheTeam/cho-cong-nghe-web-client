import { Eye, Ban } from "lucide-react";
import type { AdminColumn } from "@/components/admin/AdminTables";
import { selectColumn, sttColumn, RowActionButton } from "@/components/admin/columns/adminColumns";
import { ShipmentStatusBadge } from "@/components/admin/shipping/ShipmentStatusBadge";
import { formatDate, formatVND } from "@/helpers";
import type { Shipment } from "../shipment.types";

interface GetShipmentColumnsParams {
  page: number;
  pageSize: number;
  selected: Set<string>;
  toggleOne: (id: string) => void;
  onCancelClick: (shipment: Shipment) => void;
}

export function getShipmentColumns({ page, pageSize, selected, toggleOne, onCancelClick }: GetShipmentColumnsParams): AdminColumn<Shipment>[] {
  return [
    selectColumn<Shipment>((s) => s.id, selected, toggleOne),
    sttColumn<Shipment>(page, pageSize),
    {
      key: "order",
      label: "Đơn hàng",
      render: (s) => (
        <div>
          <span className="text-[13px] font-semibold text-accent block">{s.order.orderCode}</span>
          <span className="text-[11px] text-neutral-dark">{s.order.shippingContactName}</span>
        </div>
      ),
    },
    {
      key: "provider",
      label: "Nhà vận chuyển",
      render: (s) => (
        <div>
          <span className="text-[13px] font-medium text-primary block">{s.provider.name}</span>
          {s.providerOrderCode && <span className="text-[11px] text-neutral-dark font-mono">{s.providerOrderCode}</span>}
        </div>
      ),
    },
    {
      key: "fee",
      label: "Phí ship",
      render: (s) => <span className="text-[13px] text-primary">{s.shippingFee ? formatVND(Number(s.shippingFee)) : "—"}</span>,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (s) => <ShipmentStatusBadge status={s.status} size="sm" />,
    },
    {
      key: "expectedDeliveryAt",
      label: "Dự kiến giao",
      render: (s) => <span className="text-[13px] text-primary">{s.expectedDeliveryAt ? formatDate(s.expectedDeliveryAt) : "—"}</span>,
    },
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (s) => (
        <div className="flex items-center justify-end gap-2">
          <RowActionButton title="Xem đơn hàng" href={`/admin/orders/${s.orderId}`}>
            <Eye size={14} />
          </RowActionButton>
          {s.status !== "DELIVERED" && s.status !== "CANCELLED" && (
            <RowActionButton title="Huỷ vận đơn" variant="danger" onClick={() => onCancelClick(s)}>
              <Ban size={14} />
            </RowActionButton>
          )}
        </div>
      ),
    },
  ];
}
