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

// KHÔNG cần đăng nhập — dùng để quyết định ẩn/hiện nút vòng quay ngay lúc trang chủ
// vừa load, kể cả với khách vãng lai (khác với /spin/status vốn bắt buộc login).
export const getSpinAvailable = (): Promise<{ data: { available: boolean }; message: string }> => apiRequest.get("/spin/available");

export const getSpinStatus = (): Promise<{ data: SpinStatus; message: string }> => apiRequest.get("/spin/status");

export const spinWheel = (): Promise<{ data: SpinResult; message: string }> => apiRequest.post("/spin", {});
