import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { sttColumn } from "@/components/admin/columns/adminColumns";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { LowStockAlert } from "../inventory.types";

export function getAlertColumns(page: number, pageSize: number): AdminColumn<LowStockAlert>[] {
  return [
    sttColumn<LowStockAlert>(page, pageSize),
    {
      key: "product",
      label: "Sản phẩm",
      render: (a) => (
        <div className="flex items-center gap-2.5">
          <div className="shrink-0 w-9 h-9 rounded-lg overflow-hidden border border-neutral bg-white flex items-center justify-center">
            {a.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.thumbnail} alt={a.productName} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-neutral-light-active" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-primary truncate max-w-[220px]">{a.productName}</p>
            {a.variantCode && <p className="text-[11px] text-neutral-dark font-mono">{a.variantCode}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "warehouse",
      label: "Kho",
      render: (a) => <span className="text-[13px] text-primary">{a.warehouseName}</span>,
    },
    {
      key: "quantity",
      label: "Tồn hiện tại",
      align: "center",
      render: (a) => <span className={`text-[14px] font-bold ${a.isOutOfStock ? "text-promotion" : "text-orange-500"}`}>{a.quantity}</span>,
    },
    {
      key: "threshold",
      label: "Ngưỡng",
      align: "center",
      render: (a) => <span className="text-[13px] text-neutral-dark">{a.lowStockThreshold}</span>,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (a) => (a.isOutOfStock ? <StatusBadge label="Hết hàng" className="text-promotion bg-promotion-light" /> : <StatusBadge label="Sắp hết" className="text-orange-500 bg-orange-50" />),
    },
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (a) => (
        <Link
          href={`/admin/inventory/stock-in?variantId=${a.variantId}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          <PackagePlus size={13} /> Nhập kho
        </Link>
      ),
    },
  ];
}
