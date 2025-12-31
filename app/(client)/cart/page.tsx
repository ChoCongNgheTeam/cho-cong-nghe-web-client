"use client";

import React from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, ChevronRight } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import Image from "next/image";

export default function CartPage() {
  const {
    items,
    isLoading,
    selectAll,
    selectedItems,
    toggleSelectAll,
    toggleSelectItem,
    updateQuantity,
    removeItem,
    removeSelectedItems,
    subtotal,
    totalDiscount,
    finalTotal,
  } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + " ₫";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-yellow-500"></div>
          <p className="text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link href="/" className="font-medium text-gray-900 hover:text-yellow-500">
            Trang chủ
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">Giỏ hàng</span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 sm:p-12 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Giỏ hàng trống</h2>
            <p className="mb-6 text-gray-600">Hãy thêm sản phẩm để tiếp tục mua sắm</p>
            <Link
              href="/products"
              className="inline-block rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-gray-900 transition hover:bg-yellow-500 hover:shadow-md"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">

            {/* Left: Select all + Cart items */}
            <div className="lg:col-span-2 space-y-4">

              {/* Select All + Thùng rác */}
              <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <label className="flex w-full items-center justify-between px-4 py-3 cursor-pointer hover:bg-yellow-50 transition">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="h-5 w-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Chọn tất cả ({items.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeSelectedItems}
                    disabled={selectedItems.length === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-black text-black hover:bg-red-100 transition transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </label>
              </div>

              {/* Cart items */}
              <div className="overflow-hidden rounded-xl border bg-white shadow-sm divide-y">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-4 hover:bg-yellow-50 transition transform hover:scale-[1.01]"
                  >
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelectItem(item.id)}
                      className="h-5 w-5 text-yellow-500 focus:ring-yellow-400"
                    />
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-100">
                      {item.image_url && (
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.product_name}
                      </h3>
                      <p className="text-xs text-gray-500">{item.variant_name}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <div className="w-full sm:w-24 text-red-600 font-semibold text-right">
                        {formatPrice(item.price)}
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="h-7 w-7 rounded border border-black hover:bg-yellow-100 transition"
                        >
                          <Minus className="mx-auto h-3 w-3 text-black" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-7 w-7 rounded border border-black hover:bg-yellow-100 transition"
                        >
                          <Plus className="mx-auto h-3 w-3 text-black" />
                        </button>
                      </div>
                      <div className="w-full sm:w-32 text-right font-semibold text-red-600 mt-2 sm:mt-0">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-black hover:text-red-600 mt-2 sm:mt-0 transition transform hover:scale-110"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Voucher + Summary */}
            <div className="lg:col-span-1 space-y-4">

              {/* Voucher / Mã khuyến mãi */}
              <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <button className="flex w-full items-center justify-between px-4 py-3 transition hover:bg-yellow-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      Chọn hoặc nhập mã khuyến mãi
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
                </button>
              </div>

              {/* Tổng tiền */}
              <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <div className="space-y-3 px-4 py-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền hàng</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Giảm giá sản phẩm</span>
                    <span>{formatPrice(totalDiscount)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span>0 ₫</span>
                  </div>

                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-medium">Cần thanh toán</span>
                    <span className="text-xl font-bold text-red-600">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={e => {
                    if (selectedItems.length === 0) e.preventDefault();
                  }}
                  className={`block w-full border-t py-4 text-center text-sm font-semibold transition ${
                    selectedItems.length === 0
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : "bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                  }`}
                >
                  Xác nhận đơn
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
