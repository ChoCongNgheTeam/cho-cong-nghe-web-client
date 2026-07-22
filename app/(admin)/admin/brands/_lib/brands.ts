import apiRequest from "@/lib/api";
import { Brand, BrandsResponse, GetBrandsParams } from "../brand.types";
import { createResourceApi, type ResourceEnvelope } from "@/lib/admin/createResourceApi";

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

/** Field JSON thuần của brand — dùng khi request không kèm ảnh (không qua FormData) */
type BrandJsonBody = Partial<Omit<CreateBrandPayload, "imageUrl">>;

// ── Brand CRUD (chuẩn — dùng factory cho getAll/getOne/delete) ───────────────

const brandApi = createResourceApi<BrandsResponse, Brand, CreateBrandPayload, UpdateBrandPayload, GetBrandsParams>("/brands/admin");

export const getAllBrands = brandApi.getAll;
export const getBrand = (id: string) => brandApi.getOne(id);
export const deleteBrand = brandApi.remove;

// ── Custom: create/update có nhánh FormData khi upload ảnh ───────────────────

export const createBrand = async (payload: CreateBrandPayload): Promise<ResourceEnvelope<Brand>> => {
  if (payload.imageUrl instanceof File) {
    const formData = new FormData();
    formData.append("name", payload.name);
    if (payload.description !== undefined) formData.append("description", payload.description);
    if (payload.isFeatured !== undefined) formData.append("isFeatured", String(payload.isFeatured));
    if (payload.isActive !== undefined) formData.append("isActive", String(payload.isActive));
    formData.append("imageUrl", payload.imageUrl);
    return apiRequest.post<ResourceEnvelope<Brand>>("/brands/admin", formData);
  }

  const body: BrandJsonBody = { name: payload.name };
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.isFeatured !== undefined) body.isFeatured = payload.isFeatured;
  if (payload.isActive !== undefined) body.isActive = payload.isActive;
  return apiRequest.post<ResourceEnvelope<Brand>>("/brands/admin", body);
};

export const updateBrand = async (id: string, payload: UpdateBrandPayload): Promise<ResourceEnvelope<Brand>> => {
  if (payload.imageUrl instanceof File) {
    const formData = new FormData();
    if (payload.name !== undefined) formData.append("name", payload.name);
    if (payload.description !== undefined) formData.append("description", payload.description);
    if (payload.isFeatured !== undefined) formData.append("isFeatured", String(payload.isFeatured));
    if (payload.isActive !== undefined) formData.append("isActive", String(payload.isActive));
    if (payload.removeImage !== undefined) formData.append("removeImage", String(payload.removeImage));
    formData.append("imageUrl", payload.imageUrl);
    return apiRequest.patch<ResourceEnvelope<Brand>>(`/brands/admin/${id}`, formData);
  }

  const body: BrandJsonBody & { removeImage?: boolean } = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.isFeatured !== undefined) body.isFeatured = payload.isFeatured;
  if (payload.isActive !== undefined) body.isActive = payload.isActive;
  if (payload.removeImage !== undefined) body.removeImage = payload.removeImage;
  return apiRequest.patch<ResourceEnvelope<Brand>>(`/brands/admin/${id}`, body);
};
