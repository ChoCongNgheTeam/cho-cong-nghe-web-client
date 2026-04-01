"use client";

import Link from "next/link";
import { Bot, ChevronRight, Clock } from "lucide-react";
import type { RecentOrder } from "../dashboard.types";
import { formatDate, formatVND } from "@/helpers";

export function ChatbotPendingBanner({ orders }: { orders: RecentOrder[] }) {
   if (orders.length === 0) return null;

   return (
      <div className="bg-accent-light border border-accent-light-active rounded-xl overflow-hidden">
         {/* Header */}
         <div className="flex items-center gap-2 px-4 py-2 bg-accent-light-hover border-b border-accent-light-active">
            <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
               <Bot className="w-3 h-3 text-white" />
            </div>
            <p className="text-[11px] font-semibold text-accent flex-1">
               {orders.length} đơn chatbot đang chờ xác nhận
            </p>
            <Link
               href="/admin/orders?status=REQUEST_PENDING"
               className="text-[10px] font-semibold text-accent hover:text-accent-hover flex items-center gap-0.5 shrink-0"
            >
               Xem tất cả <ChevronRight className="w-3 h-3" />
            </Link>
         </div>

         {/* Rows */}
         <div className="divide-y divide-accent-light-active">
            {orders.map((order) => (
               <div
                  key={order.id}
                  className="flex items-center gap-2 px-4 py-1.5 hover:bg-accent-light-hover transition-colors"
               >
                  <Clock className="w-3 h-3 text-accent-light-active shrink-0" />
                  <span className="font-mono text-[11px] font-bold text-accent shrink-0">
                     #{order.orderCode}
                  </span>
                  <span className="text-[11px] text-primary-light truncate flex-1">
                     {order.customerName}
                  </span>
                  <span className="text-[11px] font-semibold text-primary shrink-0">
                     {formatVND(order.totalAmount)}
                  </span>
                  <span className="text-[10px] text-neutral-dark shrink-0">
                     {formatDate(order.orderDate)}
                  </span>
                  <Link
                     href={`/admin/orders/${order.id}`}
                     className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium bg-accent text-white hover:bg-accent-hover shrink-0"
                  >
                     Xem
                  </Link>
               </div>
            ))}
         </div>
      </div>
   );
}
