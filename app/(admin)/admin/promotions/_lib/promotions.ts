import { Promotion, PromotionsResponse, GetPromotionsParams, CreatePromotionPayload, UpdatePromotionPayload } from "../promotion.types";
import { createResourceApi } from "@/lib/admin/createResourceApi";

const promotionApi = createResourceApi<PromotionsResponse, Promotion, CreatePromotionPayload, UpdatePromotionPayload, GetPromotionsParams>("/promotions/admin");

export const getAllPromotions = promotionApi.getAll;
export const getPromotion = (id: string) => promotionApi.getOne(id);
export const createPromotion = promotionApi.create;
export const updatePromotion = promotionApi.update;
export const deletePromotion = promotionApi.remove;
