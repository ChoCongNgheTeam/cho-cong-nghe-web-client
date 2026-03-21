import apiRequest from "@/lib/api";
import { Promotion, PromotionsResponse, GetPromotionsParams, CreatePromotionPayload, UpdatePromotionPayload } from "../promotion.types";

interface GetPromotionResponse {
  data: Promotion;
  message: string;
}

interface MutatePromotionResponse {
  data: Promotion;
  message: string;
}

export const getAllPromotions = async (params?: GetPromotionsParams): Promise<PromotionsResponse> => {
  return apiRequest.get<PromotionsResponse>("/promotions/admin/all", { params });
};

export const getPromotion = async (id: string): Promise<GetPromotionResponse> => {
  return apiRequest.get<GetPromotionResponse>(`/promotions/admin/${id}`);
};

export const createPromotion = async (payload: CreatePromotionPayload): Promise<MutatePromotionResponse> => {
  return apiRequest.post<MutatePromotionResponse>("/promotions/admin", payload);
};

export const updatePromotion = async (id: string, payload: UpdatePromotionPayload): Promise<MutatePromotionResponse> => {
  return apiRequest.patch<MutatePromotionResponse>(`/promotions/admin/${id}`, payload);
};

export const deletePromotion = async (id: string): Promise<void> => {
  await apiRequest.delete(`/promotions/admin/${id}`);
};
