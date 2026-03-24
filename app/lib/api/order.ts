import apiRequest, { SafeResponse } from "./index";

// Types matching user spec
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  orderCode: string;
  createdAt: string;
  totalPrice: number;
  paymentStatus: string;
  items: OrderItem[];
}

export const getOrderByCode = (orderCode: string): Promise<SafeResponse<Invoice>> =>
  apiRequest.get("/orders/public/" + orderCode, { noAuth: true });

export const getMyOrders = () => apiRequest.get("/orders/my");


