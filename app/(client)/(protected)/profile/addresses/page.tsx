"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Popzy } from "@/components/Modal";
import { MapPin, Home, Building2, Plus, Star, ArrowLeft } from "lucide-react";
import apiRequest from "@/lib/api";
import { getProvinces } from "../_lib/get-provice";
import { getWards } from "../_lib/get-wards";

interface Province {
  code: string;
  name: string;
  fullName: string;
}

interface Ward {
  code: string;
  name: string;
  fullName: string;
}

interface Address {
  id: string;
  contactName: string;
  phone: string;
  province: { code: string; name: string; fullName?: string };
  ward: { code: string; name: string; fullName?: string };
  detailAddress: string;
  fullAddress: string;
  type: "HOME" | "OFFICE" | "OTHER";
  isDefault: boolean;
}

const ADDRESS_TYPES = [
  { value: "HOME", label: "Nhà riêng", icon: Home },
  { value: "OFFICE", label: "Văn phòng", icon: Building2 },
  { value: "OTHER", label: "Khác", icon: MapPin },
];

export default function AddressesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [provinceCode, setProvinceCode] = useState("");   // ← code
  const [wardCode, setWardCode] = useState("");           // ← code
  const [detailAddress, setDetailAddress] = useState("");
  const [type, setType] = useState<"HOME" | "OFFICE" | "OTHER">("HOME");
  const [isDefault, setIsDefault] = useState(false);

  // Dropdown data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest.get<{ data: Address[] }>("/addresses");
      setAddresses(res.data ?? []);
    } catch {
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Load provinces từ open-api.vn trực tiếp
  useEffect(() => {
    const load = async () => {
      setIsLoadingProvinces(true);
      try {
        setProvinces(await getProvinces());
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    load();
  }, []);

  // Load wards khi provinceCode thay đổi
  useEffect(() => {
    if (!provinceCode) {
      setWards([]);
      return;
    }
    const load = async () => {
      setIsLoadingWards(true);
      try {
        setWards(await getWards(provinceCode));   // ← dùng code
      } finally {
        setIsLoadingWards(false);
      }
    };
    load();
  }, [provinceCode]);   // ← dependency là provinceCode

  const openAddModal = () => {
    setEditingAddress(null);
    setContactName("");
    setPhone("");
    setProvinceCode("");   // ← reset code
    setWardCode("");       // ← reset code
    setDetailAddress("");
    setType("HOME");
    setIsDefault(false);
    setWards([]);
    setShowModal(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setContactName(addr.contactName);
    setPhone(addr.phone);
    setProvinceCode(addr.province.code);   // ← .code
    setWardCode(addr.ward.code);           // ← .code
    setDetailAddress(addr.detailAddress);
    setType(addr.type);
    setIsDefault(addr.isDefault);
    setShowModal(true);
  };

  const handleProvinceChange = (code: string) => {
    setProvinceCode(code);   // ← dùng code
    setWardCode("");         // ← reset ward code
    setWards([]);
  };

  const handleSubmit = async () => {
    if (!contactName || !phone || !provinceCode || !wardCode || !detailAddress) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        contactName,
        phone,
        provinceCode,   // ← gửi code thay vì id
        wardCode,       // ← gửi code thay vì id
        detailAddress,
        type,
        isDefault,
      };
      if (editingAddress) {
        await apiRequest.put(`/addresses/${editingAddress.id}`, payload);
      } else {
        await apiRequest.post("/addresses", payload);
      }
      setShowModal(false);
      await fetchAddresses();
    } catch (err: any) {
      alert(err?.message ?? "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    try {
      await apiRequest.delete(`/addresses/${id}`);
      await fetchAddresses();
    } catch (err: any) {
      alert(err?.message ?? "Có lỗi xảy ra");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiRequest.patch(`/addresses/${id}/default`);
      await fetchAddresses();
    } catch (err: any) {
      alert(err?.message ?? "Có lỗi xảy ra");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
        <h1 className="text-xl font-semibold">Địa chỉ của tôi</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
        >
          <Plus size={16} />
          Thêm địa chỉ
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MapPin size={40} className="mx-auto mb-3 opacity-30" />
          <p>Chưa có địa chỉ nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const TypeIcon =
              ADDRESS_TYPES.find((t) => t.value === addr.type)?.icon ?? MapPin;
            return (
              <div
                key={addr.id}
                className="border rounded-xl p-4 flex gap-3 items-start"
              >
                <TypeIcon size={20} className="mt-0.5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{addr.contactName}</span>
                    <span className="text-gray-400 text-sm">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Star size={11} fill="currentColor" />
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {addr.fullAddress}
                  </p>
                  <span className="text-xs text-gray-400 mt-1 inline-block">
                    {ADDRESS_TYPES.find((t) => t.value === addr.type)?.label}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-sm shrink-0">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="text-blue-600 hover:underline"
                  >
                    Sửa
                  </button>
                  {!addr.isDefault && (
                    <>
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-amber-600 hover:underline"
                      >
                        Đặt mặc định
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="text-red-500 hover:underline"
                      >
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal thêm/sửa địa chỉ */}
      {showModal && (
        <Popzy onClose={() => setShowModal(false)} title={editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}>
          <div className="space-y-4 p-1">
            <div>
              <label className="block text-sm font-medium mb-1">Họ và tên</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số điện thoại</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tỉnh / Thành phố</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={provinceCode}                          // ← value = code
                onChange={(e) => handleProvinceChange(e.target.value)}
                disabled={isLoadingProvinces}
              >
                <option value="">
                  {isLoadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}
                </option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>   {/* ← key & value = code */}
                    {p.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phường / Xã</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={wardCode}                             // ← value = code
                onChange={(e) => setWardCode(e.target.value)}
                disabled={!provinceCode || isLoadingWards}
              >
                <option value="">
                  {isLoadingWards ? "Đang tải..." : "Chọn phường/xã"}
                </option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>    {/* ← key & value = code */}
                    {w.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ chi tiết</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                placeholder="Số nhà, tên đường..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Loại địa chỉ</label>
              <div className="flex gap-2">
                {ADDRESS_TYPES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                      type === value
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              Đặt làm địa chỉ mặc định
            </label>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-black text-white rounded-lg py-2 text-sm hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </Popzy>
      )}
    </div>
  );
}