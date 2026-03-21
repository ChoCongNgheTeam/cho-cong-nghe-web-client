import apiRequest from "@/lib/api";
import { Attribute, AttributesResponse, GetAttributesParams, CreateAttributePayload, UpdateAttributePayload, CreateOptionPayload, UpdateOptionPayload, AttributeOption } from "../attribute.types";

interface GetAttributeResponse {
  data: Attribute;
  message: string;
}

interface MutateAttributeResponse {
  data: Attribute;
  message: string;
}

interface MutateOptionResponse {
  data: AttributeOption & { attributeId: string };
  message: string;
}

export const getAllAttributes = async (params?: GetAttributesParams): Promise<AttributesResponse> => {
  return apiRequest.get<AttributesResponse>("/attributes/admin/all", { params });
};

export const getAttribute = async (id: string): Promise<GetAttributeResponse> => {
  return apiRequest.get<GetAttributeResponse>(`/attributes/admin/${id}`);
};

export const createAttribute = async (payload: CreateAttributePayload): Promise<MutateAttributeResponse> => {
  return apiRequest.post<MutateAttributeResponse>("/attributes/admin", payload);
};

export const updateAttribute = async (id: string, payload: UpdateAttributePayload): Promise<MutateAttributeResponse> => {
  return apiRequest.patch<MutateAttributeResponse>(`/attributes/admin/${id}`, payload);
};

export const toggleAttributeActive = async (id: string): Promise<MutateAttributeResponse> => {
  return apiRequest.patch<MutateAttributeResponse>(`/attributes/admin/${id}/toggle`, {});
};

export const createOption = async (attributeId: string, payload: CreateOptionPayload): Promise<MutateOptionResponse> => {
  return apiRequest.post<MutateOptionResponse>(`/attributes/admin/${attributeId}/options`, payload);
};

export const updateOption = async (attributeId: string, optionId: string, payload: UpdateOptionPayload): Promise<MutateOptionResponse> => {
  return apiRequest.patch<MutateOptionResponse>(`/attributes/admin/${attributeId}/options/${optionId}`, payload);
};
