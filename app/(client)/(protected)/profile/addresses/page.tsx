"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Popzy } from "@/components/Modal";
import { MapPin, Home, Building2, Plus, Star, ArrowLeft } from "lucide-react";
import apiRequest from "@/lib/api";
import { getProvinces } from "../_lib/get-provice";
import { getWards } from "../_lib/get-wards";
import { useAuth } from "@/hooks/useAuth";
import AddressSkeleton from "./_components/AddressSkeleton";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});
  const [form, setForm] = useState<AddressForm>(defaultForm);
  const [editingOriginalPhone, setEditingOriginalPhone] = useState("");
  const [editingIsDefault, setEditingIsDefault] = useState(false);

  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

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
    if (!loading && redirectTo === "checkout" && addresses.length === 0) setIsOpen(true);
  }, [loading, redirectTo, addresses.length]);

  useEffect(() => {
    if (!form.provinceId) return;
    const fetchWards = async () => {
      const data = await getWards(form.provinceId);
      setWards(data);
    };
    fetchWards();
  }, [form.provinceId]);

  const setField = <K extends keyof AddressForm>(key: K, value: AddressForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AddressForm, string>> = {};
    if (!form.contactName.trim()) newErrors.contactName = "Vui lòng nhập họ tên";
    if (!form.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(\+84|0)[0-9]{9,10}$/.test(form.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    } else {
      const isDuplicate = addresses.some((a) => {
        if (editingId && a.id === editingId) return false;
        return a.phone === form.phone;
      });
      if (isDuplicate) newErrors.phone = "Số điện thoại này đã được sử dụng ở địa chỉ khác.";
    }
    if (!form.provinceId) newErrors.provinceId = "Vui lòng chọn tỉnh/thành phố";
    if (!form.wardId) newErrors.wardId = "Vui lòng chọn phường/xã";
    if (!form.detailAddress.trim()) {
      newErrors.detailAddress = "Vui lòng nhập địa chỉ cụ thể";
    } else if (form.detailAddress.trim().length < 5) {
      newErrors.detailAddress = "Địa chỉ cụ thể quá ngắn";
    } else if (form.detailAddress.trim().length > 200) {
      newErrors.detailAddress = "Địa chỉ cụ thể không được vượt quá 200 ký tự";
    } else {
      const isDuplicateAddress = addresses.some((a) => {
        if (editingId && a.id === editingId) return false;
        return a.province.id === form.provinceId && a.ward.id === form.wardId && a.detailAddress.trim().toLowerCase() === form.detailAddress.trim().toLowerCase();
      });
      if (isDuplicateAddress) newErrors.detailAddress = "Địa chỉ này đã tồn tại trong sổ địa chỉ.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setForm(defaultForm);
    setWards([]);
    setErrors({});
    setEditingOriginalPhone("");
    setEditingIsDefault(false);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingId(addr.id);
    setEditingOriginalPhone(addr.phone);
    setEditingIsDefault(addr.isDefault);
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

  const syncPhoneToProfile = async (newPhone: string) => {
    if (!newPhone || newPhone === user?.phone) return;
    try {
      await apiRequest.patch("/users/me", {
        fullName: user?.fullName ?? "",
        phone: newPhone,
      });
      await refreshUser?.();
    } catch {
      /* silent */
    }
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id);
    try {
      const res = await apiRequest.patch<{ success: boolean; data: Address }>(`/addresses/${id}`, { isDefault: true });
      if (res?.success) {
        setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
        await syncPhoneToProfile(addresses.find((a) => a.id === id)?.phone ?? "");
        if (redirectTo === "checkout") {
          router.push("/checkout");
          return;
        }
      }
    } catch (error: any) {
      console.error("Lỗi khi đặt địa chỉ mặc định:", error?.message);
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleApiError = (error: any) => {
    const message: string = error?.message ?? "";
    if (message.toLowerCase().includes("duplicate")) {
      setErrors((prev) => ({
        ...prev,
        phone: "Số điện thoại này đã được sử dụng ở địa chỉ khác.",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        detailAddress: message || "Có lỗi xảy ra, vui lòng thử lại.",
      }));
    }
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await apiRequest.post<{
        success: boolean;
        data: Address;
        message?: string;
        code?: string;
      }>("/addresses", form);
      if (!res?.success) {
        const message = res?.message ?? "";
        if (message.toLowerCase().includes("duplicate") || res?.code === "DUPLICATE") {
          setErrors((prev) => ({
            ...prev,
            phone: "Số điện thoại này đã được dùng. Vui lòng dùng SĐT khác.",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            detailAddress: message || "Có lỗi xảy ra, vui lòng thử lại.",
          }));
        }
        return;
      }
      const isFirstAddress = addresses.length === 0;
      if (form.isDefault || isFirstAddress) await syncPhoneToProfile(form.phone);
      handleClose();
      if (redirectTo === "checkout") {
        try {
          const raw = localStorage.getItem("checkoutData");
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.newAddressId = res.data.id;
            localStorage.setItem("checkoutData", JSON.stringify(parsed));
          }
        } catch {
          /* silent */
        }
        router.push("/checkout?newAddress=1");
      } else {
        setAddresses((prev) => {
          const updated = res.data.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
          return [...updated, res.data];
        });
      }
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!validate() || !editingId) return;
    setSubmitting(true);
    try {
      const res = await apiRequest.patch<{ success: boolean; data: Address }>(`/addresses/${editingId}`, form);
      if (res?.success) {
        const phoneChanged = form.phone !== editingOriginalPhone;
        if (editingIsDefault && phoneChanged) await syncPhoneToProfile(form.phone);
        setAddresses((prev) =>
          prev.map((a) => {
            if (a.id === editingId) return res.data;
            if (res.data.isDefault) return { ...a, isDefault: false };
            return a;
          }),
        );
        handleClose();
        if (redirectTo === "checkout") router.push("/checkout");
      }
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => (editingId ? handleUpdate() : handleCreate());

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    setConfirmDeleteId(null);
    try {
      const res = await apiRequest.delete<{ success: boolean }>(`/addresses/${confirmDeleteId}`);
      if (res?.success) setAddresses((prev) => prev.filter((a) => a.id !== confirmDeleteId));
    } catch (error) {
      console.error("Lỗi khi xóa địa chỉ:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const typeLabel = (type: string) => {
    if (type === "HOME") return { label: "Nhà riêng", icon: <Home size={14} /> };
    if (type === "OFFICE") return { label: "Văn phòng", icon: <Building2 size={14} /> };
    return { label: "Khác", icon: <MapPin size={14} /> };
  };

  const inputClass =
    "w-full rounded-lg border border-neutral bg-neutral-light px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-primary outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent-light placeholder:text-primary-dark";

  if (loading) return <AddressSkeleton />;

  return (
    <>
      <div>
        {/* ── Header ── */}
        <div className="mt-1 sm:mt-2 mb-4 sm:mb-5 space-y-2 sm:space-y-0">
          {/* Back button (checkout redirect) */}
          {redirectTo === "checkout" && (
            <button onClick={() => router.push("/checkout")} className="flex items-center gap-1 text-sm text-primary-dark hover:text-primary transition-colors cursor-pointer mb-1">
              <ArrowLeft size={15} />
              Quay lại thanh toán
            </button>
          )}

          {/* Title row */}
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-base sm:text-xl font-bold text-primary">Sổ địa chỉ nhận hàng</h1>
            {addresses.length > 0 && (
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1 bg-accent hover:bg-accent-hover text-white
                  px-3 sm:px-4 py-1.5 sm:py-2 rounded-full
                  text-xs sm:text-sm font-semibold transition-colors shadow-md cursor-pointer shrink-0"
              >
                <Plus size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">Thêm địa chỉ</span>
                <span className="xs:hidden">Thêm</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Empty state ── */}
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-10 px-4">
            <img
              src="https://cdn2.fptshop.com.vn/unsafe/750x0/filters:format(webp):quality(75)/estore-v2/img/empty_address_book.png"
              alt="Không có địa chỉ"
              className="object-contain w-40 h-40 sm:w-60 sm:h-60 mx-auto mb-2"
            />
            <h3 className="text-base sm:text-lg font-semibold text-primary mb-1 sm:mb-2">Bạn chưa có lưu địa chỉ nào</h3>
            <p className="text-primary-dark mb-5 text-center text-xs sm:text-sm max-w-xs">Cập nhật địa chỉ ngay để có trải nghiệm mua hàng nhanh nhất!</p>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-accent hover:bg-accent-hover text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-colors shadow-md hover:shadow-lg cursor-pointer text-sm sm:text-base"
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
                <div key={addr.id} className="bg-neutral-light border border-neutral rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Top: name + phone + default badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="font-semibold text-primary text-sm sm:text-base truncate">{addr.contactName}</span>
                      <span className="text-neutral-dark hidden xs:inline">|</span>
                      <span className="text-primary-dark text-xs sm:text-sm">{addr.phone}</span>
                      {addr.isDefault && (
                        <span className="flex items-center gap-1 text-xs text-accent border border-accent/30 bg-accent/5 px-2 py-0.5 rounded-full font-medium shrink-0">
                          <Star size={11} className="fill-accent text-accent" />
                          Mặc định
                        </span>
                      )}
                    </div>

                    {/* Edit / Delete — top-right on all sizes */}
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(addr)}
                        className="text-xs font-medium text-accent border border-accent/30 bg-accent/5 hover:bg-accent/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors cursor-pointer"
                      >
                        Sửa
                      </button>
                      {!addr.isDefault && (
                        <button
                          onClick={() => setConfirmDeleteId(addr.id)}
                          disabled={deletingId === addr.id}
                          className="text-xs font-medium text-promotion border border-promotion/30 bg-promotion/5 hover:bg-promotion/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === addr.id ? "Xóa..." : "Xóa"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Full address */}
                  <p className="text-xs sm:text-sm text-primary-dark mb-2 sm:mb-3 leading-relaxed">{addr.fullAddress}</p>

                  {/* Type tag + set default button */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs text-primary-dark bg-neutral-light-active px-2 py-0.5 rounded-full">
                      {icon}
                      {label}
                    </span>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        disabled={settingDefaultId === addr.id}
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent border border-accent/30 bg-accent/5 hover:bg-accent/10 px-2.5 py-0.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Star size={10} className="text-accent" />
                        {settingDefaultId === addr.id ? "Đang đặt..." : "Đặt mặc định"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Confirm delete modal ── */}
        <Popzy
          isOpen={!!confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          closeMethods={["overlay", "escape"]}
          cssClass="!max-w-sm !mx-4"
          content={
            <div className="flex flex-col items-center text-center gap-3 pt-2 px-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-promotion-light flex items-center justify-center">
                <MapPin size={20} className="text-promotion" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-primary">Xóa địa chỉ này?</h3>
              <p className="text-xs sm:text-sm text-primary-dark leading-relaxed">
                Địa chỉ <span className="font-medium text-primary">{addresses.find((a) => a.id === confirmDeleteId)?.fullAddress}</span> sẽ bị xóa vĩnh viễn.
              </p>
              <div className="flex gap-2 sm:gap-3 w-full mt-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-neutral bg-neutral-light hover:bg-neutral text-primary text-sm font-medium transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-promotion hover:bg-promotion-hover text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  Xóa
                </button>
              </div>
            </div>
          }
        />

        {/* ── Add / Edit modal ── */}
        <Popzy
          isOpen={isOpen}
          scrollLockTarget={() => document.documentElement}
          onClose={handleClose}
          closeMethods={["escape", "overlay", "button"]}
          footer={true}
          cssClass="max-w-[600px] w-full mx-3 sm:mx-auto"
          content={
            <div className="overflow-y-auto scrollbar-thin px-1 sm:pl-2 mt-4 sm:mt-6">
              <h2 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4 border-b pb-2 border-neutral">{editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h2>
              <div className="divide-y divide-neutral">
                {/* Contact name */}
                <div className="py-3 sm:py-4 space-y-1.5 sm:space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-primary">Thông tin người nhận</label>
                  <input type="text" value={form.contactName} onChange={(e) => setField("contactName", e.target.value)} placeholder="Nhập họ và tên người nhận" className={inputClass} />
                  {errors.contactName && <p className="text-xs text-promotion">{errors.contactName}</p>}
                </div>

                {/* Phone */}
                <div className="py-3 sm:py-4 space-y-1.5 sm:space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-primary">Số điện thoại</label>
                  <input type="text" inputMode="numeric" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="Nhập số điện thoại" className={inputClass} />
                  {errors.phone && <p className="text-xs text-promotion">{errors.phone}</p>}
                </div>

                {/* Province */}
                <div className="py-3 sm:py-4 space-y-1.5 sm:space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-primary">Tỉnh/Thành phố</label>
                  <select
                    value={form.provinceId}
                    onChange={(e) => {
                      setField("provinceId", e.target.value);
                      setField("wardId", "");
                      setWards([]);
                    }}
                    className={inputClass}
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName}
                      </option>
                    ))}
                  </select>
                  {errors.provinceId && <p className="text-xs text-promotion">{errors.provinceId}</p>}
                </div>

                {/* Ward */}
                <div className="py-3 sm:py-4 space-y-1.5 sm:space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-primary">Phường/Xã</label>
                  <select
                    value={form.wardId}
                    onChange={(e) => setField("wardId", e.target.value)}
                    disabled={!form.provinceId}
                    className={`${inputClass} disabled:bg-neutral-light-active disabled:text-primary-dark disabled:cursor-not-allowed`}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.fullName}
                      </option>
                    ))}
                  </select>
                  {errors.wardId && <p className="text-xs text-promotion">{errors.wardId}</p>}
                </div>

                {/* Detail address */}
                <div className="py-3 sm:py-4 space-y-1.5 sm:space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-primary">Địa chỉ cụ thể</label>
                  <input type="text" value={form.detailAddress} onChange={(e) => setField("detailAddress", e.target.value)} placeholder="Số nhà, tên đường..." className={inputClass} />
                  {errors.detailAddress && <p className="text-xs text-promotion">{errors.detailAddress}</p>}
                </div>

                {/* Address type */}
                <div className="py-3 sm:py-4 space-y-1.5 sm:space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-primary">Loại địa chỉ</label>
                  <div className="flex gap-2 flex-wrap">
                    {(["HOME", "OFFICE", "OTHER"] as const).map((t) => {
                      const { label, icon } = typeLabel(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setField("type", t)}
                          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm transition-colors cursor-pointer ${
                            form.type === t ? "border-accent text-accent bg-accent-light" : "border-neutral text-primary-dark hover:border-neutral-dark"
                          }`}
                        >
                          {icon}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Default checkbox */}
                <div className="py-3 sm:py-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={form.isDefault} onChange={(e) => setField("isDefault", e.target.checked)} className="w-4 h-4 accent-accent" />
                    <span className="text-xs sm:text-sm text-primary">Đặt làm địa chỉ mặc định</span>
                  </label>
                </div>
              </div>
            </div>
          }
          footerButtons={[
            {
              title: "Hủy",
              onClick: handleClose,
              className: "px-3 sm:px-4 py-2 bg-neutral-light-active hover:bg-neutral text-primary text-sm rounded-lg cursor-pointer transition-colors",
            },
            {
              title: submitting ? "Đang lưu..." : editingId ? "Cập nhật" : "Lưu địa chỉ",
              onClick: handleSubmit,
              className: "px-3 sm:px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm rounded-lg cursor-pointer transition-colors disabled:opacity-50",
            },
          ]}
        />
      </div>
    </>
  );
}
