import { Eye, Pencil, Trash2 } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { selectColumn, sttColumn, statusDropdownColumn, RowActionButton } from "@/components/admin/columns/adminColumns";
import { Campaign } from "../campaign.types";
import { getCampaignStatus } from "./CampaignStatusBadge";
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_TYPE_COLORS } from "../_lib/constants";
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
    selectColumn<Campaign>((c) => c.id, selected, toggleOne),
    sttColumn<Campaign>(page, pageSize),
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
    statusDropdownColumn<Campaign>({
      getId: (c) => c.id,
      getCurrentValue: (c) => (c.isActive ? "active" : "inactive"),
      getCurrentDisplay: (c) => {
        const status = getCampaignStatus(c);
        return { label: status.label, color: status.color };
      },
      options: STATUS_DROPDOWN,
      openId: openStatusId,
      setOpenId: setOpenStatusId,
      onChange: onToggleActive,
      isDisabled: (c) => getCampaignStatus(c).value === "expired",
    }),
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (campaign) => {
        const status = getCampaignStatus(campaign);
        const canDelete = !campaign.isActive || status.value === "expired";
        return (
          <div className="flex items-center justify-end gap-2">
            <RowActionButton href={`${prefix}/campaigns/${campaign.id}`} title="Xem">
              <Eye size={14} />
            </RowActionButton>
            <RowActionButton href={`${prefix}/campaigns/${campaign.id}?edit=true`} title="Chỉnh sửa">
              <Pencil size={14} />
            </RowActionButton>
            <RowActionButton title={canDelete ? "Xoá" : "Tắt chiến dịch trước khi xóa"} variant="danger" disabled={!canDelete} onClick={() => onDeleteClick(campaign)}>
              <Trash2 size={14} />
            </RowActionButton>
          </div>
        );
      },
    },
  ];
}
