import apiRequest from "@/lib/api";
import { Specification, SpecificationsResponse, GetSpecificationsParams, CreateSpecificationPayload, UpdateSpecificationPayload } from "../specification.types";

interface GetSpecificationResponse {
  data: Specification;
  message: string;
}

interface MutateSpecificationResponse {
  data: Specification;
  message: string;
}

export const getAllSpecifications = async (params?: GetSpecificationsParams): Promise<SpecificationsResponse> => {
  return apiRequest.get<SpecificationsResponse>("/specifications/admin/all", { params });
};

export const getSpecification = async (id: string): Promise<GetSpecificationResponse> => {
  return apiRequest.get<GetSpecificationResponse>(`/specifications/admin/${id}`);
};

export const createSpecification = async (payload: CreateSpecificationPayload): Promise<MutateSpecificationResponse> => {
  return apiRequest.post<MutateSpecificationResponse>("/specifications/admin", payload);
};

export const updateSpecification = async (id: string, payload: UpdateSpecificationPayload): Promise<MutateSpecificationResponse> => {
  return apiRequest.patch<MutateSpecificationResponse>(`/specifications/admin/${id}`, payload);
};

export const toggleSpecificationActive = async (id: string): Promise<MutateSpecificationResponse> => {
  return apiRequest.patch<MutateSpecificationResponse>(`/specifications/admin/${id}/toggle`, {});
};
