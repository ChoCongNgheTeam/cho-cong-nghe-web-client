import { Eye, Pencil, Trash2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { AdminColumn } from "@/components/admin/AdminTables";
import { Campaign } from "../campaign.types";
import { getCampaignStatus } from "./CampaignStatusBadge";
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_TYPE_COLORS } from "../const";
import { formatDate } from "@/helpers";

interface GetCampaignColumnsParams {
  page: number;
  pageSize: number;
  selected: Set<string>;
  openStatusId: string | null;
  toggleOne: (id: string) => void;
  setOpenStatusId: (id: string | null) => void;
  onToggleActive: (campaign: Campaign) => void;
  onDeleteClick: (campaign: Campaign) => void;
  prefix: string;
}

const STATUS_DROPDOWN = [
  { value: "active", label: "Đang hoạt động", color: "text-emerald-600 bg-emerald-50" },
  { value: "inactive", label: "Tạm dừng", color: "text-orange-500 bg-orange-50" },
];

export function getCampaignColumns({ page, pageSize, selected, openStatusId, toggleOne, setOpenStatusId, onToggleActive, onDeleteClick, prefix }: GetCampaignColumnsParams): AdminColumn<Campaign>[] {
  return [
    {
      key: "_select",
      label: "",
      width: "w-10",
      align: "center",
      render: (campaign) => (
        <input
          type="checkbox"
          checked={selected.has(campaign.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleOne(campaign.id);
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
      label: "Tên chiến dịch",
      render: (campaign) => (
        <div className="space-y-0.5">
          <span className="text-[13px] font-medium text-primary block">{campaign.name}</span>
          {campaign.description && <span className="text-[11px] text-neutral-dark line-clamp-1 block max-w-xs">{campaign.description}</span>}
          <span className="text-[10px] font-mono text-neutral-dark/50">{campaign.slug}</span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Loại",
      render: (campaign) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold ${CAMPAIGN_TYPE_COLORS[campaign.type] ?? "text-neutral-dark bg-neutral-light-active"}`}>
          {CAMPAIGN_TYPE_LABELS[campaign.type] ?? campaign.type}
        </span>
      ),
    },
    {
      key: "_categories",
      label: "Danh mục",
      align: "center",
      render: (campaign) => <span className="text-[13px] font-semibold text-primary">{campaign._count.categories}</span>,
    },
    {
      key: "validity",
      label: "Thời gian",
      render: (campaign) => (
        <div className="space-y-0.5">
          <div className="text-[11px] text-neutral-dark">
            {campaign.startDate ? <span>Từ {formatDate(campaign.startDate)}</span> : <span className="italic opacity-60">Không giới hạn bắt đầu</span>}
          </div>
          <div className="text-[11px] text-neutral-dark">{campaign.endDate ? <span>Đến {formatDate(campaign.endDate)}</span> : <span className="italic opacity-60">Không giới hạn kết thúc</span>}</div>
        </div>
      ),
    },
    {
      key: "isActive",
      label: "Trạng thái",
      render: (campaign) => {
        const status = getCampaignStatus(campaign);
        const canToggle = status.value !== "expired";
        const isOpen = openStatusId === campaign.id;

        return (
          <div className="relative inline-block">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canToggle) setOpenStatusId(isOpen ? null : campaign.id);
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
                      const current = campaign.isActive ? "active" : "inactive";
                      if (opt.value !== current) onToggleActive(campaign);
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
      render: (campaign) => {
        const status = getCampaignStatus(campaign);
        const canDelete = !campaign.isActive || status.value === "expired";
        return (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`${prefix}/campaigns/${campaign.id}`}
              title="Xem"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
            >
              <Eye size={14} />
            </Link>
            <Link
              href={`${prefix}/campaigns/${campaign.id}?edit=true`}
              title="Chỉnh sửa"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
            >
              <Pencil size={14} />
            </Link>
            <button
              title={canDelete ? "Xoá" : "Tắt chiến dịch trước khi xóa"}
              onClick={() => canDelete && onDeleteClick(campaign)}
              disabled={!canDelete}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                canDelete ? "text-neutral-dark hover:bg-promotion-light hover:text-promotion cursor-pointer" : "text-neutral-dark/25 cursor-not-allowed"
              }`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      },
    },
  ];
}
