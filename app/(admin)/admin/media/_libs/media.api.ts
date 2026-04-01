import apiRequest from "@/lib/api";
import { Media, ApiResponse } from "../media.types";

// GET /media/admin/all
export const getAllMedia = async (): Promise<Media[]> => {
   const res = await apiRequest.get<ApiResponse<Media[]>>("/media/admin/all");
   return res.data ?? [];
};

// GET /media/admin/:id
export const getMediaById = async (id: string): Promise<Media> => {
   const res = await apiRequest.get<ApiResponse<Media>>(`/media/admin/${id}`);
   return res.data;
};

// POST /media/admin — multipart/form-data, field: imageUrl
export const createMedia = async (fd: FormData): Promise<Media> => {
   const res = await apiRequest.post<ApiResponse<Media>>("/media/admin", fd);
   return res.data;
};

// PATCH /media/admin/:id — multipart/form-data, field: imageUrl
export const updateMedia = async (id: string, fd: FormData): Promise<Media> => {
   const res = await apiRequest.patch<ApiResponse<Media>>(
      `/media/admin/${id}`,
      fd,
   );
   return res.data;
};

// DELETE /media/admin/:id
export const deleteMedia = async (id: string): Promise<void> => {
   await apiRequest.delete<ApiResponse<null>>(`/media/admin/${id}`);
};

// POST /media/admin/reorder
export const reorderMedia = async (
   mediaId: string,
   newOrder: number,
): Promise<void> => {
   await apiRequest.post<ApiResponse<null>>("/media/admin/reorder", {
      mediaId,
      newOrder,
   });
};

// PATCH /media/admin/:id — toggle isActive
// Gửi JSON (không phải FormData) để bypass multer middleware,
// đảm bảo req.body được parse đúng bởi express.json()
// multer chỉ expose req.body sau khi parse multipart —
// nếu Content-Type không phải multipart thì req.body từ multer = {}
export const toggleMediaActive = async (
   id: string,
   isActive: boolean,
): Promise<void> => {
   await apiRequest.patch<ApiResponse<Media>>(`/media/admin/${id}`, {
      isActive,
   });
};
