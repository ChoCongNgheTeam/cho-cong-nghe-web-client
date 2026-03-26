"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Package } from "lucide-react";
import type { TopProduct } from "../dashboard.types";

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

interface TopProductsProps {
  products: TopProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
  const max = products[0]?.totalSold ?? 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-slate-700">Top sản phẩm bán chạy</h3>
        <Link href="/admin/products" className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1">
          Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">Chưa có dữ liệu</div>
      ) : (
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={product.productId} className="flex items-center gap-3 group">
              {/* Rank */}
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  index === 0 ? "bg-amber-400 text-white" : index === 1 ? "bg-slate-300 text-white" : index === 2 ? "bg-orange-300 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {index + 1}
              </span>

              {/* Image */}
              <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                {product.imageUrl ? <Image src={product.imageUrl} alt={product.productName} width={40} height={40} className="object-cover" /> : <Package className="w-5 h-5 text-slate-300" />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/admin/products?slug=${product.productSlug}`} className="text-xs font-semibold text-slate-800 hover:text-accent line-clamp-1 group-hover:underline">
                  {product.productName}
                </Link>
                {product.variantCode && <p className="text-xs text-slate-400 font-mono truncate mt-0.5">{product.variantCode}</p>}

                {/* Progress bar */}
                <div className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(product.totalSold / max) * 100}%` }} />
                </div>
              </div>

              {/* Stats */}
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-slate-900">{product.totalSold.toLocaleString("vi-VN")}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatVND(product.totalRevenue)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
