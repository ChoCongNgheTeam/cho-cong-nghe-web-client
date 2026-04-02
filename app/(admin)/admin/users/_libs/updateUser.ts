import apiRequest from "@/lib/api";
import { ApiResponse } from "./createUser";
import { User } from "../user.types";

export const updateUserApi = async (
  id: string,
  data:
    | FormData
    | {
        userName?: string;
        email?: string;
        fullName?: string;
        phone?: string;
        gender?: string;
        role?: "CUSTOMER" | "ADMIN" | "STAFF";
        isActive?: boolean;
        password?: string;
      },
): Promise<User> => {
  // Nếu là FormData (có upload ảnh) thì gửi nguyên FormData
  if (data instanceof FormData) {
    const res = await apiRequest.patch<ApiResponse<User>>(`/users/admin/${id}`, data);
    return res.data;
  }

  // Nếu là object bình thường (không có ảnh)
  const res = await apiRequest.patch<ApiResponse<User>>(`/users/admin/${id}`, data);
  return res.data;
};
