export type InvoiceStatus = "paid" | "pending" | "cancelled";

export interface InvoiceItem {
  name: string;
  qty: number;
  unit: string;
  price: number;
}

export interface Invoice {
  id: string;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
  paidDate: string | null;
  customer: string;
  email: string;
  phone: string;
  address: string;
  taxCode: string;
  items: InvoiceItem[];
  discount: number;
  tax: number;
  serial: string;
  template: string;
}

export interface StatusConfig {
  label: string;
  icon: string;
  bg: string;
  border: string;
  text: string;
  badge: string;
}