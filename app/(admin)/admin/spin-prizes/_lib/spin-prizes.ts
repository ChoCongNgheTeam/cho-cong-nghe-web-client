import apiRequest from "@/lib/api";
import { SpinPrize, CreateSpinPrizePayload, UpdateSpinPrizePayload, SpinStats } from "../spin-prize.types";

// BE mount thẳng /admin/spin-prizes (không có suffix /all), giống warehouses/suppliers.

export const getAllSpinPrizes = (): Promise<{ data: SpinPrize[]; message: string }> => apiRequest.get("/admin/spin-prizes");

export const getSpinPrize = (id: string): Promise<{ data: SpinPrize; message: string }> => apiRequest.get(`/admin/spin-prizes/${id}`);

export const createSpinPrize = (payload: CreateSpinPrizePayload): Promise<{ data: SpinPrize; message: string }> => apiRequest.post("/admin/spin-prizes", payload);

export const updateSpinPrize = (id: string, payload: UpdateSpinPrizePayload): Promise<{ data: SpinPrize; message: string }> => apiRequest.patch(`/admin/spin-prizes/${id}`, payload);

export const deleteSpinPrize = (id: string): Promise<{ message: string }> => apiRequest.delete(`/admin/spin-prizes/${id}`);

export const getSpinStats = (): Promise<{ data: SpinStats; message: string }> => apiRequest.get("/admin/spin-prizes/stats");

// Xoá toàn bộ lịch sử quay + reset ngân sách — dùng để dọn dữ liệu test trước buổi thi/demo
export const resetSpinData = (): Promise<{ message: string }> => apiRequest.post("/admin/spin-prizes/reset", {});
