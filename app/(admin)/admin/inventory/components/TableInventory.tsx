import { SlidersHorizontal } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { sttColumn, RowActionButton } from "@/components/admin/columns/adminColumns";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { InventoryOverviewRow } from "../inventory.types";

interface GetInventoryColumnsParams {
  page: number;
  pageSize: number;
  onEditThreshold: (row: InventoryOverviewRow) => void;
}

const formatVnd = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export function getInventoryColumns({ page, pageSize, onEditThreshold }: GetInventoryColumnsParams): AdminColumn<InventoryOverviewRow>[] {
  return [
    sttColumn<InventoryOverviewRow>(page, pageSize),
    {
      key: "product",
      label: "Sản phẩm",
      render: (row) => {
        const thumbnail = row.product.img[0]?.imageUrl;
        const attrText = row.variantAttributes.map((a) => a.attributeOption.label).join(" / ");
        return (
          <div className="flex items-center gap-2.5">
            <div className="shrink-0 w-9 h-9 rounded-lg overflow-hidden border border-neutral bg-white flex items-center justify-center">
              {thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnail} alt={row.product.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-neutral-light-active" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-primary truncate max-w-[220px]">{row.product.name}</p>
              <p className="text-[11px] text-neutral-dark truncate max-w-[220px]">
                {row.code && <span className="font-mono">{row.code}</span>}
                {attrText && <span>{row.code ? " · " : ""}{attrText}</span>}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "brandCategory",
      label: "Danh mục / Thương hiệu",
      render: (row) => (
        <div className="text-[12px] text-primary">
          <p>{row.product.category?.name ?? "—"}</p>
          <p className="text-neutral-dark">{row.product.brand?.name ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "price",
      label: "Giá bán",
      render: (row) => <span className="text-[13px] text-primary whitespace-nowrap">{formatVnd(row.price)}</span>,
    },
    {
      key: "stocks",
      label: "Tồn theo kho",
      render: (row) =>
        row.stocks.length === 0 ? (
          <span className="text-[12px] text-neutral-dark italic">Chưa khởi tạo</span>
        ) : (
          <div className="space-y-0.5">
            {row.stocks.map((s) => (
              <div key={s.warehouseId} className="flex items-center gap-1.5 text-[12px]">
                <span className="text-neutral-dark">{s.warehouseName}:</span>
                <span className={`font-semibold ${s.isOutOfStock ? "text-promotion" : s.isLowStock ? "text-orange-500" : "text-primary"}`}>{s.quantity}</span>
              </div>
            ))}
          </div>
        ),
    },
    {
      key: "totalQuantity",
      label: "Tổng tồn",
      align: "center",
      render: (row) => <span className="text-[14px] font-bold text-primary">{row.totalQuantity}</span>,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (row) =>
        row.isOutOfStock ? (
          <StatusBadge label="Hết hàng" className="text-promotion bg-promotion-light" />
        ) : row.isLowStock ? (
          <StatusBadge label="Sắp hết" className="text-orange-500 bg-orange-50" />
        ) : (
          <StatusBadge label="Còn hàng" className="text-emerald-600 bg-emerald-50" />
        ),
    },
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end">
          <RowActionButton title="Chỉnh ngưỡng cảnh báo tồn kho" onClick={() => onEditThreshold(row)}>
            <SlidersHorizontal size={14} />
          </RowActionButton>
        </div>
      ),
    },
  ];
}
