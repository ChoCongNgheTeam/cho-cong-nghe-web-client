"use client";

import Link from "next/link";
import { Bot, ArrowUpRight, MapPin, Phone } from "lucide-react";
import type { RecentOrder } from "../dashboard.types";
import { formatDate, formatVND } from "@/helpers";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtVND = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

const fmtDate = (iso: string) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

// ─── Status configs ───────────────────────────────────────────────────────────

const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  REQUEST_PENDING: { label: "Chatbot", cls: "bg-purple-50 text-purple-600 border-purple-100" },
  PENDING: { label: "Chờ xác nhận", cls: "bg-amber-50  text-amber-600  border-amber-100" },
  PROCESSING: { label: "Xử lý", cls: "bg-blue-50   text-blue-600   border-blue-100" },
  SHIPPED: { label: "Đang giao", cls: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  DELIVERED: { label: "Đã giao", cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  CANCELLED: { label: "Đã hủy", cls: "bg-red-50    text-red-500    border-red-100" },
};

const PAYMENT_STATUS: Record<string, { label: string; cls: string }> = {
  UNPAID: { label: "Chưa TT", cls: "text-slate-400" },
  PAID: { label: "Đã TT", cls: "text-emerald-600 font-semibold" },
  REFUNDED: { label: "Hoàn TT", cls: "text-orange-500" },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

interface RecentOrdersTableProps {
  orders: RecentOrder[];
  title?: string;
  emptyMessage?: string;
}

export function RecentOrdersTable({ orders, title = "Đơn hàng gần đây", emptyMessage = "Chưa có đơn hàng nào" }: RecentOrdersTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50">
        <h3 className="text-xs font-semibold text-slate-600">{title}</h3>
        <Link href="/admin/orders" className="text-[10px] text-accent hover:text-accent/80 font-medium flex items-center gap-0.5">
          Xem tất cả <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-xs">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-[10px] font-medium text-slate-400 px-4 py-2">Mã đơn</th>
                <th className="text-left text-[10px] font-medium text-slate-400 px-3 py-2">Khách hàng</th>
                <th className="text-left text-[10px] font-medium text-slate-400 px-3 py-2">Sản phẩm</th>
                <th className="text-left text-[10px] font-medium text-slate-400 px-3 py-2">Trạng thái</th>
                <th className="text-right text-[10px] font-medium text-slate-400 px-3 py-2">TT</th>
                <th className="text-right text-[10px] font-medium text-slate-400 px-3 py-2">Tổng tiền</th>
                <th className="text-right text-[10px] font-medium text-slate-400 px-4 py-2">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order) => {
                const payment = PAYMENT_STATUS[order.paymentStatus] ?? { label: order.paymentStatus, cls: "text-slate-400" };
                const statusCfg = ORDER_STATUS[order.orderStatus] ?? { label: order.orderStatus, cls: "bg-slate-50 text-slate-500 border-slate-100" };

                // Summarize items
                const itemSummary = order.items && order.items.length > 0 ? (order.items.length === 1 ? order.items[0].productName : `${order.items[0].productName} +${order.items.length - 1}`) : "—";

                return (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Order code */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {order.isChatbotRequest && <Bot className="w-3 h-3 text-accent/50 shrink-0" aria-label="Đơn chatbot" />}
                        <Link href={`/admin/orders/${order.id}`} className="font-mono text-[11px] text-accent hover:text-accent/80 font-semibold group-hover:underline">
                          #{order.orderCode}
                        </Link>
                      </div>
                    </td>

                    {/* Customer — name + phone + address */}
                    <td className="px-3 py-2.5 max-w-[160px]">
                      <p className="font-medium text-slate-800 text-[11px] leading-tight truncate">{order.customerName}</p>
                      {order.customerPhone && (
                        <p className="flex items-center gap-0.5 text-[10px] text-slate-400 mt-0.5">
                          <Phone className="w-2.5 h-2.5 shrink-0" />
                          <span>{order.customerPhone}</span>
                        </p>
                      )}
                      {order.customerAddress && (
                        <p className="flex items-start gap-0.5 text-[10px] text-slate-400 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 shrink-0 mt-0.5" />
                          <span className="truncate max-w-[130px]" title={order.customerAddress}>
                            {order.customerAddress}
                          </span>
                        </p>
                      )}
                    </td>

                    {/* Products inline */}
                    <td className="px-3 py-2.5 max-w-[180px]">
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-0.5">
                          {order.items.slice(0, 2).map((item, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className="text-[11px] text-slate-700 font-medium truncate max-w-[130px]">{item.productName}</span>
                              <span className="text-[10px] text-slate-400 shrink-0">×{item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 2 && <span className="text-[10px] text-slate-400">+{order.items.length - 2} sản phẩm</span>}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-300">—</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${statusCfg.cls}`}>{statusCfg.label}</span>
                    </td>

                    {/* Payment */}
                    <td className="px-3 py-2.5 text-right">
                      <span className={`text-[10px] ${payment.cls}`}>{payment.label}</span>
                    </td>

                    {/* Total */}
                    <td className="px-3 py-2.5 text-right">
                      <span className="font-semibold text-slate-900 text-[11px]">{fmtVND(order.totalAmount)}</span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-2.5 text-right text-[10px] text-slate-400 whitespace-nowrap">{fmtDate(order.orderDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
