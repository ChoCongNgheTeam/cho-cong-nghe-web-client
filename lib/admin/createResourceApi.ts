import apiRequest from "@/lib/api";

/**
 * createResourceApi — factory sinh ra 5 hàm CRUD chuẩn dùng chung cho các
 * module admin theo convention:
 *   GET    {basePath}/all      → danh sách (có filter/pagination)
 *   GET    {basePath}/{id}     → 1 bản ghi
 *   POST   {basePath}          → tạo mới
 *   PATCH  {basePath}/{id}     → cập nhật
 *   DELETE {basePath}/{id}     → xoá
 *
 * Chỉ dùng cho phần CRUD chuẩn. Module có sub-resource (vd attributes/options,
 * campaigns/categories), bulk-delete, hoặc cần gửi FormData (upload ảnh) thì
 * viết hàm riêng bên cạnh factory — không ép vào đây.
 */

export interface ResourceEnvelope<T> {
  data: T;
  message: string;
}

export function createResourceApi<TListResponse, TItem, TCreatePayload, TUpdatePayload = Partial<TCreatePayload>, TParams extends object = Record<string, unknown>>(basePath: string) {
  return {
    getAll: (params?: TParams): Promise<TListResponse> => apiRequest.get<TListResponse>(`${basePath}/all`, { params }),

    getOne: (id: string): Promise<ResourceEnvelope<TItem>> => apiRequest.get<ResourceEnvelope<TItem>>(`${basePath}/${id}`),

    create: (payload: TCreatePayload): Promise<ResourceEnvelope<TItem>> => apiRequest.post<ResourceEnvelope<TItem>>(basePath, payload),

    update: (id: string, payload: TUpdatePayload): Promise<ResourceEnvelope<TItem>> => apiRequest.patch<ResourceEnvelope<TItem>>(`${basePath}/${id}`, payload),

    remove: async (id: string): Promise<void> => {
      await apiRequest.delete(`${basePath}/${id}`);
    },
  };
}
