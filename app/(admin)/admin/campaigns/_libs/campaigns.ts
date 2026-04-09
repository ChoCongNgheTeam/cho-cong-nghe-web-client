import apiRequest from "@/lib/api";
import {
   Campaign,
   CampaignCategory,
   GetCampaignsParams,
   CreateCampaignPayload,
   UpdateCampaignPayload,
} from "../campaign.types";

interface CampaignResponse {
   data: Campaign;
   message: string;
}

interface CampaignMeta {
   total: number;
}

interface CampaignsResponse {
   data: Campaign[];
   meta: CampaignMeta;
   message: string;
}

// ── Campaign CRUD ─────────────────────────────────────────────────────────────

export const getAllCampaigns = async (
   params?: GetCampaignsParams,
): Promise<CampaignsResponse> => {
   return apiRequest.get<CampaignsResponse>("/campaigns/admin/all", { params });
};

export const getCampaign = async (id: string): Promise<CampaignResponse> => {
   return apiRequest.get<CampaignResponse>(`/campaigns/admin/${id}`);
};

export const createCampaign = async (
   payload: CreateCampaignPayload,
): Promise<CampaignResponse> => {
   return apiRequest.post<CampaignResponse>("/campaigns/admin", payload);
};

export const updateCampaign = async (
   id: string,
   payload: UpdateCampaignPayload,
): Promise<CampaignResponse> => {
   return apiRequest.patch<CampaignResponse>(`/campaigns/admin/${id}`, payload);
};

export const deleteCampaign = async (id: string): Promise<void> => {
   await apiRequest.delete(`/campaigns/admin/${id}`);
};

export const bulkDeleteCampaigns = async (
   ids: string[],
): Promise<{ data: { count: number }; message: string }> => {
   return apiRequest.delete("/campaigns/admin/bulk", { data: { ids } });
};

// ── Campaign Categories ───────────────────────────────────────────────────────

/** Thêm một hoặc nhiều danh mục vào chiến dịch */
export const addCampaignCategories = async (
   campaignId: string,
   categories: Array<{
      categoryId: string;
      position: number;
      title?: string;
      description?: string;
   }>,
): Promise<{ data: CampaignCategory[]; message: string }> => {
   // BE nhận multipart/form-data với field `categories` là JSON array
   const formData = new FormData();
   formData.append("categories", JSON.stringify(categories));
   return apiRequest.post(
      `/campaigns/admin/${campaignId}/categories`,
      formData,
   );
};

/** Cập nhật thông tin / ảnh của một danh mục trong chiến dịch */
export const updateCampaignCategory = async (
   campaignId: string,
   categoryId: string,
   data: {
      image?: File;
      removeImage?: boolean;
      title?: string;
      description?: string;
      position?: number;
   },
): Promise<{ data: CampaignCategory; message: string }> => {
   const formData = new FormData();
   if (data.image) formData.append("image", data.image);
   if (data.removeImage !== undefined)
      formData.append("removeImage", String(data.removeImage));
   if (data.title !== undefined) formData.append("title", data.title);
   if (data.description !== undefined)
      formData.append("description", data.description);
   if (data.position !== undefined)
      formData.append("position", String(data.position));

   return apiRequest.patch(
      `/campaigns/admin/${campaignId}/categories/${categoryId}`,
      formData,
   );
};

/** Xóa một danh mục khỏi chiến dịch */
export const removeCampaignCategory = async (
   campaignId: string,
   categoryId: string,
): Promise<void> => {
   await apiRequest.delete(
      `/campaigns/admin/${campaignId}/categories/${categoryId}`,
   );
};

/**
 * Reorder toàn bộ danh mục bằng cách PATCH từng cái theo position mới.
 * Gọi sau khi người dùng kéo thả hoặc nhấn lên/xuống và muốn lưu thứ tự.
 */
export const reorderCampaignCategories = async (
   campaignId: string,
   orderedCategoryIds: string[], // mảng categoryId theo thứ tự mới
): Promise<void> => {
   await Promise.all(
      orderedCategoryIds.map((categoryId, index) =>
         updateCampaignCategory(campaignId, categoryId, { position: index }),
      ),
   );
};
