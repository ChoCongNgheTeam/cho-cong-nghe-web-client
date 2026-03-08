import apiRequest from "@/lib/api";
import { Brand } from "../brand.types";

interface UpdateBrandResponse {
   data: Brand;
   message: string;
}

export interface UpdateBrandPayload {
   name?: string;
   description?: string;
   isFeatured?: boolean;
   isActive?: boolean;
   removeImage?: boolean;
   imageUrl?: File;
}

export const updateBrand = async (
   id: string,
   payload: UpdateBrandPayload,
): Promise<UpdateBrandResponse> => {
   if (payload.imageUrl instanceof File) {
      const formData = new FormData();
      if (payload.name !== undefined) formData.append("name", payload.name);
      if (payload.description !== undefined)
         formData.append("description", payload.description);
      if (payload.isFeatured !== undefined)
         formData.append("isFeatured", String(payload.isFeatured));
      if (payload.isActive !== undefined)
         formData.append("isActive", String(payload.isActive));
      if (payload.removeImage !== undefined)
         formData.append("removeImage", String(payload.removeImage));
      formData.append("imageUrl", payload.imageUrl);

      // ✅ Không set Content-Type — để axios tự thêm boundary
      return apiRequest.patch<UpdateBrandResponse>(
         `/brands/admin/${id}`,
         formData,
      );
   }

   const body: Record<string, any> = {};
   if (payload.name !== undefined) body.name = payload.name;
   if (payload.description !== undefined)
      body.description = payload.description;
   if (payload.isFeatured !== undefined) body.isFeatured = payload.isFeatured;
   if (payload.isActive !== undefined) body.isActive = payload.isActive;
   if (payload.removeImage !== undefined)
      body.removeImage = payload.removeImage;

   return apiRequest.patch<UpdateBrandResponse>(`/brands/admin/${id}`, body);
};
