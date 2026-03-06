import apiRequest from "@/lib/api";
import { OrdersResponse } from "../order.types";

export interface GetAllOrdersParams {
   page?: number;
   limit?: number;
   orderStatus?: string;
   paymentStatus?: string;
   search?: string;
}

export async function getAllOrders(
   params?: GetAllOrdersParams,
): Promise<OrdersResponse> {
   return apiRequest.get<OrdersResponse>("/orders/admin/all", { params });
}
