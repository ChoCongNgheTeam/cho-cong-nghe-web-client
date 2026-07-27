import { Pencil, Trash2, Star } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { selectColumn, sttColumn, statusDropdownColumn, RowActionButton } from "@/components/admin/columns/adminColumns";
import { STATUS_OPTIONS } from "../_lib/constants";
import { Warehouse } from "../warehouse.types";

interface GetWarehouseColumnsParams {
  page: number;
  pageSize: number;
  selected: Set<string>;
  openStatusId: string | null;
  toggleOne: (id: string) => void;
  setOpenStatusId: (id: string | null) => void;
  onToggleActive: (warehouse: Warehouse) => void;
  onEditClick: (warehouse: Warehouse) => void;
  onDeleteClick: (warehouse: Warehouse) => void;
  onSetDefaultClick: (warehouse: Warehouse) => void;
}

export function getWarehouseColumns({
  page,
  pageSize,
  selected,
  openStatusId,
  toggleOne,
  setOpenStatusId,
  onToggleActive,
  onEditClick,
  onDeleteClick,
  onSetDefaultClick,
}: GetWarehouseColumnsParams): AdminColumn<Warehouse>[] {
  return [
    selectColumn<Warehouse>((w) => w.id, selected, toggleOne),
    sttColumn<Warehouse>(page, pageSize),
    {
      key: "name",
      label: "Tên kho",
      render: (w) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-primary">{w.name}</span>
            {w.isDefault && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                <Star size={9} fill="currentColor" /> Mặc định
              </span>
            )}
          </div>
          <span className="text-[11px] text-neutral-dark font-mono">{w.code}</span>
        </div>
      ),
    },
    {
      key: "address",
      label: "Địa chỉ",
      render: (w) => <span className="line-clamp-1 text-[13px] text-primary max-w-xs block">{w.address ?? "—"}</span>,
    },
    {
      key: "contact",
      label: "Liên hệ",
      render: (w) => (
        <div className="text-[13px] text-primary">
          {w.managerName && <p>{w.managerName}</p>}
          {w.phone && <p className="text-[11px] text-neutral-dark">{w.phone}</p>}
          {!w.managerName && !w.phone && "—"}
        </div>
      ),
    },
    statusDropdownColumn<Warehouse>({
      getId: (w) => w.id,
      getCurrentValue: (w) => (w.isActive ? "active" : "hidden"),
      getCurrentDisplay: (w) => (w.isActive ? { label: "Hoạt động", color: "text-emerald-600 bg-emerald-50" } : { label: "Tạm dừng", color: "text-orange-500 bg-orange-50" }),
      options: STATUS_OPTIONS,
      openId: openStatusId,
      setOpenId: setOpenStatusId,
      onChange: onToggleActive,
    }),
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (w) => (
        <div className="flex items-center justify-end gap-2">
          {!w.isDefault && w.isActive && (
            <RowActionButton title="Đặt làm kho mặc định" variant="success" onClick={() => onSetDefaultClick(w)}>
              <Star size={14} />
            </RowActionButton>
          )}
          <RowActionButton title="Chỉnh sửa" onClick={() => onEditClick(w)}>
            <Pencil size={14} />
          </RowActionButton>
          <RowActionButton title="Xoá" variant="danger" onClick={() => onDeleteClick(w)}>
            <Trash2 size={14} />
          </RowActionButton>
        </div>
      ),
    },
  ];
}
