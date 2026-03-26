"use client";

import Link from "next/link";
import { Bot, ChevronRight, Clock } from "lucide-react";
import type { RecentOrder } from "../dashboard.types";

const fmtVND = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

const fmtTime = (iso: string) => new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }).format(new Date(iso));

export function ChatbotPendingBanner({ orders }: { orders: RecentOrder[] }) {
  if (orders.length === 0) return null;
  return (
    <div className="bg-accent/5 border border-accent/20 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-accent/8 border-b border-accent/15">
        <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
          <Bot className="w-3 h-3 text-white" />
        </div>
        <p className="text-[11px] font-semibold text-accent flex-1">{orders.length} đơn chatbot đang chờ xác nhận</p>
        <Link href="/admin/orders?status=REQUEST_PENDING" className="text-[10px] font-semibold text-accent hover:text-accent/80 flex items-center gap-0.5 shrink-0">
          Xem tất cả <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-accent/10">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center gap-2 px-4 py-1.5 hover:bg-accent/4 transition-colors">
            <Clock className="w-3 h-3 text-accent/30 shrink-0" />
            <span className="font-mono text-[11px] font-bold text-accent shrink-0">#{order.orderCode}</span>
            <span className="text-[11px] text-slate-500 truncate flex-1">{order.customerName}</span>
            <span className="text-[11px] font-semibold text-slate-700 shrink-0">{fmtVND(order.totalAmount)}</span>
            <span className="text-[10px] text-slate-400 shrink-0">{fmtTime(order.orderDate)}</span>
            <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium bg-accent text-white hover:opacity-90 shrink-0">
              Xem
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
