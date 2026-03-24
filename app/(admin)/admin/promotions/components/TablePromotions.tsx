import { Eye, Pencil, Trash2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { AdminColumn } from "@/components/admin/AdminTables";
import { Promotion } from "../promotion.types";
import { PromotionStatusBadge, getPromotionStatus } from "./PromotionStatusBadge";
import { ACTION_TYPE_LABELS, ACTION_TYPE_COLORS, TARGET_TYPE_LABELS, STATUS_TABS } from "../const";
import { formatDate, formatVND } from "@/helpers";

interface GetPromotionColumnsParams {
  page: number;
  pageSize: number;
  selected: Set<string>;
  openStatusId: string | null;
  toggleOne: (id: string) => void;
  setOpenStatusId: (id: string | null) => void;
  onToggleActive: (promotion: Promotion) => void;
  onDeleteClick: (promotion: Promotion) => void;
}

const STATUS_DROPDOWN = [
  { value: "active", label: "Đang hoạt động", color: "text-emerald-600 bg-emerald-50" },
  { value: "inactive", label: "Tạm dừng", color: "text-orange-500 bg-orange-50" },
];

const formatDateVN = (dateStr?: string) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function getPromotionColumns({ page, pageSize, selected, openStatusId, toggleOne, setOpenStatusId, onToggleActive, onDeleteClick }: GetPromotionColumnsParams): AdminColumn<Promotion>[] {
  return [
    {
      key: "_select",
      label: "",
      width: "w-10",
      align: "center",
      render: (promotion) => (
        <input
          type="checkbox"
          checked={selected.has(promotion.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleOne(promotion.id);
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
      key: "name",
      label: "Tên khuyến mãi",
      render: (promotion) => (
        <div className="space-y-0.5">
          <span className="text-[13px] font-medium text-primary block">{promotion.name}</span>
          {promotion.description && <span className="text-[11px] text-neutral-dark line-clamp-1 block max-w-xs">{promotion.description}</span>}
        </div>
      ),
    },
    {
      key: "rules",
      label: "Loại ưu đãi",
      render: (promotion) => (
        <div className="flex flex-wrap gap-1">
          {promotion.rules.length === 0 ? (
            <span className="text-[12px] text-neutral-dark">—</span>
          ) : (
            promotion.rules.slice(0, 2).map((rule) => (
              <span
                key={rule.id}
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${ACTION_TYPE_COLORS[rule.actionType] ?? "text-neutral-dark bg-neutral-light-active"}`}
              >
                {ACTION_TYPE_LABELS[rule.actionType] ?? rule.actionType}
                {rule.discountValue !== undefined && (rule.actionType === "DISCOUNT_PERCENT" ? ` ${rule.discountValue}%` : ` ${formatVND(rule.discountValue)}`)}
              </span>
            ))
          )}
          {promotion.rules.length > 2 && <span className="text-[11px] text-neutral-dark">+{promotion.rules.length - 2}</span>}
        </div>
      ),
    },
    {
      key: "targets",
      label: "Áp dụng cho",
      render: (promotion) => {
        const hasAll = promotion.targets.some((t) => t.targetType === "ALL");
        if (hasAll) {
          return <span className="text-[12px] text-primary">Tất cả sản phẩm</span>;
        }
        const uniqueTypes = [...new Set(promotion.targets.map((t) => t.targetType))];
        return (
          <div className="flex flex-wrap gap-1">
            {uniqueTypes.map((type) => (
              <span key={type} className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-light-active text-neutral-dark">
                {TARGET_TYPE_LABELS[type] ?? type} <span className="font-semibold text-primary">({promotion.targets.filter((t) => t.targetType === type).length})</span>
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "validity",
      label: "Thời hạn",
      render: (promotion) => (
        <div className="space-y-0.5">
          <div className="text-[11px] text-neutral-dark">{promotion.startDate ? <span>Từ {formatDateVN(promotion.startDate)}</span> : <span className="italic">Không giới hạn bắt đầu</span>}</div>
          <div className="text-[11px] text-neutral-dark">{promotion.endDate ? <span>Đến {formatDateVN(promotion.endDate)}</span> : <span className="italic">Không giới hạn kết thúc</span>}</div>
        </div>
      ),
    },
    {
      key: "priority",
      label: "Ưu tiên",
      align: "center",
      render: (promotion) => <span className="text-[13px] font-semibold text-primary">{promotion.priority}</span>,
    },
    {
      key: "isActive",
      label: "Trạng thái",
      render: (promotion) => {
        const status = getPromotionStatus(promotion);
        // Chỉ cho toggle nếu chưa expired
        const canToggle = status.value !== "expired";
        const isOpen = openStatusId === promotion.id;

        return (
          <div className="relative inline-block">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canToggle) setOpenStatusId(isOpen ? null : promotion.id);
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
                      const currentValue = promotion.isActive ? "active" : "inactive";
                      if (opt.value !== currentValue) {
                        onToggleActive(promotion);
                      }
                      setOpenStatusId(null);
                    }}
                    className={`w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-neutral-light-active transition-colors cursor-pointer ${opt.color}`}
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
      render: (promotion) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/promotions/${promotion.id}`}
            title="Xem"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
          >
            <Eye size={14} />
          </Link>
          <Link
            href={`/admin/promotions/${promotion.id}?edit=true`}
            title="Chỉnh sửa"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
          >
            <Pencil size={14} />
          </Link>
          <button
            title="Xoá"
            onClick={() => onDeleteClick(promotion)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-promotion-light hover:text-promotion transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];
}
