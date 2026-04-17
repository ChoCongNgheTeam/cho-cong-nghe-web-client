import { Pencil, ChevronDown } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { Attribute } from "../attribute.types";
import { formatDate } from "@/helpers";

interface GetAttributeColumnsParams {
  page: number;
  pageSize: number;
  selected: Set<string>;
  openStatusId: string | null;
  toggleOne: (id: string) => void;
  setOpenStatusId: (id: string | null) => void;
  onToggleActive: (attr: Attribute) => void;
  onEditClick: (attr: Attribute) => void;
}

const STATUS_DROPDOWN = [
  { value: "active", label: "Đang hoạt động", color: "text-emerald-600 bg-emerald-50" },
  { value: "inactive", label: "Tạm dừng", color: "text-orange-500 bg-orange-50" },
];

const isHexColor = (v: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

export function getAttributeColumns({ page, pageSize, selected, openStatusId, toggleOne, setOpenStatusId, onToggleActive, onEditClick }: GetAttributeColumnsParams): AdminColumn<Attribute>[] {
  return [
    {
      key: "_select",
      label: "",
      width: "w-10",
      align: "center",
      render: (attr) => (
        <input
          type="checkbox"
          checked={selected.has(attr.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleOne(attr.id);
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
      label: "Tên thuộc tính",
      render: (attr) => (
        <div className="space-y-0.5">
          <span className="text-[13px] font-medium text-primary block">{attr.name}</span>
          <span className="text-[11px] text-neutral-dark font-mono bg-neutral-light-active px-1.5 py-0.5 rounded">{attr.code}</span>
        </div>
      ),
    },
    {
      key: "options",
      label: "Options",
      render: (attr) => {
        const activeOpts = attr.options.filter((o) => o.isActive);
        if (attr.options.length === 0) {
          return <span className="text-[12px] text-neutral-dark/50 italic">Chưa có option</span>;
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {activeOpts.slice(0, 5).map((opt) => (
              <span key={opt.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-accent/10 text-accent">
                {/* hiển thị swatch nếu value là hex */}
                {isHexColor(opt.value) && <span className="w-3 h-3 rounded-full border border-neutral/30 shrink-0" style={{ backgroundColor: opt.value }} />}
                {opt.label}
              </span>
            ))}
            {activeOpts.length > 5 && <span className="text-[11px] text-neutral-dark">+{activeOpts.length - 5}</span>}
            {attr.options.length > activeOpts.length && <span className="text-[10px] text-neutral-dark/50">({attr.options.length - activeOpts.length} tạm dừng)</span>}
          </div>
        );
      },
    },
    {
      key: "_optCount",
      label: "Tổng",
      align: "center",
      render: (attr) => <span className="text-[13px] font-semibold text-primary">{attr.options.length}</span>,
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (attr) => <span className="text-[12px] text-neutral-dark">{formatDate(attr.createdAt)}</span>,
    },
    {
      key: "isActive",
      label: "Trạng thái",
      render: (attr) => {
        const isActive = attr.isActive;
        const statusColor = isActive ? "text-emerald-600 bg-emerald-50" : "text-orange-500 bg-orange-50";
        const statusLabel = isActive ? "Đang hoạt động" : "Tạm dừng";
        const isOpen = openStatusId === attr.id;

        return (
          <div className="relative inline-block">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenStatusId(isOpen ? null : attr.id);
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
                      const currentValue = attr.isActive ? "active" : "inactive";
                      if (opt.value !== currentValue) onToggleActive(attr);
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
      render: (attr) => (
        <div className="flex items-center justify-end gap-2">
          <button
            title="Chỉnh sửa"
            onClick={() => onEditClick(attr)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors cursor-pointer"
          >
            <Pencil size={14} />
          </button>
        </div>
      ),
    },
  ];
}
