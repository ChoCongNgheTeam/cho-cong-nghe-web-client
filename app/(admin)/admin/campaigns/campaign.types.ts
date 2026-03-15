export type CampaignType = "FLASH_SALE" | "SEASONAL" | "BRAND" | "CATEGORY" | "SPECIAL";

export interface CampaignCategory {
  id: string;
  campaignId: string;
  categoryId: string;
  position: number;
  title?: string;
  description?: string;
  imagePath?: string;
  imageUrl?: string;
  category: {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    imagePath?: string;
  };
}

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  type: CampaignType;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deletedBy?: string;
  categories: CampaignCategory[];
  _count: { categories: number };
}

export interface GetCampaignsParams {
  search?: string;
  type?: CampaignType;
  isActive?: boolean;
  sortBy?: "name" | "createdAt" | "startDate" | "endDate";
  sortOrder?: "asc" | "desc";
  includeDeleted?: boolean;
}

export interface CreateCampaignPayload {
  name: string;
  type: CampaignType;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export type UpdateCampaignPayload = Partial<CreateCampaignPayload>;
