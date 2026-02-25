"use client";

import { useState, useEffect } from "react";
import { Popzy } from "@/components/Modal";
import { MapPin, Home, Building2, Plus, Star } from "lucide-react";
import apiRequest from "@/lib/api";
import { getProvinces } from "../_lib/get-provice";
import { getWards } from "../_lib/get-wards";

interface Province {
  id: string;
  name: string;
  fullName: string;
}

interface Ward {
  id: string;
  name: string;
  fullName: string;
}

interface Address {
  id: string;
  contactName: string;
  phone: string;
  province: Province;
  ward: Ward;
  detailAddress: string;
  fullAddress: string;
  type: "HOME" | "OFFICE" | "OTHER";
  isDefault: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Address[];
  total: number;
  message: string;
}

export default function NotificationsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState<Province[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await apiRequest.get<ApiResponse>("/addresses");
        setAddresses(res?.data || []);
        const provinceData = await getProvinces();
        setProvinces(provinceData);
      } catch (error) {
        console.error("Lỗi khi lấy địa chỉ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!selectedProvince) return;

    const fetchWards = async () => {
      const data = await getWards(selectedProvince);
      setWards(data);
    };

    fetchWards();
  }, [selectedProvince]);

  const typeLabel = (type: string) => {
    if (type === "HOME")
      return { label: "Nhà riêng", icon: <Home size={14} /> };
    if (type === "OFFICE")
      return { label: "Văn phòng", icon: <Building2 size={14} /> };
    return { label: "Khác", icon: <MapPin size={14} /> };
  };

  if (loading) return <div className="p-4">Đang tải...</div>;

  return (
    <>
      <div>
        <div className="flex items-center justify-between mt-2 mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Sổ địa chỉ nhận hàng
          </h1>
          {addresses.length > 0 && (
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-base font-semibold transition-colors shadow-md cursor-pointer"
            >
              <Plus size={24} />
              Thêm địa chỉ
            </button>
          )}
        </div>

        {addresses.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <div className="mb-2">
              <img
                src="https://cdn2.fptshop.com.vn/unsafe/750x0/filters:format(webp):quality(75)/estore-v2/img/empty_address_book.png"
                alt="Không có địa chỉ"
                className="object-contain w-60 h-60 mx-auto"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Bạn chưa có lưu địa chỉ nào
            </h3>
            <p className="text-gray-600 mb-6 text-center text-sm">
              Cập nhật địa chỉ ngay để có trải nghiệm mua hàng nhanh nhất!
            </p>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              Cập nhật ngay
            </button>
          </div>
        ) : (
          /* ── Address list ── */
          <div className="space-y-3">
            {addresses.map((addr) => {
              const { label, icon } = typeLabel(addr.type);
              return (
                <div
                  key={addr.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-3">
                      {/* Tên + SĐT */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800">
                          {addr.contactName}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-600 text-sm">
                          {addr.phone}
                        </span>
                        {addr.isDefault && (
                          <span className="flex items-center gap-1 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">
                            <Star
                              size={11}
                              className="fill-yellow-500 text-yellow-500"
                            />
                            Mặc định
                          </span>
                        )}
                      </div>

                      {/* Địa chỉ */}
                      <p className="text-sm text-gray-500">
                        {addr.fullAddress}
                      </p>

                      {/* Loại địa chỉ */}
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {icon}
                        {label}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex  gap-4 text-base shrink-0">
                      <button className="text-blue-600 hover:underline cursor-pointer">
                        Sửa
                      </button>
                      {!addr.isDefault && (
                        <button className="text-red-500 hover:underline cursor-pointer">
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal thêm địa chỉ */}
        <Popzy
          isOpen={isOpen}
          scrollLockTarget={() => document.documentElement}
          onClose={() => setIsOpen(false)}
          closeMethods={["escape"]}
          footer={true}
          cssClass="max-w-[800px] w-full"
          content={
            <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scroll">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-200">
                Cập nhật địa chỉ
              </h2>
              <div className="divide-y divide-gray-200">
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 placeholder:text-gray-400"
                  />
                </div>
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 placeholder:text-gray-400"
                  />
                </div>
                <div className="py-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tỉnh/Thành phố
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setWards([]); // reset phường khi đổi tỉnh
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>

                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="py-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phường/Xã
                  </label>
                  <select
                    disabled={!selectedProvince}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none"
                  >
                    <option value="">Chọn Phường/Xã</option>

                    {wards.map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="py-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Địa chỉ cụ thể
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập địa chỉ cụ thể"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          }
          footerButtons={[
            {
              title: "Hủy",
              onClick: () => setIsOpen(false),
              className:
                "px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer",
            },
            {
              title: "Lưu địa chỉ",
              onClick: () => {
                console.log("Lưu địa chỉ");
                setIsOpen(false);
              },
              className:
                "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer",
            },
          ]}
        />
      </div>
    </>
  );
}
