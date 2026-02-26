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

interface AddressForm {
  contactName: string;
  phone: string;
  provinceId: string;
  wardId: string;
  detailAddress: string;
  type: "HOME" | "OFFICE" | "OTHER";
  isDefault: boolean;
}

const defaultForm: AddressForm = {
  contactName: "",
  phone: "",
  provinceId: "",
  wardId: "",
  detailAddress: "",
  type: "HOME",
  isDefault: false,
};

export default function AddressPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null = tạo mới
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [errors, setErrors] = useState<Partial<AddressForm>>({});
  const [form, setForm] = useState<AddressForm>(defaultForm);

  /* ============================================================================
   * FETCH
   * ========================================================================== */
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
    if (!form.provinceId) return;
    const fetchWards = async () => {
      const data = await getWards(form.provinceId);
      setWards(data);
    };
    fetchWards();
  }, [form.provinceId]);

  /* ============================================================================
   * HELPERS
   * ========================================================================== */
  const setField = <K extends keyof AddressForm>(
    key: K,
    value: AddressForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<AddressForm> = {};
    if (!form.contactName.trim())
      newErrors.contactName = "Vui lòng nhập họ tên";
    if (!form.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^(0[3-9])\d{8}$/.test(form.phone))
      newErrors.phone = "Số điện thoại không hợp lệ";
    if (!form.provinceId) newErrors.provinceId = "Vui lòng chọn tỉnh/thành phố";
    if (!form.wardId) newErrors.wardId = "Vui lòng chọn phường/xã";
    if (!form.detailAddress.trim())
      newErrors.detailAddress = "Vui lòng nhập địa chỉ cụ thể";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setForm(defaultForm);
    setWards([]);
    setErrors({});
  };

  /* ============================================================================
   * OPEN EDIT MODAL
   * ========================================================================== */
  const handleOpenEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      contactName: addr.contactName,
      phone: addr.phone,
      provinceId: addr.province.id,
      wardId: addr.ward.id,
      detailAddress: addr.detailAddress,
      type: addr.type,
      isDefault: addr.isDefault,
    });
    setIsOpen(true);
  };

  /* ============================================================================
   * CREATE
   * ========================================================================== */
  const handleCreate = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await apiRequest.post<{ success: boolean; data: Address }>(
        "/addresses",
        form,
      );
      if (res?.success) {
        setAddresses((prev) => {
          const updated = res.data.isDefault
            ? prev.map((a) => ({ ...a, isDefault: false })) // bỏ mặc định cũ
            : prev;
          return [...updated, res.data];
        });
        handleClose();
      }
    } catch (error) {
      console.error("Lỗi khi tạo địa chỉ:", error);
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================================================================
   * UPDATE
   * ========================================================================== */
  const handleUpdate = async () => {
    if (!validate() || !editingId) return;
    setSubmitting(true);
    try {
      const res = await apiRequest.patch<{ success: boolean; data: Address }>(
        `/addresses/${editingId}`,
        form,
      );
      if (res?.success) {
        setAddresses((prev) =>
          prev.map((a) => {
            if (a.id === editingId) return res.data;
            if (res.data.isDefault) return { ...a, isDefault: false }; // bỏ mặc định cũ
            return a;
          }),
        );
        handleClose();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => (editingId ? handleUpdate() : handleCreate());

  /* ============================================================================
   * DELETE
   * ========================================================================== */
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    setDeletingId(id);
    try {
      const res = await apiRequest.delete<{ success: boolean }>(
        `/addresses/${id}`,
      );
      if (res?.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error("Lỗi khi xóa địa chỉ:", error);
    } finally {
      setDeletingId(null);
    }
  };

  /* ============================================================================
   * UI HELPERS
   * ========================================================================== */
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
                      <p className="text-sm text-gray-500">
                        {addr.fullAddress}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {icon}
                        {label}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 text-base shrink-0">
                      <button
                        onClick={() => handleOpenEdit(addr)}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        Sửa
                      </button>
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleDelete(addr.id)}
                          disabled={deletingId === addr.id}
                          className="text-red-500 hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === addr.id ? "Đang xóa..." : "Xóa"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal thêm / sửa địa chỉ */}
        <Popzy
          isOpen={isOpen}
          scrollLockTarget={() => document.documentElement}
          onClose={handleClose}
          closeMethods={["escape"]}
          footer={true}
          cssClass="max-w-[800px] w-full"
          content={
            <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scroll">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-200">
                {editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
              </h2>
              <div className="divide-y divide-gray-200">
                {/* Họ tên */}
                <div className="py-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Thông tin người nhận
                  </label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => setField("contactName", e.target.value)}
                    placeholder="Nhập họ và tên người nhận"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 placeholder:text-gray-400"
                  />
                  {errors.contactName && (
                    <p className="text-xs text-red-500">{errors.contactName}</p>
                  )}
                </div>

                {/* SĐT */}
                <div className="py-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 placeholder:text-gray-400"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Tỉnh/Thành phố */}
                <div className="py-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tỉnh/Thành phố
                  </label>
                  <select
                    value={form.provinceId}
                    onChange={(e) => {
                      setField("provinceId", e.target.value);
                      setField("wardId", "");
                      setWards([]);
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName}
                      </option>
                    ))}
                  </select>
                  {errors.provinceId && (
                    <p className="text-xs text-red-500">{errors.provinceId}</p>
                  )}
                </div>

                {/* Phường/Xã */}
                <div className="py-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phường/Xã
                  </label>
                  <select
                    value={form.wardId}
                    onChange={(e) => setField("wardId", e.target.value)}
                    disabled={!form.provinceId}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.fullName}
                      </option>
                    ))}
                  </select>
                  {errors.wardId && (
                    <p className="text-xs text-red-500">{errors.wardId}</p>
                  )}
                </div>

                {/* Địa chỉ cụ thể */}
                <div className="py-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Địa chỉ cụ thể
                  </label>
                  <input
                    type="text"
                    value={form.detailAddress}
                    onChange={(e) => setField("detailAddress", e.target.value)}
                    placeholder="Nhập địa chỉ cụ thể"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 placeholder:text-gray-400"
                  />
                  {errors.detailAddress && (
                    <p className="text-xs text-red-500">
                      {errors.detailAddress}
                    </p>
                  )}
                </div>

                {/* Loại địa chỉ */}
                <div className="py-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Loại địa chỉ
                  </label>
                  <div className="flex gap-3">
                    {(["HOME", "OFFICE", "OTHER"] as const).map((t) => {
                      const { label, icon } = typeLabel(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setField("type", t)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                            form.type === t
                              ? "border-red-500 text-red-600 bg-red-50"
                              : "border-gray-300 text-gray-600 hover:border-gray-400"
                          }`}
                        >
                          {icon}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mặc định */}
                <div className="py-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(e) => setField("isDefault", e.target.checked)}
                      className="w-4 h-4 accent-red-600"
                    />
                    <span className="text-sm text-gray-700">
                      Đặt làm địa chỉ mặc định
                    </span>
                  </label>
                </div>
              </div>
            </div>
          }
          footerButtons={[
            {
              title: "Hủy",
              onClick: handleClose,
              className:
                "px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer",
            },
            {
              title: submitting
                ? "Đang lưu..."
                : editingId
                  ? "Cập nhật"
                  : "Lưu địa chỉ",
              onClick: handleSubmit,
              className:
                "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer disabled:opacity-50",
            },
          ]}
        />
      </div>
    </>
  );
}
