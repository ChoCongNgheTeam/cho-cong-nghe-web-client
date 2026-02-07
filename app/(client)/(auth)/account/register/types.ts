export interface FormData {
   userName: string;
   email: string;
   password: string;
   confirmPassword: string;
   fullName: string;
   phone: string;
}

export interface FormErrors {
   userName?: string;
   email?: string;
   password?: string;
   confirmPassword?: string;
   phone?: string;
   terms?: string;
   general?: string;
}

export interface RegisterUser {
   id: string;
   userName: string;
   email: string;
   fullName: string;
   phone?: string;
   role: string;
   createdAt: string;
   avatarImage?: string;
}

export interface RegisterResponse {
   message: string;
   data?: RegisterUser;
}

export interface BackendErrorResponse {
   message: string;
   errors?: Partial<Record<keyof FormData, string>>;
}
