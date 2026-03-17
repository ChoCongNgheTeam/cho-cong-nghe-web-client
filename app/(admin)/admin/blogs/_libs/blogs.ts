import apiRequest from "@/lib/api";
import { BlogCard, BlogDetail, BlogAuthor, BlogsResponse, GetBlogsParams, CreateBlogPayload, UpdateBlogPayload } from "../blog.types";

interface BlogDetailResponse {
  data: BlogDetail;
  message: string;
}

interface BlogAuthorsResponse {
  data: BlogAuthor[];
  message: string;
}

export const getAllBlogs = async (params?: GetBlogsParams): Promise<BlogsResponse> => {
  return apiRequest.get<BlogsResponse>("/blogs/admin/all", { params });
};

export const getBlog = async (id: string): Promise<BlogDetailResponse> => {
  return apiRequest.get<BlogDetailResponse>(`/blogs/admin/${id}`);
};

export const getBlogAuthors = async (): Promise<BlogAuthorsResponse> => {
  return apiRequest.get<BlogAuthorsResponse>("/blogs/admin/authors");
};

export const getDeletedBlogs = async (params?: { page?: number; limit?: number; search?: string }): Promise<BlogsResponse> => {
  return apiRequest.get<BlogsResponse>("/blogs/admin/trash", { params });
};

/**
 * Tạo blog — dùng FormData vì có upload thumbnail.
 * KHÔNG set Content-Type thủ công — để axios tự set kèm boundary.
 */
export const createBlog = async (formData: FormData): Promise<BlogDetailResponse> => {
  return apiRequest.post<BlogDetailResponse>("/blogs/admin", formData);
};

/**
 * Update blog — dùng FormData.
 * KHÔNG set Content-Type thủ công — để axios tự set kèm boundary.
 */
export const updateBlog = async (id: string, formData: FormData): Promise<BlogDetailResponse> => {
  return apiRequest.patch<BlogDetailResponse>(`/blogs/admin/${id}`, formData);
};

export const deleteBlog = async (id: string): Promise<void> => {
  await apiRequest.delete(`/blogs/admin/${id}`);
};

export const bulkDeleteBlogs = async (blogIds: string[]): Promise<void> => {
  await apiRequest.delete("/blogs/admin/bulk", { data: { blogIds } });
};

export const bulkUpdateBlogStatus = async (blogIds: string[], status: string): Promise<void> => {
  await apiRequest.patch("/blogs/admin/bulk/status", { blogIds, status });
};

export const restoreBlog = async (id: string): Promise<BlogDetailResponse> => {
  return apiRequest.post<BlogDetailResponse>(`/blogs/admin/${id}/restore`, {});
};

export const hardDeleteBlog = async (id: string): Promise<void> => {
  await apiRequest.delete(`/blogs/admin/${id}/permanent`);
};
