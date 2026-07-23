import { Eye, Pencil, Trash2 } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { selectColumn, sttColumn, statusDropdownColumn, RowActionButton } from "@/components/admin/columns/adminColumns";
import { Promotion } from "../promotion.types";
import { getPromotionStatus } from "./PromotionStatusBadge";
import { ACTION_TYPE_LABELS, ACTION_TYPE_COLORS, TARGET_TYPE_LABELS } from "../_lib/constants";
import { formatDate, formatVND } from "@/helpers";

interface GetPromotionColumnsParams {
  page: number;
  pageSize: number;
  selected: Set<string>;
  openStatusId: string | null;
  toggleOne: (id: string) => void;
  setOpenStatusId: (id: string | null) => void;
  onToggleActive: (promotion: Promotion) => void;
  // onDeleteClick luôn được gọi dù active hay không
  // — Page sẽ quyết định hiện modal cảnh báo hay modal xóa thẳng
  onDeleteClick: (promotion: Promotion) => void;
  href: (path: string) => string;
}

const STATUS_DROPDOWN = [
  { value: "active", label: "Đang hoạt động", color: "text-emerald-600 bg-emerald-50" },
  { value: "inactive", label: "Tạm dừng", color: "text-orange-500 bg-orange-50" },
];

export function getPromotionColumns({ page, pageSize, selected, openStatusId, toggleOne, setOpenStatusId, onToggleActive, onDeleteClick, href }: GetPromotionColumnsParams): AdminColumn<Promotion>[] {
  return [
    selectColumn<Promotion>((p) => p.id, selected, toggleOne),
    sttColumn<Promotion>(page, pageSize),

    // Tên
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

    // Loại ưu đãi
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

    // Áp dụng cho
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

    // Thời hạn
    {
      key: "validity",
      label: "Thời hạn",
      render: (promotion) => (
        <div className="space-y-0.5">
          <div className="text-[11px] text-neutral-dark">{promotion.startDate ? <span>Từ {formatDate(promotion.startDate)}</span> : <span className="italic">Không giới hạn bắt đầu</span>}</div>
          <div className="text-[11px] text-neutral-dark">{promotion.endDate ? <span>Đến {formatDate(promotion.endDate)}</span> : <span className="italic">Không giới hạn kết thúc</span>}</div>
        </div>
      ),
    },

    // Ưu tiên
    {
      key: "priority",
      label: "Ưu tiên",
      align: "center",
      render: (promotion) => <span className="text-[13px] font-semibold text-primary">{promotion.priority}</span>,
    },

    // Trạng thái (dropdown toggle, disable khi đã hết hạn)
    statusDropdownColumn<Promotion>({
      getId: (p) => p.id,
      getCurrentValue: (p) => (p.isActive ? "active" : "inactive"),
      getCurrentDisplay: (p) => {
        const status = getPromotionStatus(p);
        return { label: status.label, color: status.color };
      },
      options: STATUS_DROPDOWN,
      openId: openStatusId,
      setOpenId: setOpenStatusId,
      onChange: onToggleActive,
      isDisabled: (p) => getPromotionStatus(p).value === "expired",
    }),

    // Hành động
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (promotion) => {
        const isActive = promotion.isActive && !promotion.isExpired;
        return (
          <div className="flex items-center justify-end gap-2">
            <RowActionButton href={href(`/promotions/${promotion.id}`)} title="Xem">
              <Eye size={14} />
            </RowActionButton>
            <RowActionButton href={href(`/promotions/${promotion.id}?edit=true`)} title="Chỉnh sửa">
              <Pencil size={14} />
            </RowActionButton>
            {/* Xoá — chỉ hiển thị khi không còn hoạt động */}
            {!isActive && (
              <RowActionButton title="Xoá" variant="danger" onClick={() => onDeleteClick(promotion)}>
                <Trash2 size={14} />
              </RowActionButton>
            )}
          </div>
        );
      },
    },
  ];
}
