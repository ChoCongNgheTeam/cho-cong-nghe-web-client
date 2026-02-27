import apiRequest from "@/lib/api";
import { Order } from "../order.types";

export interface OrderDetailResponse {
   data: Order;
   message: string;
}

export async function getOrderById(id: string): Promise<OrderDetailResponse> {
   return apiRequest.get<OrderDetailResponse>(`/orders/admin/${id}`);
}
