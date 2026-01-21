"use client";
import { useState } from "react";
import { FaFire, FaShoppingCart } from "react-icons/fa";
import Image from "next/image";

export default function ProductDetailSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const buttons = [
    "Combo Sim TD149 kèm bảo hành",
    "Combo eSim TD149 kèm bảo hành",
  ];

  return (
    <div className="container sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-neutral-light rounded-lg">
      <div className="border-b pb-4 sm:pb-6 border-neutral-dark">
        {/* Header */}
        <div className="flex gap-2 items-center">
          <FaFire size={20} className="sm:w-6 sm:h-6 text-promotion" />
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-primary">
            Giảm thêm khi mua kèm
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 sm:mt-6">
          {buttons.map((text, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`text-xs sm:text-sm border rounded-full px-3 sm:px-4 py-2 cursor-pointer transition-colors duration-200 whitespace-nowrap
            ${
              activeIndex === index
                ? "bg-promotion text-white border-promotion"
                : "bg-neutral-light text-primary border-neutral-dark hover:bg-neutral"
            }`}
            >
              {text}
            </button>
          ))}
        </div>

        {/* Product Card */}
        <div className="mt-4 flex gap-2 sm:gap-3 p-3 sm:p-4 border border-neutral-dark rounded-lg w-full sm:w-auto sm:max-w-md items-center bg-neutral-light">
          <Image
            src="https://cdn2.fptshop.com.vn/unsafe/128x0/filters:format(webp):quality(75)/Loai_Bao_hanh_vip_Mau_do_No_38871ff60b.png"
            alt="Bảo hành VIP"
            width={64}
            height={64}
            className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0"
          />
          <div className="flex flex-col gap-1 sm:gap-2 min-w-0">
            <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 text-primary">
              Dịch vụ bảo hành 1 đổi 1
            </h3>
            <div className="flex gap-1 sm:gap-2 items-baseline">
              <b className="text-sm sm:text-base text-primary">0đ</b>
              <s className="text-xs text-neutral-darker opacity-70">100.000đ</s>
            </div>
            <p className="text-xs text-accent font-medium">
              Tiết kiệm 100.000đ
            </p>
          </div>
        </div>

        {/* Footer - Summary & Actions */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Price Summary */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm text-neutral-darker">Tổng tiền:</span>
              <b className="text-lg sm:text-xl text-promotion">199.000đ</b>
              <s className="text-sm sm:text-base text-neutral-darker opacity-50">
                349.000đ
              </s>
              <span className="text-sm sm:text-base text-accent font-medium">
                -43%
              </span>
            </div>
            <p className="text-sm text-accent font-medium">
              Tiết kiệm: 150.000đ
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              className="border p-2.5 sm:p-3 rounded-full border-promotion cursor-pointer hover:bg-promotion-light transition-colors duration-200 flex-shrink-0"
              aria-label="Thêm vào giỏ hàng"
            >
              <FaShoppingCart
                size={18}
                className="sm:w-5 sm:h-5 text-promotion"
              />
            </button>
            <button className="flex-1 sm:flex-none px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base bg-promotion hover:bg-promotion-hover text-white font-semibold cursor-pointer transition-colors duration-200 whitespace-nowrap">
              Chọn mua kèm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}