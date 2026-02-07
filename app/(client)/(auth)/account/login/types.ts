export interface User {
   id: string;
   email: string;
   userName: string;
   fullName: string;
   role: string;
}

export interface LoginResponse {
   user: User;
   message?: string;
}

export interface LoginHandlerParams {
   userName: string;
   password: string;
   rememberMe: boolean;
   onSuccess: (user: User) => Promise<void>;
   onError: (errorMessage: string) => void;
}
