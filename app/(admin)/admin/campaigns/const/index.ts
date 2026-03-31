import { CampaignType } from "../campaign.types";

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  RANKING: "Xếp hạng",
  CAMPAIGN: "Chiến dịch",
  SEASONAL: "Theo mùa",
  EVENT: "Sự kiện",
  FLASH_SALE: "Flash Sale",
};

export const CAMPAIGN_TYPE_COLORS: Record<CampaignType, string> = {
  RANKING: "text-indigo-600 bg-indigo-50",
  CAMPAIGN: "text-blue-600 bg-blue-50",
  SEASONAL: "text-emerald-600 bg-emerald-50",
  EVENT: "text-purple-600 bg-purple-50",
  FLASH_SALE: "text-red-600 bg-red-50",
};

export const STATUS_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
  { value: "upcoming", label: "Sắp diễn ra" },
  { value: "expired", label: "Đã kết thúc" },
];

export const TYPE_OPTIONS: { value: CampaignType | ""; label: string }[] = [
  { value: "", label: "Tất cả loại" },
  { value: "RANKING", label: "Xếp hạng" },
  { value: "CAMPAIGN", label: "Chiến dịch" },
  { value: "SEASONAL", label: "Theo mùa" },
  { value: "EVENT", label: "Sự kiện" },
  { value: "FLASH_SALE", label: "Flash Sale" },
];

type SortField = "createdAt" | "name" | "startDate" | "endDate";

export const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "createdAt", label: "Ngày tạo" },
  { value: "name", label: "Tên" },
  { value: "startDate", label: "Ngày bắt đầu" },
  { value: "endDate", label: "Ngày kết thúc" },
];
