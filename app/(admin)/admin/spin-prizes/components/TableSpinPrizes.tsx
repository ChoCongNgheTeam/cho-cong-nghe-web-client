import { Pencil, Trash2 } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { RowActionButton } from "@/components/admin/columns/adminColumns";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { SpinPrize } from "../spin-prize.types";

interface GetSpinPrizeColumnsParams {
  onEditClick: (prize: SpinPrize) => void;
  onDeleteClick: (prize: SpinPrize) => void;
}

const formatVnd = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export function getSpinPrizeColumns({ onEditClick, onDeleteClick }: GetSpinPrizeColumnsParams): AdminColumn<SpinPrize>[] {
  return [
    {
      key: "color",
      label: "",
      render: (p) => <span className="inline-block w-5 h-5 rounded-full border border-neutral shrink-0" style={{ backgroundColor: p.colorHex ?? "#999" }} />,
    },
    {
      key: "label",
      label: "Tên phần thưởng",
      render: (p) => <span className="text-[13px] font-medium text-primary">{p.label}</span>,
    },
    {
      key: "voucher",
      label: "Voucher liên kết",
      render: (p) =>
        p.voucher ? (
          <div>
            <p className="text-[13px] font-mono text-primary">{p.voucher.code}</p>
            <p className="text-[11px] text-neutral-dark">{p.voucher.discountType === "DISCOUNT_PERCENT" ? `${p.voucher.discountValue}%` : formatVnd(p.voucher.discountValue)}</p>
          </div>
        ) : (
          <span className="text-[12px] text-neutral-dark italic">Không có (an ủi)</span>
        ),
    },
    {
      key: "weight",
      label: "Trọng số",
      align: "center",
      render: (p) => <span className="text-[13px] text-primary">{p.weight}</span>,
    },
    {
      key: "budget",
      label: "Ngân sách",
      align: "center",
      render: (p) =>
        p.totalBudget === null ? (
          <span className="text-[12px] font-medium text-emerald-600">Không giới hạn</span>
        ) : (
          <span className="text-[13px] text-primary">
            {p.awardedCount}/{p.totalBudget}
          </span>
        ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (p) => (p.isActive ? <StatusBadge label="Hoạt động" className="text-emerald-600 bg-emerald-50" /> : <StatusBadge label="Tạm dừng" className="text-orange-500 bg-orange-50" />),
    },
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <RowActionButton title="Chỉnh sửa" onClick={() => onEditClick(p)}>
            <Pencil size={14} />
          </RowActionButton>
          <RowActionButton title="Xoá" variant="danger" onClick={() => onDeleteClick(p)}>
            <Trash2 size={14} />
          </RowActionButton>
        </div>
      ),
    },
  ];
}
