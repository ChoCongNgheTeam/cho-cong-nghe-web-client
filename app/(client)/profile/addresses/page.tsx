"use client";
import type { Metadata } from "next";
import Link from "next/link";

import { useState } from "react";
import { Popzy } from "@/components/Modal";

export default function NotificationsPage() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div>
        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-800  text-left mt-2">
          Sổ địa chỉ nhận hàng
        </h1>
        <div className="flex flex-col items-center justify-center py-10 px-4">
          {/* Empty Box Image */}
          <div className=" mb-2">
            <img
              src="https://cdn2.fptshop.com.vn/unsafe/750x0/filters:format(webp):quality(75)/estore-v2/img/empty_address_book.png"
              alt="Không có đơn hàng"
              className="object-contain w-60 h-60 mx-auto"
            />
          </div>

          {/* Text */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Bạn chưa có lưu địa chỉ nào
          </h3>
          <p className="text-gray-600 mb-6 text-center text-sm">
            Cập nhật địa chỉ ngay để có trải nghiệm mua hàng nhanh nhất!
          </p>

          {/* CTA Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            Cập nhật ngay
          </button>
        </div>
        {/* Popzy Modal */}
        <Popzy
          isOpen={isOpen}
        scrollLockTarget = {() => document.documentElement}
          onClose={() => setIsOpen(false)}
          closeMethods={['escape']}
          footer={true}
          cssClass="max-w-[800px] w-full"
          content={
            <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scroll">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-200">
                Cập nhật địa chỉ
              </h2>
              <div className="divide-y divide-gray-200">
                {/* Họ tên */}
                <div className="py-4 space-y-2">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Thông tin người nhận
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    placeholder="Nhập họ và tên người nhận"
                    className="
                                w-full
                                rounded-lg
                                border border-gray-300
                                px-4 py-3
                                text-sm
                                outline-none
                                transition-all duration-200
                                focus:border-red-500
                                focus:ring-2 focus:ring-red-100
                                placeholder:text-gray-400
                              "
                  />
                </div>

                {/* Số điện thoại */}
                <div className="py-4 space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Số điện thoại
                  </label>

                  <input
                    id="phone"
                    type="text"
                    placeholder="Nhập số điện thoại"
                    className="
                                w-full
                                rounded-lg
                                border border-gray-300
                                px-4 py-3
                                text-sm
                                outline-none
                                transition-all duration-200
                                focus:border-red-500
                                focus:ring-2 focus:ring-red-100
                                placeholder:text-gray-400
                              "
                  />
                </div>
                <div className="divide-y divide-gray-200">
                  {/* Tỉnh/Thành phố */}
                  <div className="py-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tỉnh/Thành phố
                    </label>
                    <select
                      className="
                                  w-full
                                  rounded-lg
                                  border border-gray-300  
                                  bg-white
                                  px-4 py-3
                                  text-sm
                                  outline-none
                                  transition-all duration-200
                                  focus:border-red-500
                                  focus:ring-2 focus:ring-red-100
                                "
                    >
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      <option value="hcm">TP. Hồ Chí Minh</option>
                      <option value="hn">Hà Nội</option>
                    </select>
                  </div>

                  {/* Quận/Huyện */}
                  <div className="py-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Quận/Huyện
                    </label>
                    <select
                      disabled
                      className="
                                  w-full
                                  rounded-lg
                                  border border-gray-300
                                  bg-gray-100
                                  px-4 py-3
                                  text-sm
                                  outline-none
                                  text-gray-500
      "
                    >
                      <option>Chọn Quận/Huyện</option>
                    </select>
                  </div>

                  {/* Phường/Xã */}
                  <div className="py-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phường/Xã
                    </label>
                    <select
                      disabled
                      className="
        w-full
        rounded-lg
        border border-gray-300
        bg-gray-100
        px-4 py-3
        text-sm
        outline-none
        text-gray-500
      "
                    >
                      <option>Chọn Phường/Xã</option>
                    </select>
                  </div>

                  {/* Địa chỉ cụ thể */}
                  <div className="py-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Địa chỉ cụ thể
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập địa chỉ cụ thể"
                      className="
        w-full
        rounded-lg
        border border-gray-300
        px-4 py-3
        text-sm
        outline-none
        transition-all duration-200
        focus:border-red-500
        focus:ring-2 focus:ring-red-100
        placeholder:text-gray-400
      "
                    />
                  </div>
                </div>
              </div>
            </div>
          }
          footerButtons={[
            {
              title: "Hủy",
              onClick: () => setIsOpen(false),
              className: "px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300",
            },
            {
              title: "Lưu địa chỉ",
              onClick: () => {
                console.log("Lưu địa chỉ");
                setIsOpen(false);
              },
              className:
                "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700",
            },
          ]}
        />
      </div>
    </>
  );
}
