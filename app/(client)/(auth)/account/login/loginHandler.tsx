// app/account/loginHandler.ts
import { ApiError } from "@/lib/api";
import apiRequest from "@/lib/api";
import { LoginHandlerParams, LoginResponse } from "./types";

export const handleLoginSubmit = async ({
   userName,
   password,
   rememberMe,
   onSuccess,
   onError,
}: LoginHandlerParams): Promise<void> => {
   try {
      const response = await apiRequest.post<LoginResponse>(
         "/auth/login",
         {
            userName: userName.trim(),
            password,
            rememberMe,
         },
         { noAuth: true },
      );

      if (response?.user) {
         await onSuccess(response.user);
      } else {
         onError("Phản hồi từ server không hợp lệ");
      }
   } catch (err) {
      console.error("[LoginHandler] Error:", err);

      if (err instanceof ApiError) {
         switch (err.status) {
            case 401:
               onError("Tên đăng nhập hoặc mật khẩu không chính xác");
               break;
            case 429:
               onError(
                  "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau",
               );
               break;
            case 404:
               onError("Tài khoản không tồn tại");
               break;
            case 403:
               onError("Tài khoản của bạn đã bị khóa");
               break;
            default:
               onError(err.message || "Đăng nhập thất bại");
         }
      } else if (err instanceof Error) {
         onError(err.message || "Không thể kết nối đến server");
      } else {
         onError("Đã xảy ra lỗi không xác định");
      }
   }
};
