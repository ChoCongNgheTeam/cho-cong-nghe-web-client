import { Eye, Pencil, Trash2 } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { selectColumn, sttColumn, statusDropdownColumn, RowActionButton } from "@/components/admin/columns/adminColumns";
import { VoucherCard } from "../voucher.types";
import { getVoucherStatus } from "./VoucherStatusBadge";
import { DISCOUNT_TYPE_LABELS, DISCOUNT_TYPE_COLORS } from "../_lib/constants";
import { formatDate, formatVND } from "@/helpers";

interface GetVoucherColumnsParams {
  page: number;
  pageSize: number;
  selected: Set<string>;
  openStatusId: string | null;
  toggleOne: (id: string) => void;
  setOpenStatusId: (id: string | null) => void;
  onToggleActive: (voucher: VoucherCard) => void;
  onDeleteClick: (voucher: VoucherCard) => void;
  href: (path: string) => string;
}

const STATUS_DROPDOWN = [
  { value: "active", label: "Đang hoạt động", color: "text-emerald-600 bg-emerald-50" },
  { value: "inactive", label: "Tạm dừng", color: "text-orange-500 bg-orange-50" },
];

export function getVoucherColumns({ page, pageSize, selected, openStatusId, toggleOne, setOpenStatusId, onToggleActive, onDeleteClick, href }: GetVoucherColumnsParams): AdminColumn<VoucherCard>[] {
  return [
    selectColumn<VoucherCard>((v) => v.id, selected, toggleOne),
    sttColumn<VoucherCard>(page, pageSize),
    {
      key: "code",
      label: "Mã voucher",
      render: (voucher) => (
        <div className="space-y-0.5">
          <span className="text-[13px] font-bold text-primary font-mono tracking-wider block">{voucher.code}</span>
          {voucher.description && <span className="text-[11px] text-neutral-dark line-clamp-1 block max-w-xs">{voucher.description}</span>}
        </div>
      ),
    },
    {
      key: "discount",
      label: "Giảm giá",
      render: (voucher) => (
        <div className="space-y-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${DISCOUNT_TYPE_COLORS[voucher.discountType]}`}>
            {DISCOUNT_TYPE_LABELS[voucher.discountType]} {voucher.discountType === "DISCOUNT_PERCENT" ? `${voucher.discountValue}%` : formatVND(voucher.discountValue)}
          </span>
          {voucher.minOrderValue > 0 && <p className="text-[10px] text-neutral-dark">Tối thiểu {formatVND(voucher.minOrderValue)}</p>}
          {voucher.maxDiscountValue && <p className="text-[10px] text-neutral-dark">Tối đa {formatVND(voucher.maxDiscountValue)}</p>}
        </div>
      ),
    },
    {
      key: "usage",
      label: "Lượt dùng",
      align: "center",
      render: (voucher) => (
        <div className="text-center">
          <span className="text-[13px] font-semibold text-primary">{voucher.usesCount}</span>
          {voucher.maxUses && <span className="text-[11px] text-neutral-dark">/{voucher.maxUses}</span>}
          {voucher.maxUses && (
            <div className="w-16 h-1 bg-neutral-light-active rounded-full mx-auto mt-1">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min(100, (voucher.usesCount / voucher.maxUses) * 100)}%` }} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "validity",
      label: "Thời hạn",
      render: (voucher) => (
        <div className="space-y-0.5">
          <div className="text-[11px] text-neutral-dark">{voucher.startDate ? <span>Từ {formatDate(voucher.startDate)}</span> : <span className="italic opacity-60">Không giới hạn bắt đầu</span>}</div>
          <div className="text-[11px] text-neutral-dark">{voucher.endDate ? <span>Đến {formatDate(voucher.endDate)}</span> : <span className="italic opacity-60">Không giới hạn kết thúc</span>}</div>
        </div>
      ),
    },
    statusDropdownColumn<VoucherCard>({
      getId: (v) => v.id,
      getCurrentValue: (v) => (v.isActive ? "active" : "inactive"),
      getCurrentDisplay: (v) => {
        const status = getVoucherStatus(v);
        return { label: status.label, color: status.color };
      },
      options: STATUS_DROPDOWN,
      openId: openStatusId,
      setOpenId: setOpenStatusId,
      onChange: onToggleActive,
      isDisabled: (v) => {
        const status = getVoucherStatus(v);
        return status.value === "expired" || status.value === "exhausted";
      },
    }),
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (voucher) => (
        <div className="flex items-center justify-end gap-2">
          <RowActionButton href={href(`/vouchers/${voucher.id}`)} title="Xem">
            <Eye size={14} />
          </RowActionButton>
          <RowActionButton href={href(`/vouchers/${voucher.id}?edit=true`)} title="Chỉnh sửa">
            <Pencil size={14} />
          </RowActionButton>
          <RowActionButton title="Xoá" variant="danger" onClick={() => onDeleteClick(voucher)}>
            <Trash2 size={14} />
          </RowActionButton>
        </div>
      ),
    },
  ];
}
