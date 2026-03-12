import apiRequest from "@/lib/api";

export interface CancelOrderResponse {
   message: string;
}

export async function cancelOrder(id: string): Promise<CancelOrderResponse> {
   return apiRequest.post<CancelOrderResponse>(`/orders/admin/${id}/cancel`);
}
