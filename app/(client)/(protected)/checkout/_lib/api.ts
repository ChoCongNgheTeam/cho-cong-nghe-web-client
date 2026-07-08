import apiRequest from "@/lib/api";
import type { StripePaymentInfo } from "../components/payment/PaymentResultModal";
import type { UserProfile, SavedAddress, PreviewData } from ".";

// Payment info trả về từ /checkout tuỳ theo phương thức thanh toán:
// - COD/bank transfer/ví điện tử redirect: chỉ có paymentUrl (hoặc không có gì)
// - Stripe: đủ field để mount payment element
export interface RedirectPaymentInfo {
  paymentUrl?: string;
}
export type CheckoutPaymentInfo = StripePaymentInfo | RedirectPaymentInfo | null;

export interface CreateAddressPayload {
  contactName: string;
  phone: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  detailAddress: string;
  type: "HOME" | "OFFICE" | "OTHER";
  isDefault: boolean;
}

export interface PlaceOrderPayload {
  paymentMethodId: string;
  shippingAddressId: string;
  contactName: string;
  phone: string;
  voucherId?: string;
}

export interface PlaceOrderResult {
  orderId: string;
  orderCode: string;
  paymentMethodCode: string;
  paymentInfo: CheckoutPaymentInfo;
}

// User

export async function getCurrentUser(): Promise<UserProfile> {
  const res = await apiRequest.get<{ data: UserProfile }>("/users/me");
  return res.data;
}

// Addresses

export async function getSavedAddresses(): Promise<SavedAddress[]> {
  const res = await apiRequest.get<{ success: boolean; data: SavedAddress[] }>("/addresses");
  return res?.data ?? [];
}

export async function getDefaultAddress(): Promise<SavedAddress | null> {
  const res = await apiRequest.get<{ success: boolean; data: SavedAddress | null }>("/addresses/default");
  return res?.data ?? null;
}

export async function createAddress(payload: CreateAddressPayload): Promise<{ id: string }> {
  const res = await apiRequest.post<{ data: { id: string } }>("/addresses", payload);
  return res.data;
}

export async function deleteAddress(id: string): Promise<void> {
  await apiRequest.delete(`/addresses/${id}`);
}

// Checkout

export async function getCheckoutPreview(params: URLSearchParams): Promise<PreviewData> {
  const res = await apiRequest.get<{ success: boolean; data: PreviewData }>(`/checkout/preview?${params.toString()}`);
  return res.data;
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<{ success: boolean; data: PlaceOrderResult }> {
  return apiRequest.post<{ success: boolean; data: PlaceOrderResult }>("/checkout", payload);
}
