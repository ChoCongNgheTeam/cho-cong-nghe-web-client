import { Eye, Pencil, Trash2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { AdminColumn } from "@/components/admin/AdminTables";
import { VoucherCard } from "../voucher.types";
import { getVoucherStatus } from "./VoucherStatusBadge";
import { DISCOUNT_TYPE_LABELS, DISCOUNT_TYPE_COLORS } from "../const";
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
    {
      key: "_select",
      label: "",
      width: "w-10",
      align: "center",
      render: (voucher) => (
        <input
          type="checkbox"
          checked={selected.has(voucher.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleOne(voucher.id);
          }}
          className="w-3.5 h-3.5 rounded accent-accent cursor-pointer"
        />
      ),
    },
    {
      key: "_stt",
      label: "STT",
      width: "w-14",
      render: (_, idx) => (page - 1) * pageSize + idx + 1,
    },
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
    {
      key: "isActive",
      label: "Trạng thái",
      render: (voucher) => {
        const status = getVoucherStatus(voucher);
        const canToggle = status.value !== "expired" && status.value !== "exhausted";
        const isOpen = openStatusId === voucher.id;

        return (
          <div className="relative inline-block">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canToggle) setOpenStatusId(isOpen ? null : voucher.id);
              }}
              disabled={!canToggle}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${status.color} ${canToggle ? "cursor-pointer" : "cursor-default opacity-80"}`}
            >
              {status.label}
              {canToggle && <ChevronDown size={11} />}
            </button>
            {isOpen && canToggle && (
              <div className="absolute z-20 left-0 top-full mt-1 w-44 bg-neutral-light border border-neutral rounded-xl shadow-lg overflow-hidden">
                {STATUS_DROPDOWN.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      const current = voucher.isActive ? "active" : "inactive";
                      if (opt.value !== current) onToggleActive(voucher);
                      setOpenStatusId(null);
                    }}
                    className={`w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-neutral-light-active cursor-pointer ${opt.color}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (voucher) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            // href={`/admin/vouchers/${voucher.id}`}
            href={href(`/vouchers/${voucher.id}`)}
            title="Xem"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
          >
            <Eye size={14} />
          </Link>
          <Link
            // href={`/admin/vouchers/${voucher.id}?edit=true`}
            href={href(`/vouchers/${voucher.id}?edit=true`)}
            title="Chỉnh sửa"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
          >
            <Pencil size={14} />
          </Link>
          <button
            title="Xoá"
            onClick={() => onDeleteClick(voucher)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-promotion-light hover:text-promotion transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];
}
