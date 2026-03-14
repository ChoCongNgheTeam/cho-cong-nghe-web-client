export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodPayload {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export type UpdatePaymentMethodPayload = Partial<CreatePaymentMethodPayload>;
