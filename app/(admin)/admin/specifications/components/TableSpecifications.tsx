import { Pencil } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { selectColumn, sttColumn, statusDropdownColumn, RowActionButton } from "@/components/admin/columns/adminColumns";
import { Specification } from "../specification.types";
import { FILTER_TYPE_LABELS, FILTER_TYPE_COLORS } from "../_lib/constants";
import { formatDate } from "@/helpers";

interface GetSpecificationColumnsParams {
  page: number;
  pageSize: number;
  selected: Set<string>;
  openStatusId: string | null;
  toggleOne: (id: string) => void;
  setOpenStatusId: (id: string | null) => void;
  onToggleActive: (spec: Specification) => void;
  onEditClick: (spec: Specification) => void;
}

const STATUS_DROPDOWN = [
  { value: "active", label: "Đang hoạt động", color: "text-emerald-600 bg-emerald-50" },
  { value: "inactive", label: "Tạm dừng", color: "text-orange-500 bg-orange-50" },
];

export function getSpecificationColumns({
  page,
  pageSize,
  selected,
  openStatusId,
  toggleOne,
  setOpenStatusId,
  onToggleActive,
  onEditClick,
}: GetSpecificationColumnsParams): AdminColumn<Specification>[] {
  return [
    selectColumn<Specification>((s) => s.id, selected, toggleOne),
    sttColumn<Specification>(page, pageSize),
    {
      key: "name",
      label: "Tên thông số",
      render: (spec) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            {spec.icon && <span className="text-base leading-none">{spec.icon}</span>}
            <span className="text-[13px] font-medium text-primary">{spec.name}</span>
            {spec.isRequired && <span className="text-[10px] px-1.5 py-0.5 rounded bg-promotion/10 text-promotion font-semibold">Bắt buộc</span>}
          </div>
          <span className="text-[11px] text-neutral-dark font-mono bg-neutral-light-active px-1.5 py-0.5 rounded">{spec.key}</span>
        </div>
      ),
    },
    {
      key: "group",
      label: "Nhóm",
      render: (spec) => <span className="text-[12px] px-2.5 py-1 rounded-lg bg-neutral-light-active text-neutral-dark font-medium">{spec.group}</span>,
    },
    {
      key: "unit",
      label: "Đơn vị",
      align: "center",
      render: (spec) => (spec.unit ? <span className="text-[12px] text-primary font-medium">{spec.unit}</span> : <span className="text-[12px] text-neutral-dark/50">—</span>),
    },
    {
      key: "isFilterable",
      label: "Bộ lọc",
      render: (spec) => {
        if (!spec.isFilterable) {
          return <span className="text-[11px] text-neutral-dark/50">—</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-emerald-600">✓ Có thể lọc</span>
            {spec.filterType && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium w-fit ${FILTER_TYPE_COLORS[spec.filterType] ?? "text-neutral-dark bg-neutral-light-active"}`}>
                {FILTER_TYPE_LABELS[spec.filterType] ?? spec.filterType}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "sortOrder",
      label: "Thứ tự",
      align: "center",
      render: (spec) => <span className="text-[13px] font-semibold text-primary">{spec.sortOrder}</span>,
    },
    statusDropdownColumn<Specification>({
      getId: (s) => s.id,
      getCurrentValue: (s) => (s.isActive ? "active" : "inactive"),
      getCurrentDisplay: (s) => (s.isActive ? { label: "Đang hoạt động", color: "text-emerald-600 bg-emerald-50" } : { label: "Tạm dừng", color: "text-orange-500 bg-orange-50" }),
      options: STATUS_DROPDOWN,
      openId: openStatusId,
      setOpenId: setOpenStatusId,
      onChange: onToggleActive,
    }),
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (spec) => (
        <div className="flex items-center justify-end gap-2">
          <RowActionButton title="Chỉnh sửa" onClick={() => onEditClick(spec)}>
            <Pencil size={14} />
          </RowActionButton>
        </div>
      ),
    },
  ];
}
