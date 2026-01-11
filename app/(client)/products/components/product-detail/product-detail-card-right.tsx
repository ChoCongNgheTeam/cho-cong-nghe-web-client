"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaStar, FaGift, FaCog, FaShoppingCart, FaTruck } from "react-icons/fa";
import { mockProduct, type Product } from "../../_lib/mockProduct";
import Link from "next/link";

interface ProductDetailRightProps {
  product?: Product;
  onReviewClick?: () => void;
}

export default function ProductDetailRight({
  product = mockProduct,
  onReviewClick,
}: ProductDetailRightProps = {}) {
  // Dung lượng
  const storage = product.variants[0].attributes.find(
    (attr) => attr.name === "Bộ nhớ trong"
  )?.value;
  const colorAttr = product.variants[0].attributes.find(
    (attr) => attr.name === "Màu sắc"
  );
  // Màu sắc
  const colors = Array.isArray(colorAttr?.value) ? colorAttr.value : [];
  const [selectedColor, setSelectedColor] = useState(colors?.[0]);

  // Phương thức thanh toán
  const [activePayment, setActivePayment] = useState(0);

  // State cho countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 9,
    seconds: 51,
  });

  useEffect(() => {
    // Tính thời gian kết thúc (hôm nay 23:59:59)
    const now = new Date();
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999);

    const updateTimer = () => {
      const current = new Date();
      const difference = endTime.getTime() - current.getTime();

      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
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
      <h2 className="my-3 sm:my-4 text-lg sm:text-xl lg:text-2xl font-bold">
        {product.name}
      </h2>

      {/* Rating & Links */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <span className="text-gray-500">{product.variants[0].code}</span>
        <div className="flex items-center gap-1">
          <FaStar className="text-yellow-400 text-xs sm:text-sm" />
          <span>{product.rating_average}</span>
        </div>
        {/* Thêm onClick vào link đánh giá */}
        <button
          onClick={onReviewClick}
          className="text-[#1250dc] hover:underline hover:text-[#0d3ba8] transition-colors"
        >
          {product.ratingCount} đánh giá
        </button>
        <span>|</span>
        <Link href="#" className="text-[#1250dc] hover:underline">
          Thông số kỹ thuật
        </Link>
      </div>

      {/* Storage Selection */}
      <div className="flex flex-col sm:flex-row text-xs sm:text-sm items-start sm:items-center gap-2 sm:gap-4 py-3 sm:py-4">
        <span className="w-full sm:w-24 font-medium">Dung lượng:</span>
        <span className="border rounded-sm px-3 py-2 sm:px-4 sm:py-3 font-bold border-red-700 cursor-pointer relative overflow-hidden">
          {storage}
          <div className="absolute -top-1 -right-2 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-red-500">
            <span className="absolute -top-[28px] -right-[-7px] text-white text-xs font-bold">
              ✓
            </span>
          </div>
        </span>
      </div>

      {/* Color Selection */}
      <div className="flex flex-col sm:flex-row text-xs sm:text-sm items-start sm:items-center gap-2 sm:gap-4">
        <span className="w-full sm:w-24 font-medium">Màu sắc:</span>
        <div className="flex flex-wrap gap-2">
          {colors.map((color, index) => {
            const isActive = selectedColor === color;
            return (
              <span
                key={index}
                onClick={() => setSelectedColor(color)}
                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-sm font-bold cursor-pointer border relative overflow-hidden
                  ${
                    isActive
                      ? "border-red-700"
                      : "border-gray-300 text-gray-600"
                  }
                  hover:bg-red-50 transition-colors`}
              >
                {color}
                {isActive && (
                  <div className="absolute -top-1 -right-2 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-red-500">
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
          className="w-full h-auto"
        />
      </div>

      {/* Price Section */}
      <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg mb-4 border border-yellow-300">
        {/* Main Price */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {(product.variants[0].price || 0).toLocaleString("vi-VN")}₫
              </h3>
              <div className="flex gap-2 items-center">
                <span className="text-xs sm:text-sm text-gray-500 line-through">
                  {(product.variants[0].price || 0).toLocaleString("vi-VN")}₫
                </span>
                <span className="text-xs sm:text-sm font-bold text-red-600">
                  3%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 text-xs sm:text-sm border border-yellow-600 rounded-full px-2 py-1">
                💰 +8.697 Điểm thưởng
              </span>
            </div>
          </div>

          {/* Installment Option */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <p className="border border-gray-300 px-2 py-1 rounded-full bg-white text-gray-700 text-xs whitespace-nowrap">
              Hoặc
            </p>
            <div className="text-xs sm:text-sm">
              <p className="text-gray-600">Trả góp</p>
              <p className="mt-1">
                <span className="font-semibold text-base sm:text-lg">
                  1.448.342đ
                </span>
                <span className="text-xs sm:text-sm">/tháng</span>
              </p>
            </div>
          </div>
        </div>

        {/* Voucher Banner */}
        <div className="bg-gradient-to-r from-red-700 to-orange-600 p-3 sm:p-4 rounded-lg text-white mt-3 sm:mt-4">
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
          <p className="font-semibold mb-2 text-xs sm:text-sm">
            Chọn 1 trong các khuyến mãi sau:
          </p>

          {/* Flash Sale */}
          <div className="bg-yellow-50 border-yellow-300 border rounded-lg p-2 sm:p-3 mb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2 bg-red-100 p-2 rounded">
              <span className="text-red-600 font-bold text-xs sm:text-sm">
                🔔 GIÁ SỐC ONLINE
              </span>
              <span className="text-yellow-600 text-xs font-semibold">
                🔥 Đã bán 5/10 suất
              </span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-xs text-gray-600">Giảm ngay</p>
                <p className="text-base sm:text-lg font-bold text-red-600">
                  1.000.000đ
                </p>
              </div>
              <div className="w-full sm:w-auto sm:text-right">
                <p className="text-xs text-gray-600 mb-1">Kết thúc sau</p>
                <div className="flex gap-1 text-xs sm:text-sm font-bold">
                  <span className="bg-gray-800 text-white px-2 py-1 rounded">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span>:</span>
                  <span className="bg-gray-800 text-white px-2 py-1 rounded">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span>:</span>
                  <span className="bg-gray-800 text-white px-2 py-1 rounded">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Promotion Details */}
          <div className="border rounded-lg p-3 bg-white">
            <p className="font-semibold text-xs sm:text-sm mb-2">
              Khuyến mãi 1
            </p>
            <ul className="text-xs sm:text-sm text-gray-700 space-y-2">
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
        <div className="bg-pink-100 border border-pink-300 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4">
          <div className="flex gap-3 sm:gap-4">
            <div className="bg-gradient-to-b from-purple-400 to-purple-600 p-2 sm:p-3 rounded text-white text-center min-w-[60px] sm:min-w-[80px] flex-shrink-0">
              <p className="text-xs font-bold">Đặc quyền</p>
              <p className="text-base sm:text-lg font-bold">HSSV</p>
              <p className="text-xs">Giáo viên</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs sm:text-sm mb-1">
                Đặc quyền HSSV - Giáo viên
              </p>
              <p className="text-xs sm:text-sm text-gray-700 mb-2">
                Giảm ngay 200.000đ
              </p>
              <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs sm:text-sm font-semibold transition-colors">
                Xác thực ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Promotions */}
      <div className="flex flex-col border border-gray-300 rounded-lg mb-4">
        <div className="flex justify-between items-center px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-300 bg-gray-100 rounded-t-lg">
          <p className="text-sm sm:text-base font-semibold">
            Khuyến mãi thanh toán
          </p>
          <button className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm transition-colors">
            Xem tất cả
          </button>
        </div>
        <div>
          {/* Payment Logos */}
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-5 gap-4 sm:gap-2 p-3">
            {product.payments?.map((pay, index) => {
              const isActive = activePayment === index;
              return (
                <div
                  key={pay.id}
                  className="relative flex justify-center"
                  onMouseEnter={() => setActivePayment(index)}
                  onClick={() => setActivePayment(index)}
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center
                      rounded-lg border bg-white cursor-pointer transition
                      ${
                        isActive
                          ? "border-gray-500"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <img
                      src={pay.logo}
                      alt={pay.name}
                      className="object-contain max-h-[30px] max-w-[35px] sm:max-h-[35px] sm:max-w-[40px] lg:max-h-[40px] lg:max-w-[50px]"
                    />
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-500" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Payment Description */}
          <div className="px-3 sm:px-4 pt-3 text-xs sm:text-sm text-gray-900">
            <span>{product.payments?.[activePayment]?.description}</span>
          </div>
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
            <span className="text-xs sm:text-sm text-gray-500">
              HSD: 30/4/2025
            </span>
          </div>
        </div>
      </div>

      {/* Gifts & Benefits */}
      <div className="flex flex-col border border-gray-300 rounded-lg mb-4">
        <div className="flex justify-between items-center px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-300 bg-gray-100 rounded-t-lg">
          <p className="text-sm sm:text-base font-semibold">
            Quà tặng và ưu đãi khác
          </p>
        </div>
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm">
          <div className="flex items-start gap-3 my-3">
            <FaGift className="text-red-600 text-base sm:text-lg flex-shrink-0 mt-0.5" />
            <div className="flex flex-col min-w-0">
              <span className="break-words">
                Tặng phiếu mua hàng 50,000đ khi mua sim FPT kèm máy
              </span>
              <Link
                href="#"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <p className="text-gray-500 whitespace-nowrap text-xs sm:text-sm">
              Ưu đãi
            </p>
            <span className="border border-gray-500 w-full"></span>
          </div>
          <div className="flex items-start gap-3 mb-3">
            <FaCog className="text-gray-600 text-base sm:text-lg flex-shrink-0 mt-0.5" />
            <span className="break-words">
              Giảm 5% mua camera cho đơn hàng Điện thoại/ Tablet từ 1 triệu{" "}
              <Link
                href="#"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Xem chi tiết
              </Link>
            </span>
          </div>
          <div className="flex items-start gap-3 mb-3">
            <FaCog className="text-gray-600 text-base sm:text-lg flex-shrink-0 mt-0.5" />
            <span className="break-words">
              Giảm 5% mua camera cho đơn hàng Điện thoại/ Tablet từ 1 triệu{" "}
              <Link
                href="#"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Xem chi tiết
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button className="flex items-center justify-center gap-2 text-red-600 font-bold py-3 rounded-lg transition hover:bg-red-50 border border-red-600 sm:flex-1">
          <FaShoppingCart size={24} className="sm:w-7 sm:h-7" />
        </button>
        <button className="flex-1 sm:flex-[2] bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition text-sm sm:text-base">
          Mua ngay
        </button>
        <button className="flex-1 sm:flex-[2] bg-black text-white hover:bg-gray-700 font-bold py-3 rounded-lg transition text-sm sm:text-base">
          Trả góp 0%
        </button>
      </div>
    </div>
  );
}
