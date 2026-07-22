import apiRequest from "@/lib/api";
import { BlogDetail, BlogAuthor, BlogsResponse, GetBlogsParams } from "../blog.types";
import { createResourceApi, type ResourceEnvelope } from "@/lib/admin/createResourceApi";

interface BlogAuthorsResponse {
  data: BlogAuthor[];
  message: string;
}

const blogApi = createResourceApi<BlogsResponse, BlogDetail, FormData, FormData, GetBlogsParams>("/blogs/admin");

export const getAllBlogs = blogApi.getAll;
export const getBlog = (id: string) => blogApi.getOne(id);
export const deleteBlog = blogApi.remove;

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
export const createBlog = async (formData: FormData): Promise<ResourceEnvelope<BlogDetail>> => {
  return apiRequest.post<ResourceEnvelope<BlogDetail>>("/blogs/admin", formData);
};

/**
 * Update blog — dùng FormData.
 * KHÔNG set Content-Type thủ công — để axios tự set kèm boundary.
 */
export const updateBlog = async (id: string, formData: FormData): Promise<ResourceEnvelope<BlogDetail>> => {
  return apiRequest.patch<ResourceEnvelope<BlogDetail>>(`/blogs/admin/${id}`, formData);
};

export const bulkDeleteBlogs = async (blogIds: string[]): Promise<void> => {
  await apiRequest.delete("/blogs/admin/bulk", { data: { blogIds } });
};

export const bulkUpdateBlogStatus = async (blogIds: string[], status: string): Promise<void> => {
  await apiRequest.patch("/blogs/admin/bulk/status", { blogIds, status });
};

export const restoreBlog = async (id: string): Promise<ResourceEnvelope<BlogDetail>> => {
  return apiRequest.post<ResourceEnvelope<BlogDetail>>(`/blogs/admin/${id}/restore`, {});
};

export const hardDeleteBlog = async (id: string): Promise<void> => {
  await apiRequest.delete(`/blogs/admin/${id}/permanent`);
};
