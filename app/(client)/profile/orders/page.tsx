"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";

// Types
interface OrderItem {
   id: string;
   name: string;
   image: string;
   quantity: number;
   price: number;
   originalPrice: number;
}

interface Order {
   id: string;
   orderNumber: string;
   date: string;
   deliveryDate: string;
   status:
      | "pending"
      | "processing"
      | "shipping"
      | "completed"
      | "cancelled"
      | "returned";
   deliveryMethod: string;
   items: OrderItem[];
   subtotal: number;
   discount: number;
   shipping: number;
   total: number;
}

// Tab configuration
const tabs = [
   { id: "all", label: "Tất cả" },
   { id: "processing", label: "Đang xử lý" },
   { id: "shipping", label: "Đang giao" },
   { id: "completed", label: "Hoàn tất" },
   { id: "cancelled", label: "Đã hủy" },
   { id: "returned", label: "Trả hàng" },
];

// Status configuration
const statusConfig = {
   pending: {
      label: "Chờ xác nhận",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
   },
   processing: {
      label: "Đang xử lý",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
   },
   shipping: {
      label: "Đang giao",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
   },
   completed: {
      label: "Hoàn tất",
      color: "text-green-600",
      bgColor: "bg-green-50",
   },
   cancelled: { label: "Đã hủy", color: "text-red-600", bgColor: "bg-red-50" },
   returned: {
      label: "Trả hàng",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
   },
};

export default function OrdersPage() {
   const [activeTab, setActiveTab] = useState("all");

   // TODO: Replace with actual API call
   const orders: Order[] = [
      // Mock data - replace with API
   ];

   // Filter orders based on active tab
   const filteredOrders = orders.filter((order) => {
      if (activeTab === "all") return true;
      return order.status === activeTab;
   });

   return (
      <div>
         {/* Header */}
         <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-left mt-2">
            Đơn hàng của tôi
         </h1>
         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Tabs Header - No title, just tabs */}
            <div className="py-2">
               <div className="flex overflow-x-auto scrollbar-hide">
                  {tabs.map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-3 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer
          ${
             activeTab === tab.id
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
                     >
                        {tab.label}
                     </button>
                  ))}
               </div>
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
               {filteredOrders.length === 0 ? (
                  <EmptyState />
               ) : (
                  <div className="p-6 space-y-4">
                     {filteredOrders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}

// Empty State Component
function EmptyState() {
   return (
      <div className="flex flex-col items-center justify-center py-10 px-4">
         {/* Empty Box Image */}
         <div className=" mb-2">
            <img
               src="https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/estore-v2/img/empty_state.png"
               alt="Không có đơn hàng"
               className="object-contain w-60 h-60 mx-auto"
            />
         </div>

         {/* Text */}
         <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Bạn chưa có đơn hàng nào
         </h3>
         <p className="text-gray-600 mb-8 text-center text-sm">
            Cùng khám phá hàng ngàn sản phẩm tại ChoCongNghe Shop nhé!
         </p>

         {/* CTA Button */}
         <Link
            href="/products"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-md hover:shadow-lg"
         >
            Khám phá ngay
         </Link>
      </div>
   );
}

// Order Card Component
function OrderCard({ order }: { order: Order }) {
   const status = statusConfig[order.status];

   return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
         {/* Header */}
         <div className="flex flex-wrap justify-between items-center gap-3 px-6 py-3 bg-gray-50 border-b">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
               <span>
                  Ngày nhận:{" "}
                  <span className="text-gray-800">{order.deliveryDate}</span>
               </span>
               <span className="text-gray-400">•</span>
               <span>{order.deliveryMethod}</span>
               <span className="text-gray-400">•</span>
               <span>{order.items.length} sản phẩm</span>
            </div>
            <span
               className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color} ${status.bgColor}`}
            >
               <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
               {status.label}
            </span>
         </div>

         {/* Product List */}
         <div className="divide-y">
            {order.items.map((item) => (
               <div key={item.id} className="flex gap-4 px-6 py-4">
                  <div className="relative w-16 h-16 shrink-0 bg-gray-100 rounded border overflow-hidden">
                     <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                     />
                  </div>

                  <div className="flex-1">
                     <h3 className="font-medium text-gray-800 mb-1">
                        {item.name}
                     </h3>
                     <p className="text-sm text-gray-500">
                        Số lượng: {item.quantity}
                     </p>
                  </div>

                  <div className="text-right">
                     <p className="font-semibold text-gray-800">
                        {item.price.toLocaleString("vi-VN")}₫
                     </p>
                     {item.originalPrice > item.price && (
                        <p className="text-sm line-through text-gray-400">
                           {item.originalPrice.toLocaleString("vi-VN")}₫
                        </p>
                     )}
                  </div>
               </div>
            ))}
         </div>

         {/* Footer */}
         <div className="px-6 py-4 bg-gray-50 border-t space-y-3">
            <div className="flex justify-between items-center text-sm">
               <Link
                  href={`/profile/orders/${order.id}`}
                  className="text-gray-600 hover:text-red-600 flex items-center gap-1"
               >
                  Xem chi tiết
                  <ChevronRight className="w-4 h-4" />
               </Link>

               <div className="text-right">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="text-red-600 font-semibold ml-2 text-lg">
                     {order.total.toLocaleString("vi-VN")}₫
                  </span>
               </div>
            </div>

            <div className="flex justify-end">
               <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                  Mua lại
               </button>
            </div>
         </div>
      </div>
   );
}
