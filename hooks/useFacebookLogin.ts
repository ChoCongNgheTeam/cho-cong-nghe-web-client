"use client";
import { API_BASE_URL } from "../config/api.config";
import { useCallback } from "react";

export function useFacebookLogin() {
  const login = useCallback((returnUrl?: unknown) => {
    const safeReturnUrl = typeof returnUrl === "string" ? returnUrl : "/";
    const params = new URLSearchParams({ returnUrl: safeReturnUrl });
    window.location.href = `${API_BASE_URL}/api/v1/auth/oauth/facebook/init?` + params.toString();
  }, []);

  return { login };
}
