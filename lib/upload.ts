import apiRequest from "@/lib/api";

export interface UploadResult {
  url: string;
  publicId: string;
  folder: string;
}

/**
 * uploadEditorImage
 *
 * Upload 1 file ảnh lên Cloudinary qua POST /api/v1/upload.
 * apiRequest.baseURL đã là http://localhost:5000/api/v1
 * → chỉ cần path "/upload" là đủ.
 */
export const uploadEditorImage = async (file: File, folder: "products" | "avatars" | "banners" | "blogs" | "documents" = "products"): Promise<UploadResult> => {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("folder", folder);

  // BE trả về: { message, data: { url, publicId, folder } }
  const res: any = await apiRequest.post("/upload", fd);
  const data: UploadResult = res?.data?.data ?? res?.data;

  if (!data?.url) throw new Error("Server không trả về URL ảnh");
  return data;
};
