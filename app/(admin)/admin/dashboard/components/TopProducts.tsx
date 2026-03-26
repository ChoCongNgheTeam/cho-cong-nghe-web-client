"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Package, AlertTriangle } from "lucide-react";
import type { TopProduct } from "../dashboard.types";

const fmtVND = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}T`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);
};

function StockBadge({ stock, days }: { stock?: number; days?: number }) {
  if (stock === undefined) return null;
  if (stock === 0)
    return (
      <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-red-50 text-red-500 border border-red-100 flex items-center gap-0.5">
        <AlertTriangle className="w-2 h-2" />
        Hết
      </span>
    );
  if (days !== undefined && days <= 30)
    return (
      <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-0.5">
        <AlertTriangle className="w-2 h-2" />
        {stock}
      </span>
    );
  return <span className="text-[9px] text-slate-400 font-mono">{stock}</span>;
}

export function TopProducts({ products }: { products: TopProduct[] }) {
  const max = products[0]?.totalSold ?? 1;
  return (
    <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-600">Top sản phẩm</h3>
        <Link href="/admin/products" className="text-[10px] text-accent hover:text-accent/80 font-medium flex items-center gap-0.5">
          Xem tất cả <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-[11px] text-slate-400 text-center py-6">Chưa có dữ liệu</p>
      ) : (
        <div className="space-y-2">
          {products.map((product, index) => (
            <div key={product.productId} className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  index === 0 ? "bg-amber-400 text-white" : index === 1 ? "bg-slate-300 text-white" : index === 2 ? "bg-orange-300 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {index + 1}
              </span>

              <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                {product.imageUrl ? <Image src={product.imageUrl} alt={product.productName} width={32} height={32} className="object-cover" /> : <Package className="w-3.5 h-3.5 text-slate-300" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Link href={`/admin/products?slug=${product.productSlug}`} className="text-[11px] font-semibold text-slate-800 hover:text-accent truncate block">
                    {product.productName}
                  </Link>
                  <StockBadge stock={product.currentStock} days={product.daysUntilStockout} />
                </div>
                <div className="mt-0.5 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${(product.totalSold / max) * 100}%` }} />
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[11px] font-bold text-slate-900">{product.totalSold} đã bán</p>
                <p className="text-[10px] text-slate-400">{fmtVND(product.totalRevenue)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
