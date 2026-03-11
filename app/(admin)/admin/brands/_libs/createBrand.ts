import apiRequest from "@/lib/api";
import { Brand } from "../brand.types";

interface CreateBrandResponse {
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

export const createBrand = async (
   payload: CreateBrandPayload,
): Promise<CreateBrandResponse> => {
   if (payload.imageUrl instanceof File) {
      const formData = new FormData();
      formData.append("name", payload.name);
      if (payload.description !== undefined)
         formData.append("description", payload.description);
      if (payload.isFeatured !== undefined)
         formData.append("isFeatured", String(payload.isFeatured));
      if (payload.isActive !== undefined)
         formData.append("isActive", String(payload.isActive));
      formData.append("imageUrl", payload.imageUrl);

      return apiRequest.post<CreateBrandResponse>(`/brands/admin`, formData);
   }

   const body: Record<string, any> = { name: payload.name };
   if (payload.description !== undefined)
      body.description = payload.description;
   if (payload.isFeatured !== undefined) body.isFeatured = payload.isFeatured;
   if (payload.isActive !== undefined) body.isActive = payload.isActive;

   return apiRequest.post<CreateBrandResponse>(`/brands/admin`, body);
};
