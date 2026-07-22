"use client";
import { Campaign } from "../campaign.types";
import { parseAPIDate } from "@/helpers/timezoneHelpers";
import { getDateRangeStatus } from "@/lib/admin/status";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

export function getCampaignStatus(campaign: Campaign) {
  return getDateRangeStatus({
    isActive: campaign.isActive,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    parseDate: parseAPIDate,
    expiredLabel: "Đã kết thúc",
  });
}

export function CampaignStatusBadge({ campaign }: { campaign: Campaign }) {
  const status = getCampaignStatus(campaign);
  return <StatusBadge label={status.label} className={status.color} />;
}
