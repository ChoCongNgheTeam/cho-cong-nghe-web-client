import apiRequest from "@/lib/api";
import { User, UserRole } from "../user.types";

export interface CreateUserPayload {
  userName: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  gender: string;
  role: UserRole;
  isActive: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const createUser = async (data: CreateUserPayload): Promise<User> => {
  const res = await apiRequest.post<ApiResponse<User>>("/users/admin", data);
  return res.data; // res = { data: User, message: string }
};
