import apiRequest from "@/lib/api";
import { User } from "./types";

interface GoogleOAuthResponse {
   user: User;
   accessToken: string;
   accessTokenTTL: number;
   message?: string;
}

export interface GoogleOAuthResult {
   user: User;
   accessToken: string;
}

export async function handleGoogleOAuth(
   idToken: string,
): Promise<GoogleOAuthResult> {
   const { user, accessToken } = await apiRequest.post<GoogleOAuthResponse>(
      "/auth/oauth/google",
      { idToken: idToken },
      { noAuth: true },
   );

   if (!user || !accessToken) {
      throw new Error("Phản hồi từ server không hợp lệ");
   }

   return { user, accessToken };
}
