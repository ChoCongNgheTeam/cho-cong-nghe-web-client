import apiRequest from "@/lib/api";
import { Specification, SpecificationsResponse, GetSpecificationsParams, CreateSpecificationPayload, UpdateSpecificationPayload } from "../specification.types";
import { createResourceApi } from "@/lib/admin/createResourceApi";

const specificationApi = createResourceApi<SpecificationsResponse, Specification, CreateSpecificationPayload, UpdateSpecificationPayload, GetSpecificationsParams>("/specifications/admin");

export const getAllSpecifications = specificationApi.getAll;
export const getSpecification = (id: string) => specificationApi.getOne(id);
export const createSpecification = specificationApi.create;
export const updateSpecification = specificationApi.update;

export const toggleSpecificationActive = async (id: string): Promise<{ data: Specification; message: string }> => {
  return apiRequest.patch<{ data: Specification; message: string }>(`/specifications/admin/${id}/toggle`, {});
};
