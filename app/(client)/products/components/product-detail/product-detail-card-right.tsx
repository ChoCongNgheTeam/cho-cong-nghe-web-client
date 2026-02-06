"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaStar, FaGift, FaCog, FaShoppingCart, FaTruck } from "react-icons/fa";
import { ProductDetail } from "@/lib/types/product";
import Link from "next/link";

interface ProductDetailRightProps {
  product?: ProductDetail;
  selectedColor?: string;
  selectedStorage?: string;
  onColorChange?: (color: string) => void;
  onStorageChange?: (storage: string) => void;
  onReviewClick?: () => void;
  onSpecificationClick?: () => void;
  selectedVariant?: ProductVariant;
  availableOptions?: any[];
}

interface ProductVariant {
   id: string;
   price: number;
   images?: { imageUrl: string }[];
   sku?: string;
}

type ColorOption = {
   value: string;
   image?: string;
   label?: string;
   enabled?: boolean;
};

type StorageOption = {
   value: string;
   label?: string;
   type?: string;
};

export default function ProductDetailRight({
  product,
  selectedColor: propSelectedColor,
  selectedVariant,
  selectedStorage: propSelectedStorage,
  onColorChange,
  onStorageChange,
  onReviewClick,
  onSpecificationClick,
  availableOptions,
}: ProductDetailRightProps = {}) {
  /* ============================================================================
   * GUARD
   * ========================================================================== */
  if (!product) {
    return <div className="text-primary">Loading...</div>;
  }

   /* ============================================================================
    * PRODUCT DATA
    * ========================================================================== */
   const storages: StorageOption[] = (() => {
      const storageOption = product.availableOptions?.find(
         (opt) => opt.type === "storage",
      );
      return (
         storageOption?.values?.map((val) => ({
            label: val.label,
            value: val.value,
         })) || []
      );
   })();

   const colors: ColorOption[] = (() => {
      // ✅ SỬA: Dùng availableOptions thay vì product.availableOptions
      const colorOption = availableOptions?.find((opt) => opt.type === "color");
      if (!colorOption?.values) return [];

      return colorOption.values.map((val: any) => ({
         value: val.value,
         label: val.label,
         enabled: val.enabled, // ✅ THÊM: Lấy enabled từ API
         image: val.image?.imageUrl,
      }));
   })();

   /* ============================================================================
    * STATE
    * ========================================================================== */
   const selectedColor = propSelectedColor || colors[0]?.value || "";
   const selectedStorage = propSelectedStorage || storages[0]?.value || "";

   const [timeLeft, setTimeLeft] = useState({
      hours: 23,
      minutes: 9,
      seconds: 51,
   });

   /* ============================================================================
    * EFFECTS
    * ========================================================================== */
   useEffect(() => {
      const endTime = new Date();
      endTime.setHours(23, 59, 59, 999);

      const updateTimer = () => {
         const diff = endTime.getTime() - Date.now();
         if (diff <= 0) {
            setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            return;
         }
         setTimeLeft({
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
         });
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
   }, []);

   return (
      <div className="w-full">
         {/* Badges */}
         <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
            <span className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 px-3 py-1.5 shadow-md flex items-center justify-center sm:justify-start">
               <FaTruck className="mr-2 text-white text-sm sm:text-base" />
               <p className="text-xs sm:text-sm font-semibold text-white">
                  Free ship toàn quốc
               </p>
            </span>
            <span className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-500 px-3 py-1.5 shadow-md flex items-center justify-center sm:justify-start">
               <FaStar className="mr-2 text-yellow-300 text-sm sm:text-base" />
               <p className="text-xs sm:text-sm font-semibold text-white">
                  Độc quyền tại ChoCongNghe
               </p>
            </span>
         </div>

      {/* Product Title */}
      <h2 className="my-3 sm:my-4 text-lg sm:text-xl lg:text-2xl font-bold text-primary transition-colors duration-300">
        {product.name}
      </h2>

      {/* Rating & Links */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <span className=" transition-colors duration-300">
          {product.currentVariant?.code}
        </span>
        <div className="flex items-center gap-1">
          <FaStar className="text-accent text-xs sm:text-sm" />
          <span className="text-primary">
            {product.rating.average.toFixed(1)}
          </span>
        </div>
        <button
          onClick={onReviewClick}
          className="text-accent hover:underline hover:text-accent-hover transition-colors cursor-pointer"
        >
          {product.rating.total} đánh giá
        </button>
        <span className="">|</span>
        <button
        type="button"
          onClick={onSpecificationClick}
          className="text-accent hover:underline hover:text-accent-hover transition-colors cursor-pointer"
        >
          Thông số kỹ thuật
        </button>
      </div>

   <div className="grid grid-cols-[90px_1fr] sm:grid-cols-[100px_1fr] gap-y-4 sm:gap-y-5 gap-x-4 mt-6">
  {/* Storage Selection */}
  <span className="font-medium text-primary text-xs sm:text-sm flex items-center">
    Dung lượng:
  </span>

  <div className="flex flex-wrap gap-2">
    {storages.map((storage) => {
      const isActive = selectedStorage === storage.value;

      return (
        <span
          key={storage.value}
          onClick={() => onStorageChange?.(storage.value)}
          className={`border rounded-sm px-3 py-2 sm:px-4 sm:py-3 rounded-sm text-xs sm:text-sm font-bold  cursor-pointer relative overflow-hidden transition-colors duration-300
            ${
              isActive
                ? "border-promotion text-promotion bg-neutral-light"
                : "text-primary bg-neutral-light"
            }
          `}
        >
          {storage.label}

          {isActive && (
            <div className="absolute -top-1 -right-2 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-promotion">
              <span className="absolute -top-[28px] -right-[-7px] text-white text-xs font-bold">
                ✓
              </span>
            </div>
          )}
        </span>
      );
    })}
  </div>
  {/* Color Selection */}
  <span className="font-medium text-primary text-xs sm:text-sm flex mt-4">
    Màu sắc:
  </span>

  <div className="flex flex-wrap gap-2">
    {colors
      .filter((color) => color.enabled)
      .map((color) => {
        const isActive = selectedColor === color.value;

        return (
          <span
            key={color.value}
            onClick={() => onColorChange?.(color.value)}
            className={`px-3 py-2 sm:px-4 sm:py-3 rounded-sm text-xs sm:text-sm font-bold   cursor-pointer border relative overflow-hidden flex items-center gap-2 transition-colors duration-300
              ${
                isActive
                  ? "border-promotion text-promotion bg-promotion-light"
                  : "bg-neutral-light"
              }
              hover:bg-promotion-light
            `}
          >
            {color.image && (
              <img
                src={color.image}
                alt={color.value}
                className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
              />
            )}

            {color.label}

            {isActive && (
              <div className="absolute -top-1 -right-2 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-promotion">
                <span className="absolute -top-[28px] -right-[-7px] text-white text-xs font-bold">
                  ✓
                </span>
              </div>
            )}
          </span>
        );
      })}
  </div>

   </div>

         {/* Banner Image */}
         <div className="py-4 sm:py-6 rounded-lg">
            <img
               src="https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/507x85_6_f64d62e323.png"
               alt="Banner"
               className="w-full h-auto rounded-lg"
            />
         </div>

      {/* Price Section */}
      <div className="bg-accent-light p-3 sm:p-4 rounded-lg mb-4 border border-accent transition-colors duration-300">
        {/* Main Price */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-primary transition-colors duration-300">
                {(
                  selectedVariant?.price ||
                  product.currentVariant?.price ||
                  0
                ).toLocaleString("vi-VN")}
                ₫
              </h3>
              <div className="flex gap-2 items-center">
                <span className="text-xs sm:text-sm  line-through transition-colors duration-300">
                  {(
                    selectedVariant?.price ||
                    product.currentVariant?.price ||
                    0
                  ).toLocaleString("vi-VN")}
                  ₫ ₫
                </span>
                <span className="text-xs sm:text-sm font-bold text-promotion">
                  3%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent-dark text-xs sm:text-sm border border-accent-dark rounded-full px-2 py-1 transition-colors duration-300">
                💰 +8.697 Điểm thưởng
              </span>
            </div>
          </div>

          {/* Installment Option */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <p className="border  px-2 py-1 rounded-full bg-neutral-light  text-xs whitespace-nowrap transition-colors duration-300">
              Hoặc
            </p>
            <div className="text-xs sm:text-sm">
              <p className=" transition-colors duration-300">
                Trả góp
              </p>
              <p className="mt-1">
                <span className="font-semibold text-base sm:text-lg text-primary transition-colors duration-300">
                  1.448.342đ
                </span>
                <span className="text-xs sm:text-sm text-primary">
                  /tháng
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Voucher Banner */}
        <div className="bg-gradient-to-r from-promotion-dark to-orange-600 to-orange-500 p-3 sm:p-4 rounded-lg text-white mt-3 sm:mt-4 transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div className="flex-1">
              <p className="font-bold mb-1 sm:mb-2 text-sm sm:text-base">
                Trợ giá mua kèm
              </p>
              <p className="text-xs sm:text-sm">
                Tăng voucher giảm ngày đến 2.5 triệu
              </p>
            </div>
            <button className="bg-white/30 hover:bg-white/40 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors">
              Chọn mua &gt;&gt;
            </button>
          </div>
        </div>

        {/* Promotions */}
        <div className="mt-3 sm:mt-4">
          <p className="font-semibold mb-2 text-xs sm:text-sm text-primary transition-colors duration-300">
            Chọn 1 trong các khuyến mãi sau:
          </p>

          {/* Flash Sale */}
          <div className="bg-accent-light border-accent border rounded-lg p-2 sm:p-3 mb-3 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2 bg-promotion-light p-2 rounded transition-colors duration-300">
              <span className="text-promotion font-bold text-xs sm:text-sm">
                🔔 GIÁ SỐC ONLINE
              </span>
              <span className="text-accent-dark text-xs font-semibold">
                🔥 Đã bán 5/10 suất
              </span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-xs  transition-colors duration-300">
                  Giảm ngay
                </p>
                <p className="text-base sm:text-lg font-bold text-promotion">
                  1.000.000đ
                </p>
              </div>
              <div className="w-full sm:w-auto sm:text-right">
                <p className="text-xs  mb-1 transition-colors duration-300">
                  Kết thúc sau
                </p>
                <div className="flex gap-1 text-xs sm:text-sm font-bold">
                  <span className="bg-primary-dark text-neutral-light px-2 py-1 rounded transition-colors duration-300">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-primary">:</span>
                  <span className="bg-primary-dark text-neutral-light px-2 py-1 rounded transition-colors duration-300">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-primary">:</span>
                  <span className="bg-primary-dark text-neutral-light px-2 py-1 rounded transition-colors duration-300">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Promotion Details */}
          <div className="border rounded-lg p-3 bg-neutral-light  transition-colors duration-300">
            <p className="font-semibold text-xs sm:text-sm mb-2 text-primary transition-colors duration-300">
              Khuyến mãi 1
            </p>
            <ul className="text-xs sm:text-sm  space-y-2 transition-colors duration-300">
              <li>✓ Giảm ngay 200.000đ áp dụng đến 25/12</li>
              <li>
                ✓ AirPods/Ốp Lưng phụ kiện nhập khẩu giảm đến 500.000đ khi mua
                kèm iPhone
              </li>
              <li>✓ Trả góp 0%</li>
            </ul>
          </div>
        </div>

        {/* Student Promotion */}
        <div className="bg-pink-100 border border-pink-300 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4 transition-colors duration-300">
          <div className="flex gap-3 sm:gap-4">
            <div className="bg-gradient-to-b from-purple-400 to-purple-600 p-2 sm:p-3 rounded text-white text-center min-w-[60px] sm:min-w-[80px] flex-shrink-0">
              <p className="text-xs font-bold">Đặc quyền</p>
              <p className="text-base sm:text-lg font-bold">HSSV</p>
              <p className="text-xs">Giáo viên</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm mb-1 text-primary-darker transition-colors duration-300">
                Đặc quyền HSSV - Giáo viên
              </p>
              <p className="text-xs sm:text-sm text-primary-darker mb-2 transition-colors duration-300">
                Giảm ngay 200.000đ
              </p>
              <button className="bg-promotion hover:bg-promotion-hover text-white px-3 py-1.5 rounded text-xs sm:text-sm font-semibold transition-colors">
                Xác thực ngay
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gifts & Benefits */}
      <div className="flex flex-col border  border-neutral rounded-lg mb-4 transition-colors duration-300">
        <div className="flex justify-between items-center px-3 sm:px-4 py-3 sm:py-4  bg-neutral rounded-t-lg transition-colors duration-300">
          <p className="text-sm sm:text-base font-semibold text-primary transition-colors duration-300">
            Quà tặng và ưu đãi khác
          </p>
        </div>
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm  transition-colors duration-300">
          <div className="flex items-start gap-3 my-3">
            <FaGift className="text-promotion text-base sm:text-lg flex-shrink-0 mt-0.5" />
            <div className="flex flex-col min-w-0">
              <span className="break-words text-primary transition-colors duration-300">
                Tặng phiếu mua hàng 50,000đ khi mua sim FPT kèm máy
              </span>
              <Link
                href="#"
                className="text-promotion hover:text-promotion-hover hover:underline transition-colors"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <p className=" whitespace-nowrap text-xs sm:text-sm transition-colors duration-300">
              Ưu đãi
            </p>
            <span className="border border-neutral w-full"></span>
          </div>
          <div className="flex items-start gap-3 mb-3">
            <FaCog className=" text-base sm:text-lg flex-shrink-0 mt-0.5 transition-colors duration-300" />
            <span className="break-words text-primary transition-colors duration-300">
              Giảm 5% mua camera cho đơn hàng Điện thoại/ Tablet từ 1 triệu{" "}
              <Link
                href="#"
                className="text-promotion hover:text-promotion-hover hover:underline transition-colors"
              >
                Xem chi tiết
              </Link>
            </span>
          </div>
          <div className="flex items-start gap-3 mb-3">
            <FaCog className=" text-base sm:text-lg flex-shrink-0 mt-0.5 transition-colors duration-300" />
            <span className="break-words text-primary transition-colors duration-300">
              Giảm 5% mua camera cho đơn hàng Điện thoại/ Tablet từ 1 triệu{" "}
              <Link
                href="#"
                className="text-promotion hover:text-promotion-hover hover:underline transition-colors"
              >
                Xem chi tiết
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button className="flex items-center justify-center gap-2 text-promotion py-3 rounded-lg transition-colors hover:bg-promotion-light border border-promotion sm:flex-1 cursor-pointer bg-neutral-light">
          <FaShoppingCart size={24} className="sm:w-7 sm:h-7" />
        </button>
        <button className="flex-1 sm:flex-[2] bg-promotion hover:bg-promotion-hover text-neutral-light py-3 rounded-lg transition-colors text-sm sm:text-base cursor-pointer">
          Mua ngay
        </button>
        <button className="flex-1 sm:flex-[2] bg-primary-dark hover:bg-primary-hover text-neutral-light py-3 rounded-lg transition-colors text-sm sm:text-base cursor-pointer">
          Trả góp 0%
        </button>
      </div>
    </div>
  );
}
