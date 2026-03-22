// hooks/useFacebookLogin.ts
"use client";
import { useCallback } from "react";

export function useFacebookLogin() {
   const login = useCallback((returnUrl?: unknown) => {
      const safeReturnUrl = typeof returnUrl === "string" ? returnUrl : "/";
      const params = new URLSearchParams({ returnUrl: safeReturnUrl });
      window.location.href =
         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/oauth/facebook/init?` +
         params.toString();
   }, []);

   return { login };
}
