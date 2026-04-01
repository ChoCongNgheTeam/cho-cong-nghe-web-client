"use client";

import Image from "next/image";
import { formatNumber, formatVND } from "@/helpers";
import Link from "next/link";
import { ArrowUpRight, Package, AlertTriangle } from "lucide-react";
import type { TopProduct } from "../dashboard.types";

const fmtVND = (v: number) => {
   if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}T`;
   if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
   return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
   }).format(v);
};

function StockBadge({ stock, days }: { stock?: number; days?: number }) {
   if (stock === undefined) return null;

   if (stock === 0)
      return (
         <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-promotion-light text-promotion border border-promotion-light-active flex items-center gap-0.5">
            <AlertTriangle className="w-2 h-2" />
            Hết
         </span>
      );

   if (days !== undefined && days <= 30)
      return (
         <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-accent-light text-accent-active border border-accent-light-active flex items-center gap-0.5">
            <AlertTriangle className="w-2 h-2" />
            {stock}
         </span>
      );

   return (
      <span className="text-[9px] text-neutral-dark font-mono">{stock}</span>
   );
}

export function TopProducts({ products }: { products: TopProduct[] }) {
   const max = products[0]?.totalSold ?? 1;

   return (
      <div className="bg-neutral-light rounded-xl border border-neutral px-4 py-3 shadow-sm h-full flex flex-col">
         <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-primary">Top sản phẩm</h3>
            <Link
               href="/admin/products"
               className="text-[10px] text-accent hover:text-accent-hover font-medium flex items-center gap-0.5"
            >
               Xem tất cả <ArrowUpRight className="w-3 h-3" />
            </Link>
         </div>

         {products.length === 0 ? (
            <p className="text-[13px] text-neutral-dark text-center py-6">
               Chưa có dữ liệu
            </p>
         ) : (
            <div className="space-y-3">
               {products.map((product, index) => (
                  <div
                     key={product.productId}
                     className="flex items-center gap-3"
                  >
                     <span
                        className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                           index === 0
                              ? "bg-amber-400 text-white" // medal gold — business color, giữ nguyên
                              : index === 1
                                ? "bg-neutral-dark text-white" // silver → neutral-dark
                                : index === 2
                                  ? "bg-accent-light text-accent" // bronze → accent-light
                                  : "bg-neutral text-neutral-dark" // rest → neutral
                        }`}
                     >
                        {index + 1}
                     </span>

                     <div className="w-8 h-8 rounded bg-neutral overflow-hidden shrink-0 flex items-center justify-center">
                        {product.imageUrl ? (
                           <Image
                              src={product.imageUrl}
                              alt={product.productName}
                              width={32}
                              height={32}
                              className="object-cover"
                           />
                        ) : (
                           <Package className="w-3.5 h-3.5 text-neutral-dark" />
                        )}
                     </div>

                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                           <Link
                              href={`/admin/products?slug=${product.productSlug}`}
                              className="text-[13px] font-semibold text-primary hover:text-accent truncate block"
                           >
                              {product.productName}
                           </Link>
                           <StockBadge
                              stock={product.currentStock}
                              days={product.daysUntilStockout}
                           />
                        </div>
                        <div className="mt-0.5 h-1 bg-neutral rounded-full overflow-hidden">
                           <div
                              className="h-full bg-accent rounded-full"
                              style={{
                                 width: `${(product.totalSold / max) * 100}%`,
                              }}
                           />
                        </div>
                     </div>

                     <div className="text-right shrink-0">
                        <p className="text-[13px] font-bold text-primary">
                           {product.totalSold} đã bán
                        </p>
                        <p className="text-[10px] text-neutral-dark">
                           {fmtVND(product.totalRevenue)}
                        </p>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}
