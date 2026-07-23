export type CampaignType = "RANKING" | "CAMPAIGN" | "SEASONAL" | "EVENT" | "FLASH_SALE";

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
  // categories có thể undefined khi BE trả list (chỉ có _count), nên default []
  categories: CampaignCategory[];
  _count: { categories: number };
}

export interface GetCampaignsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: CampaignType;
  isActive?: boolean;
  /** Lọc theo trạng thái tổng hợp (giống promotion): active/inactive/expired/upcoming */
  status?: "active" | "inactive" | "upcoming" | "expired";
  sortBy?: "name" | "createdAt" | "startDate" | "endDate" | "publishedAt";
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
