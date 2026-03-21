import apiRequest from "@/lib/api";
import { Brand, BrandsResponse, GetBrandsParams } from "../brand.types";

interface CreateBrandResponse {
  data: Brand;
  message: string;
}

interface GetBrandResponse {
  data: Brand;
  message: string;
}

interface UpdateBrandResponse {
  data: Brand;
  message: string;
}

export interface CreateBrandPayload {
  name: string;
  description?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  imageUrl?: File;
}

export interface UpdateBrandPayload {
  name?: string;
  description?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  removeImage?: boolean;
  imageUrl?: File;
}

export const getAllBrands = async (params?: GetBrandsParams): Promise<BrandsResponse> => {
  return apiRequest.get<BrandsResponse>("/brands/admin/all", { params });
};

export const getBrand = async (id: string): Promise<GetBrandResponse> => {
  return apiRequest.get<GetBrandResponse>(`/brands/admin/${id}`);
};

export const createBrand = async (payload: CreateBrandPayload): Promise<CreateBrandResponse> => {
  if (payload.imageUrl instanceof File) {
    const formData = new FormData();
    formData.append("name", payload.name);
    if (payload.description !== undefined) formData.append("description", payload.description);
    if (payload.isFeatured !== undefined) formData.append("isFeatured", String(payload.isFeatured));
    if (payload.isActive !== undefined) formData.append("isActive", String(payload.isActive));
    formData.append("imageUrl", payload.imageUrl);
    return apiRequest.post<CreateBrandResponse>("/brands/admin", formData);
  }

  const body: Record<string, any> = { name: payload.name };
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.isFeatured !== undefined) body.isFeatured = payload.isFeatured;
  if (payload.isActive !== undefined) body.isActive = payload.isActive;
  return apiRequest.post<CreateBrandResponse>("/brands/admin", body);
};

export const updateBrand = async (id: string, payload: UpdateBrandPayload): Promise<UpdateBrandResponse> => {
  if (payload.imageUrl instanceof File) {
    const formData = new FormData();
    if (payload.name !== undefined) formData.append("name", payload.name);
    if (payload.description !== undefined) formData.append("description", payload.description);
    if (payload.isFeatured !== undefined) formData.append("isFeatured", String(payload.isFeatured));
    if (payload.isActive !== undefined) formData.append("isActive", String(payload.isActive));
    if (payload.removeImage !== undefined) formData.append("removeImage", String(payload.removeImage));
    formData.append("imageUrl", payload.imageUrl);
    return apiRequest.patch<UpdateBrandResponse>(`/brands/admin/${id}`, formData);
  }

  const body: Record<string, any> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.isFeatured !== undefined) body.isFeatured = payload.isFeatured;
  if (payload.isActive !== undefined) body.isActive = payload.isActive;
  if (payload.removeImage !== undefined) body.removeImage = payload.removeImage;
  return apiRequest.patch<UpdateBrandResponse>(`/brands/admin/${id}`, body);
};

export const deleteBrand = async (id: string): Promise<void> => {
  await apiRequest.delete(`/brands/admin/${id}`);
};
