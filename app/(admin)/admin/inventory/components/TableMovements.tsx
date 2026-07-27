import Link from "next/link";
import { AdminColumn } from "@/components/admin/AdminTables";
import { sttColumn } from "@/components/admin/columns/adminColumns";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { MOVEMENT_TYPE_LABEL, REASON_LABEL } from "../_lib/constants";
import { StockMovement } from "../inventory.types";

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function getMovementColumns(page: number, pageSize: number): AdminColumn<StockMovement>[] {
  return [
    sttColumn<StockMovement>(page, pageSize),
    {
      key: "code",
      label: "Mã phiếu",
      render: (m) => <span className="text-[12px] font-mono text-primary">{m.code}</span>,
    },
    {
      key: "type",
      label: "Loại",
      render: (m) => {
        const t = MOVEMENT_TYPE_LABEL[m.type];
        return <StatusBadge label={t.label} className={t.color} />;
      },
    },
    {
      key: "product",
      label: "Sản phẩm",
      render: (m) => (
        <div>
          <p className="text-[13px] text-primary">{m.productVariant.product.name}</p>
          {m.productVariant.code && <p className="text-[11px] text-neutral-dark font-mono">{m.productVariant.code}</p>}
        </div>
      ),
    },
    {
      key: "quantity",
      label: "Số lượng",
      align: "center",
      render: (m) => {
        const isIncrease = m.type === "STOCK_IN" || m.type === "RETURN";
        const isDecrease = m.type === "STOCK_OUT" || m.type === "SALE";
        const sign = isIncrease ? "+" : isDecrease ? "-" : "±";
        return <span className={`text-[13px] font-bold ${isIncrease ? "text-emerald-600" : isDecrease ? "text-promotion" : "text-primary"}`}>{sign}{m.quantity}</span>;
      },
    },
    {
      key: "warehouse",
      label: "Kho",
      render: (m) => <span className="text-[13px] text-primary">{m.warehouse.name}</span>,
    },
    {
      key: "reason",
      label: "Lý do",
      render: (m) => <span className="text-[12px] text-neutral-dark">{REASON_LABEL[m.reason]}</span>,
    },
    {
      key: "related",
      label: "Liên quan",
      render: (m) => {
        if (m.order) return <Link href={`/admin/orders/${m.order.id}`} className="text-[12px] text-accent hover:underline">{m.order.orderCode}</Link>;
        if (m.supplier) return <span className="text-[12px] text-primary">{m.supplier.name}</span>;
        if (m.stocktake) return <Link href={`/admin/inventory/stocktake/${m.stocktake.id}`} className="text-[12px] text-accent hover:underline">{m.stocktake.code}</Link>;
        return <span className="text-[12px] text-neutral-dark">—</span>;
      },
    },
    {
      key: "createdAt",
      label: "Thời gian",
      render: (m) => <span className="text-[12px] text-neutral-dark whitespace-nowrap">{formatDateTime(m.createdAt)}</span>,
    },
  ];
}
