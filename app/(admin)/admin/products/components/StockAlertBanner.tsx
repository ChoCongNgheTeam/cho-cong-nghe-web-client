"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, X, Pencil, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { LowStockProductInfo } from "../_libs/products";

interface StockAlertBannerProps {
  lowStockProducts: LowStockProductInfo[]; // 0 < quantity <= 5
  outOfStockProducts: LowStockProductInfo[]; // quantity = 0
}

export function StockAlertBanner({ lowStockProducts, outOfStockProducts }: StockAlertBannerProps) {
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

  const totalCount = lowStockProducts.length + outOfStockProducts.length;
  if (dismissed || totalCount === 0) return null;

  // ── Ticker items ──────────────────────────────────────────────────────────
  // Out of stock trước, rồi low stock — mỗi item là 1 variant sắp hết
  const tickerItems = [
    ...outOfStockProducts.flatMap((p) =>
      p.lowStockVariants.map((v) => ({
        productId: p.id,
        label: v.label !== "Default" ? `${p.name} · ${v.label}` : p.name,
        quantity: v.quantity,
        isOut: true,
      })),
    ),
    ...lowStockProducts.flatMap((p) =>
      p.lowStockVariants.map((v) => ({
        productId: p.id,
        label: v.label !== "Default" ? `${p.name} · ${v.label}` : p.name,
        quantity: v.quantity,
        isOut: false,
      })),
    ),
  ];

  const tickerDuration = Math.max(14, tickerItems.length * 3.5);

  return (
    <div className="rounded-xl border border-amber-300  overflow-hidden shadow-sm">
      {/* ── Ticker bar ── */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-amber-200 min-w-0">
        {/* Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          <AlertTriangle size={13} className="text-amber-600" />
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide whitespace-nowrap">Cảnh báo tồn kho</span>
          {/* Tổng count */}
          <span className="px-1.5 py-0.5 rounded-full text-amber-900 text-[10px] font-bold">{totalCount}</span>
          {/* Badge hết hàng — chỉ hiện khi có */}
          {outOfStockProducts.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold border border-red-200">{outOfStockProducts.length} hết hàng</span>
          )}
          {/* Badge sắp hết — chỉ hiện khi có */}
          {lowStockProducts.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold border border-amber-300">{lowStockProducts.length} sắp hết</span>
          )}
        </div>

        {/* Ticker scroll */}
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
          {/* Nhân đôi để loop seamless */}
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
                href={`/admin/products/${item.productId}/edit`}
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
        <div className="p-3 space-y-3">
          {/* Nhóm hết hàng */}
          {outOfStockProducts.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest px-1 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                Hết hàng ({outOfStockProducts.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {outOfStockProducts.map((product) => (
                  <ProductAlertCard key={product.id} product={product} type="out" />
                ))}
              </div>
            </div>
          )}

          {/* Nhóm sắp hết */}
          {lowStockProducts.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest px-1 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Sắp hết hàng ({lowStockProducts.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {lowStockProducts.map((product) => (
                  <ProductAlertCard key={product.id} product={product} type="low" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: 1 product card trong detail grid
// ─────────────────────────────────────────────────────────────────────────────

function ProductAlertCard({ product, type }: { product: LowStockProductInfo; type: "out" | "low" }) {
  const isOut = type === "out";
  return (
    <Link
      href={`/admin/products/${product.id}/edit`}
      className="group flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-3 py-2.5 hover:border-amber-200 hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden"
    >
      {/* Left accent bar */}
      <span className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${isOut ? "bg-red-400" : "bg-amber-400"}`} />

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
        <p className="text-[12px] font-semibold text-gray-900 truncate mb-1">{product.name}</p>
        <div className="space-y-0.5">
          {product.lowStockVariants.map((v) => (
            <div key={v.id} className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-gray-500 truncate">{v.label === "Default" ? "Mặc định" : v.label}</span>
              <span className={`text-[10px] font-bold shrink-0 ${v.isOutOfStock ? "text-red-600" : "text-amber-600"}`}>{v.isOutOfStock ? "Hết hàng" : `${v.quantity} còn`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit icon */}
      <Pencil size={12} className="shrink-0 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}
