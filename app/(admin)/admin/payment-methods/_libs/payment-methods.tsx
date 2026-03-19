import apiRequest from "@/lib/api";
import type { PaymentMethod, CreatePaymentMethodPayload, UpdatePaymentMethodPayload } from "../payment-method.types";

interface PaymentMethodsResponse {
  data: PaymentMethod[];
  total: number;
  message: string;
}

interface PaymentMethodResponse {
  data: PaymentMethod;
  message: string;
}

export const getAllPaymentMethods = (): Promise<PaymentMethodsResponse> => apiRequest.get("/payments/admin/all");

export const createPaymentMethod = (payload: CreatePaymentMethodPayload): Promise<PaymentMethodResponse> => apiRequest.post("/payments/admin", payload);

export const updatePaymentMethod = (id: string, payload: UpdatePaymentMethodPayload): Promise<PaymentMethodResponse> => apiRequest.patch(`/payments/admin/${id}`, payload);

export const deletePaymentMethod = (id: string): Promise<void> => apiRequest.delete(`/payments/admin/${id}`);
