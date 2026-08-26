import apiRequest from "@/lib/api";
import { User } from "./types";

interface RequestOtpResponse {
  message: string;
  expiresInSeconds: number;
}

interface VerifyOtpResponse {
  user: User;
  accessToken: string;
  accessTokenTTL: number;
  message?: string;
}

export interface VerifyOtpResult {
  user: User;
  accessToken: string;
}

export async function requestEmailOtp(email: string): Promise<RequestOtpResponse> {
  return apiRequest.post<RequestOtpResponse>("/auth/otp/request", { email }, { noAuth: true });
}

export async function verifyEmailOtp(email: string, code: string): Promise<VerifyOtpResult> {
  const { user, accessToken } = await apiRequest.post<VerifyOtpResponse>("/auth/otp/verify", { email, code }, { noAuth: true });

  if (!user || !accessToken) {
    throw new Error("Phản hồi từ server không hợp lệ");
  }

  return { user, accessToken };
}
