import apiRequest from "@/lib/api";
import { StocktakesResponse, GetStocktakesParams, Stocktake, CreateStocktakePayload, UpdateStocktakeItemsPayload } from "../inventory.types";
import type { ResourceEnvelope } from "@/lib/admin/createResourceApi";

export const getStocktakes = (params?: GetStocktakesParams): Promise<StocktakesResponse> => apiRequest.get<StocktakesResponse>("/admin/inventory/stocktakes", { params });

export const getStocktakeDetail = (id: string): Promise<ResourceEnvelope<Stocktake>> => apiRequest.get<ResourceEnvelope<Stocktake>>(`/admin/inventory/stocktakes/${id}`);

export const createStocktake = (payload: CreateStocktakePayload): Promise<ResourceEnvelope<Stocktake>> => apiRequest.post<ResourceEnvelope<Stocktake>>("/admin/inventory/stocktakes", payload);

export const updateStocktakeItems = (id: string, payload: UpdateStocktakeItemsPayload): Promise<ResourceEnvelope<Stocktake>> =>
  apiRequest.patch<ResourceEnvelope<Stocktake>>(`/admin/inventory/stocktakes/${id}/items`, payload);

export const completeStocktake = (id: string): Promise<ResourceEnvelope<Stocktake>> => apiRequest.post<ResourceEnvelope<Stocktake>>(`/admin/inventory/stocktakes/${id}/complete`, {});

export const cancelStocktake = (id: string): Promise<ResourceEnvelope<Stocktake>> => apiRequest.post<ResourceEnvelope<Stocktake>>(`/admin/inventory/stocktakes/${id}/cancel`, {});
