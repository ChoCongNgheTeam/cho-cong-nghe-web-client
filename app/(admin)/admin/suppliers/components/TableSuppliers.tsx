import { Pencil, Trash2 } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { selectColumn, sttColumn, statusDropdownColumn, RowActionButton } from "@/components/admin/columns/adminColumns";
import { STATUS_OPTIONS } from "../_lib/constants";
import { Supplier } from "../supplier.types";

interface GetSupplierColumnsParams {
  page: number;
  pageSize: number;
  selected: Set<string>;
  openStatusId: string | null;
  toggleOne: (id: string) => void;
  setOpenStatusId: (id: string | null) => void;
  onToggleActive: (supplier: Supplier) => void;
  onEditClick: (supplier: Supplier) => void;
  onDeleteClick: (supplier: Supplier) => void;
}

export function getSupplierColumns({ page, pageSize, selected, openStatusId, toggleOne, setOpenStatusId, onToggleActive, onEditClick, onDeleteClick }: GetSupplierColumnsParams): AdminColumn<Supplier>[] {
  return [
    selectColumn<Supplier>((s) => s.id, selected, toggleOne),
    sttColumn<Supplier>(page, pageSize),
    {
      key: "name",
      label: "Tên nhà cung cấp",
      render: (s) => (
        <div>
          <span className="text-[13px] font-medium text-primary block">{s.name}</span>
          <span className="text-[11px] text-neutral-dark font-mono">{s.code}</span>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Liên hệ",
      render: (s) => (
        <div className="text-[13px] text-primary">
          {s.contactName && <p>{s.contactName}</p>}
          {s.phone && <p className="text-[11px] text-neutral-dark">{s.phone}</p>}
          {!s.contactName && !s.phone && "—"}
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (s) => <span className="text-[13px] text-primary">{s.email ?? "—"}</span>,
    },
    statusDropdownColumn<Supplier>({
      getId: (s) => s.id,
      getCurrentValue: (s) => (s.isActive ? "active" : "hidden"),
      getCurrentDisplay: (s) => (s.isActive ? { label: "Hoạt động", color: "text-emerald-600 bg-emerald-50" } : { label: "Tạm dừng", color: "text-orange-500 bg-orange-50" }),
      options: STATUS_OPTIONS,
      openId: openStatusId,
      setOpenId: setOpenStatusId,
      onChange: onToggleActive,
    }),
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (s) => (
        <div className="flex items-center justify-end gap-2">
          <RowActionButton title="Chỉnh sửa" onClick={() => onEditClick(s)}>
            <Pencil size={14} />
          </RowActionButton>
          <RowActionButton title="Xoá" variant="danger" onClick={() => onDeleteClick(s)}>
            <Trash2 size={14} />
          </RowActionButton>
        </div>
      ),
    },
  ];
}
