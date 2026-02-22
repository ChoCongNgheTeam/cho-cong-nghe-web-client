export interface User {
   id: string;
   email: string;
   userName: string;
   fullName: string;
   role: string;
}

export interface LoginResponse {
   accessToken: string;
   accessTokenTTL: number;
   refreshToken?: string; // BE có trả nhưng FE không dùng
   user: User;
   message?: string;
}

export interface LoginHandlerParams {
   userName: string;
   password: string;
   rememberMe: boolean;
   onSuccess: (user: User, accessToken: string) => Promise<void>; // thêm accessToken
   onError: (errorMessage: string) => void;
}
