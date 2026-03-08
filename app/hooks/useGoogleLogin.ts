import { handleGoogleOAuth } from "@/(client)/(auth)/account/login/googleOAuthHandler";
import { User } from "@/(client)/(auth)/account/login/types";
import { useEffect, useCallback } from "react";

declare global {
   interface Window {
      google?: {
         accounts: {
            id: {
               initialize: (config: {
                  client_id: string;
                  callback: (response: { credential: string }) => void;
                  auto_select?: boolean;
                  cancel_on_tap_outside?: boolean;
               }) => void;
               prompt: () => void;
            };
         };
      };
   }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface UseGoogleLoginOptions {
   onSuccess: (user: User, accessToken: string) => Promise<void>;
   onError: (message: string) => void;
   onLoadingChange: (loading: boolean) => void;
}

export function useGoogleLogin({
   onSuccess,
   onError,
   onLoadingChange,
}: UseGoogleLoginOptions) {
   const handleCredential = useCallback(
      async (response: { credential: string }) => {
         onLoadingChange(true);
         try {
            const { user, accessToken } = await handleGoogleOAuth(
               response.credential,
            );
            await onSuccess(user, accessToken);
         } catch (err) {
            onError(
               err instanceof Error ? err.message : "Đăng nhập Google thất bại",
            );
         } finally {
            onLoadingChange(false);
         }
      },
      [onSuccess, onError, onLoadingChange],
   );

   useEffect(() => {
      if (!GOOGLE_CLIENT_ID) {
         console.error("Thiếu NEXT_PUBLIC_GOOGLE_CLIENT_ID trong .env");
         return;
      }

      const init = () => {
         window.google?.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredential,
            auto_select: false,
            cancel_on_tap_outside: true,
         });
      };

      if (window.google) {
         init();
         return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.body.appendChild(script);

      return () => {
         document.body.removeChild(script);
      };
   }, [handleCredential]);

   const prompt = () => {
      if (!window.google) {
         onError("Google chưa sẵn sàng, vui lòng thử lại.");
         return;
      }
      window.google.accounts.id.prompt();
   };

   return { prompt };
}
