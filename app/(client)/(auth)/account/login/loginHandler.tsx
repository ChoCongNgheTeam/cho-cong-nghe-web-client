import apiRequest, { setAccessToken } from "@/lib/api";
import { LoginHandlerParams, LoginResponse } from "./types";

export const handleLoginSubmit = async ({
   userName,
   password,
   rememberMe,
   onSuccess,
   onError,
}: LoginHandlerParams): Promise<void> => {
   const response = await apiRequest.postSafe<LoginResponse>(
      "/auth/login",
      { userName: userName.trim(), password, rememberMe },
      { noAuth: true },
   );

   if (response.success && response.data) {
      const { user, accessToken } = response.data;

      if (!user || !accessToken) {
         onError("Phản hồi từ server không hợp lệ");
         return;
      }

      // Lưu access token vào memory ngay khi login thành công
      setAccessToken(accessToken);

      await onSuccess(user, accessToken);
   } else if (response.error) {
      switch (response.error.status) {
         case 401:
            onError("Tên đăng nhập hoặc mật khẩu không chính xác");
            break;
         case 429:
            onError("Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau");
            break;
         case 404:
            onError("Tài khoản không tồn tại");
            break;
         case 403:
            onError("Tài khoản của bạn đã bị khóa");
            break;
         default:
            onError(response.error.message || "Đăng nhập thất bại");
      }
   } else {
      onError("Phản hồi từ server không hợp lệ");
   }
};
