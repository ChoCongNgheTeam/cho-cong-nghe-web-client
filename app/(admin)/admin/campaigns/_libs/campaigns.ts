import apiRequest from "@/lib/api";
import {
   Campaign,
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

export const updateCampaignCategory = async (
   campaignId: string,
   categoryId: string,
   data: {
      image?: File;
      removeImage?: boolean;
      title?: string;
      position?: number;
   },
): Promise<{ data: unknown; message: string }> => {
   const formData = new FormData();
   if (data.image) formData.append("image", data.image);
   if (data.removeImage !== undefined)
      formData.append("removeImage", String(data.removeImage));
   return apiRequest.patch(
      `/campaigns/admin/${campaignId}/categories/${categoryId}`,
      formData,
   );
};
