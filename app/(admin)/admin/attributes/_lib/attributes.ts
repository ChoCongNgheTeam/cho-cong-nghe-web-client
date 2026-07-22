import apiRequest from "@/lib/api";
import { Attribute, AttributesResponse, GetAttributesParams, CreateAttributePayload, UpdateAttributePayload, CreateOptionPayload, UpdateOptionPayload, AttributeOption } from "../attribute.types";
import { createResourceApi } from "@/lib/admin/createResourceApi";

interface MutateOptionResponse {
  data: AttributeOption & { attributeId: string };
  message: string;
}

// ── Attribute CRUD (chuẩn — dùng factory dùng chung; module này không có delete) ──

const attributeApi = createResourceApi<AttributesResponse, Attribute, CreateAttributePayload, UpdateAttributePayload, GetAttributesParams>("/attributes/admin");

export const getAllAttributes = attributeApi.getAll;
export const getAttribute = (id: string) => attributeApi.getOne(id);
export const createAttribute = attributeApi.create;
export const updateAttribute = attributeApi.update;

// ── Custom: toggle + options (sub-resource, không thuộc CRUD chuẩn) ───────────

export const toggleAttributeActive = async (id: string): Promise<{ data: Attribute; message: string }> => {
  return apiRequest.patch<{ data: Attribute; message: string }>(`/attributes/admin/${id}/toggle`, {});
};

export const createOption = async (attributeId: string, payload: CreateOptionPayload): Promise<MutateOptionResponse> => {
  return apiRequest.post<MutateOptionResponse>(`/attributes/admin/${attributeId}/options`, payload);
};

export const updateOption = async (attributeId: string, optionId: string, payload: UpdateOptionPayload): Promise<MutateOptionResponse> => {
  return apiRequest.patch<MutateOptionResponse>(`/attributes/admin/${attributeId}/options/${optionId}`, payload);
};
