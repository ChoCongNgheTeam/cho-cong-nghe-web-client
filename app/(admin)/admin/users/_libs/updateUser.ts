import apiRequest from "@/lib/api";
import { ApiResponse } from "./createUser";
import { User } from "../user.types";

export const updateUserApi = async (
  id: string,
  data: {
    userName?: string;
    email?: string;
    fullName?: string;
    phone?: string;
    gender?: string;
    role?: "CUSTOMER" | "ADMIN" | "STAFF";
    isActive?: boolean;
  }
): Promise<User> => {
  const res = await apiRequest.patch<ApiResponse<User>>(`/users/admin/${id}`, data);
  return res.data; // res = { data: User, message: string }
};