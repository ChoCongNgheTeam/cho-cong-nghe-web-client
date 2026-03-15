"use client";
import { Campaign } from "../campaign.types";

export function getCampaignStatus(campaign: Campaign): {
  label: string;
  color: string;
  value: string;
} {
  const now = new Date();
  const start = campaign.startDate ? new Date(campaign.startDate) : null;
  const end = campaign.endDate ? new Date(campaign.endDate) : null;

  if (!campaign.isActive) {
    return { value: "inactive", label: "Tạm dừng", color: "text-orange-500 bg-orange-50" };
  }
  if (end && end < now) {
    return { value: "expired", label: "Đã kết thúc", color: "text-neutral-dark bg-neutral-light-active" };
  }
  if (start && start > now) {
    return { value: "upcoming", label: "Sắp diễn ra", color: "text-blue-600 bg-blue-50" };
  }
  return { value: "active", label: "Đang hoạt động", color: "text-emerald-600 bg-emerald-50" };
}

export function CampaignStatusBadge({ campaign }: { campaign: Campaign }) {
  const status = getCampaignStatus(campaign);
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${status.color}`}>{status.label}</span>;
}
