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

export type UserRole = "CUSTOMER" | "ADMIN" | "SALES" | "MARKETING" | "SUPPORT" | "ACCOUNTING";

export const STAFF_ROLES: UserRole[] = ["SALES", "MARKETING", "SUPPORT", "ACCOUNTING"];

export const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: "Khách hàng",
  ADMIN: "Admin",
  SALES: "Bán hàng",
  MARKETING: "Marketing",
  SUPPORT: "CSKH",
  ACCOUNTING: "Kế toán",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  SALES: "bg-blue-100 text-blue-800 border-blue-200",
  MARKETING: "bg-pink-100 text-pink-800 border-pink-200",
  SUPPORT: "bg-amber-100 text-amber-800 border-amber-200",
  ACCOUNTING: "bg-teal-100 text-teal-800 border-teal-200",
  CUSTOMER: "bg-emerald-100 text-emerald-800 border-emerald-200",
};
