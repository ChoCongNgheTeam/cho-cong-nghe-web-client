import apiRequest from "@/lib/api";
import type { ShippingProvidersResponse, UpsertShippingProviderPayload, ShippingProvider } from "../../shipments/shipment.types";

export const getShippingProviders = (): Promise<ShippingProvidersResponse> => apiRequest.get<ShippingProvidersResponse>("/shipping/admin/providers/all");

export const upsertShippingProvider = (payload: UpsertShippingProviderPayload): Promise<{ data: ShippingProvider; message: string }> =>
  apiRequest.put("/shipping/admin/providers", payload);
