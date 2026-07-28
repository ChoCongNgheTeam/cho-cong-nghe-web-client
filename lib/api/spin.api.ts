import apiRequest from "@/lib/api";

export interface SpinPrizePublic {
  id: string;
  label: string;
  colorHex: string | null;
  order: number;
}

export interface SpinStatus {
  canSpin: boolean;
  prizes: SpinPrizePublic[];
  wonPrize: { label: string; voucherCode: string | null } | null;
}

export interface SpinResult {
  prizeId: string;
  label: string;
  voucherCode: string | null;
}

export const getSpinStatus = (): Promise<{ data: SpinStatus; message: string }> => apiRequest.get("/spin/status");

export const spinWheel = (): Promise<{ data: SpinResult; message: string }> => apiRequest.post("/spin", {});
