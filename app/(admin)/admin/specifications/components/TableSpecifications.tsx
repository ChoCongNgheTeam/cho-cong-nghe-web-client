import { Pencil, ChevronDown } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { Specification } from "../specification.types";
import { FILTER_TYPE_LABELS, FILTER_TYPE_COLORS } from "../const";
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
    {
      key: "_select",
      label: "",
      width: "w-10",
      align: "center",
      render: (spec) => (
        <input
          type="checkbox"
          checked={selected.has(spec.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleOne(spec.id);
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
    {
      key: "isActive",
      label: "Trạng thái",
      render: (spec) => {
        const isActive = spec.isActive;
        const statusColor = isActive ? "text-emerald-600 bg-emerald-50" : "text-orange-500 bg-orange-50";
        const statusLabel = isActive ? "Đang hoạt động" : "Tạm dừng";
        const isOpen = openStatusId === spec.id;

        return (
          <div className="relative inline-block">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenStatusId(isOpen ? null : spec.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${statusColor}`}
            >
              {statusLabel}
              <ChevronDown size={11} />
            </button>
            {isOpen && (
              <div className="absolute z-20 left-0 top-full mt-1 w-44 bg-neutral-light border border-neutral rounded-xl shadow-lg overflow-hidden">
                {STATUS_DROPDOWN.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentValue = spec.isActive ? "active" : "inactive";
                      if (opt.value !== currentValue) {
                        onToggleActive(spec);
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
      render: (spec) => (
        <div className="flex items-center justify-end gap-2">
          <button
            title="Chỉnh sửa"
            onClick={() => onEditClick(spec)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors cursor-pointer"
          >
            <Pencil size={14} />
          </button>
        </div>
      ),
    },
  ];
}
