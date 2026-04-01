"use client";

import { useRef, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, X, Pencil, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { LowStockProductInfo } from "../_libs/products";

interface StockAlertBannerProps {
  products: LowStockProductInfo[];
}

export function StockAlertBanner({ products }: StockAlertBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("stock-alert-dismissed") === "true";
  });
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);

  const handleDismiss = () => {
    sessionStorage.setItem("stock-alert-dismissed", "true");
    setDismissed(true);
  };

  if (dismissed || products.length === 0) return null;

  // Flatten variants thành ticker items
  const tickerItems = products.flatMap((p) =>
    p.lowStockVariants.map((v) => ({
      id: p.id,
      label: v.label !== "Default" ? `${p.name} · ${v.label}` : p.name,
      quantity: v.quantity,
      isOut: v.isOutOfStock,
    })),
  );

  // Tổng số variant bị lỗi
  const totalVariants = tickerItems.length;
  const outCount = tickerItems.filter((t) => t.isOut).length;

  // Duration tỉ lệ với số items
  const tickerDuration = Math.max(14, tickerItems.length * 3.5);

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 overflow-hidden shadow-sm">
      {/* ── Header / Ticker bar ── */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-amber-200 bg-gradient-to-r from-amber-100/80 to-amber-50 min-w-0">
        {/* Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <AlertTriangle size={13} className="text-amber-600" />
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide whitespace-nowrap">Cảnh báo tồn kho</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-300/70 text-amber-900 text-[10px] font-bold">{products.length}</span>
          {outCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold border border-red-200">{outCount} hết hàng</span>}
        </div>

        {/* ── Ticker — dừng khi hover, overflow ẩn sạch ── */}
        <div
          className="w-0 flex-1 overflow-hidden"
          style={{
            maskImage: "linear-gradient(90deg, transparent 0%, #000 32px, #000 calc(100% - 32px), transparent 100%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 32px, #000 calc(100% - 32px), transparent 100%)",
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          title="Hover để dừng"
        >
          {/* Nhân đôi content để seamless loop */}
          <div
            className="inline-flex whitespace-nowrap"
            style={{
              animation: `ticker-scroll ${tickerDuration}s linear infinite`,
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <Link
                key={i}
                href={`/admin/products/${item.id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 text-[12px] text-amber-800 font-medium hover:text-amber-950 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-amber-400 text-[14px]">•</span>
                {item.label}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.isOut ? "bg-red-100 text-red-600 border border-red-200" : "bg-amber-100 text-amber-700 border border-amber-300"}`}
                >
                  {item.isOut ? "Hết hàng" : `còn ${item.quantity}`}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-amber-700 hover:bg-amber-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {expanded ? "Thu gọn" : "Chi tiết"}
          </button>
          <button
            onClick={handleDismiss}
            title="Ẩn thông báo (phiên này)"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-amber-600 hover:bg-amber-200 transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── Detail grid ── */}
      {expanded && (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {products.map((product) => {
            const hasOut = product.lowStockVariants.some((v) => v.isOutOfStock);
            return (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}/edit`}
                className="group flex items-center gap-2.5 bg-white border border-amber-200 rounded-xl px-3 py-2.5 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden"
              >
                {/* Left accent bar */}
                <span className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${hasOut ? "bg-red-400" : "bg-amber-400"}`} />

                {/* Thumbnail */}
                <div className="w-9 h-9 rounded-lg overflow-hidden border border-amber-100 bg-amber-50 shrink-0 flex items-center justify-center">
                  {product.thumbnail ? (
                    <Image src={product.thumbnail} alt={product.name} width={36} height={36} className="object-contain w-full h-full" unoptimized />
                  ) : (
                    <Package size={14} className="text-amber-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-amber-900 truncate mb-1">{product.name}</p>
                  <div className="space-y-0.5">
                    {product.lowStockVariants.map((v) => (
                      <div key={v.id} className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-amber-600 truncate">{v.label === "Default" ? "Mặc định" : v.label}</span>
                        <span className={`text-[10px] font-bold shrink-0 ${v.isOutOfStock ? "text-red-600" : "text-amber-600"}`}>{v.isOutOfStock ? "Hết hàng" : `${v.quantity} còn`}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Edit icon — hiện khi hover */}
                <Pencil size={12} className="shrink-0 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Ticker keyframe — inject 1 lần */}
      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
