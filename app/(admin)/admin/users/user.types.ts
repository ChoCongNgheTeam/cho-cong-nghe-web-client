export interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  phone: string;
  gender: string;
  role: UserRole;
  isActive: boolean;
  avatarImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  data: User[];
  message?: string;
}

export type UserRole = "CUSTOMER" | "ADMIN" | "STAFF";