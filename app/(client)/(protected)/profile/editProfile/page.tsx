"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToasty } from "@/components/Toast";
import { Pencil, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import apiRequest from "@/lib/api";
import Image from "next/image";

type UpdateProfile = {
  fullName: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
};

type FormData = {
  fullName: string;
  phone: string;
  gender: string;
  email: string;
  avatarImage: string;
};

type Dob = {
  day: string;
  month: string;
  year: string;
};

interface ApiAddress {
  id: string;
  phone: string;
  isDefault: boolean;
}

export default function ProfileForm() {
  const { user, loading, refreshUser } = useAuth();
  const { success, error } = useToasty();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    gender: "",
    email: "",
    avatarImage: "",
  });

  const [dob, setDob] = useState<Dob>({ day: "", month: "", year: "" });
  const [initialFormData, setInitialFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    gender: "",
    email: "",
    avatarImage: "",
  });
  const [initialDob, setInitialDob] = useState<Dob>({ day: "", month: "", year: "" });
  const [submitting, setSubmitting] = useState(false);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (user) {
      const date = user.dateOfBirth ? new Date(user.dateOfBirth) : null;
      const data: FormData = {
        fullName: user.fullName || "",
        phone: user.phone || "",
        gender: user.gender ? user.gender.toUpperCase() : "",
        email: user.email || "",
        avatarImage: user.avatarImage || "/images/avatar.png",
      };
      const dobData: Dob = date
        ? {
            day: String(date.getDate()),
            month: String(date.getMonth() + 1),
            year: String(date.getFullYear()),
          }
        : { day: "", month: "", year: "" };

      setFormData(data);
      setInitialFormData(data);
      setDob(dobData);
      setInitialDob(dobData);
    }
  }, [user]);

  const isDirty = useMemo(() => {
    return (
      formData.fullName !== initialFormData.fullName ||
      formData.phone !== initialFormData.phone ||
      formData.gender !== initialFormData.gender ||
      dob.day !== initialDob.day ||
      dob.month !== initialDob.month ||
      dob.year !== initialDob.year
    );
  }, [formData, dob, initialFormData, initialDob]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !isDirty) return;
    setSubmitting(true);

    try {
      const updateData: UpdateProfile = { fullName: formData.fullName };

      if (formData.gender) updateData.gender = formData.gender;

      if (dob.day && dob.month && dob.year) {
        const date = new Date(Number(dob.year), Number(dob.month) - 1, Number(dob.day));
        updateData.dateOfBirth = date.toISOString();
      }

      const phoneChanged = formData.phone !== initialFormData.phone;
      if (phoneChanged && formData.phone) {
        updateData.phone = formData.phone;
      }

      // 1. Lưu profile
      await apiRequest.patch("/users/me", updateData);

      // 2. Nếu SĐT thay đổi → sync vào địa chỉ mặc định
      if (phoneChanged && formData.phone) {
        try {
          const res = await apiRequest.get<{ success: boolean; data: ApiAddress[] }>("/addresses");
          const list = res?.data ?? [];
          const defaultAddr = list.find((a) => a.isDefault) ?? list[0];
          if (defaultAddr) {
            await apiRequest.patch(`/addresses/${defaultAddr.id}`, {
              phone: formData.phone,
            });
          }
        } catch { /* silent */ }
      }

      await refreshUser();
      success("Cập nhật thông tin thành công");
      router.push("/profile");

      setInitialFormData(formData);
      setInitialDob(dob);
    } catch (err: any) {
      error(err?.message || "Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4 text-primary">Đang tải...</div>;
  if (!user) return <div className="p-4 text-primary">Bạn chưa đăng nhập</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-4 mt-2">
        Thông tin cá nhân
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="px-4 py-10 rounded-2xl">
          <div className="w-full max-w-md mx-auto">

            {/* Avatar */}
            <div className="relative flex justify-center">
              <div className="relative w-28 h-28 rounded-full bg-neutral-light p-1 shadow-lg">
                <Image
                  src={formData.avatarImage || "/images/avatar.png"}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                  fill
                />
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-accent  text-white rounded-full p-1 shadow-md transition-colors"
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="px-6 py-8 space-y-5">

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-primary">Họ và tên</label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  className="w-full px-3 py-2 rounded-lg text-sm bg-neutral-light border border-neutral text-primary placeholder:text-neutral-dark focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>

              {/* Phone — có thể sửa, sync sang địa chỉ mặc định */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-primary">Số điện thoại</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-3 py-2 rounded-lg text-sm bg-neutral-light border border-neutral text-primary placeholder:text-neutral-dark focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
                <p className="text-xs text-neutral-dark">
                  Thay đổi SĐT sẽ tự động cập nhật vào địa chỉ mặc định
                </p>
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-primary">Giới tính</label>
                <div className="relative">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-10 rounded-lg text-sm appearance-none cursor-pointer bg-neutral-light border border-neutral text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-primary">Ngày sinh</label>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={dob.day}
                    onChange={(e) => setDob((prev) => ({ ...prev, day: e.target.value }))}
                    className="px-3 py-2 rounded-lg text-sm border border-neutral bg-neutral-light text-primary cursor-pointer"
                  >
                    <option value="">Ngày</option>
                    {days.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select
                    value={dob.month}
                    onChange={(e) => setDob((prev) => ({ ...prev, month: e.target.value }))}
                    className="px-3 py-2 rounded-lg text-sm border border-neutral bg-neutral-light text-primary cursor-pointer"
                  >
                    <option value="">Tháng</option>
                    {months.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select
                    value={dob.year}
                    onChange={(e) => setDob((prev) => ({ ...prev, year: e.target.value }))}
                    className="px-3 py-2 rounded-lg text-sm border border-neutral bg-neutral-light text-primary cursor-pointer"
                  >
                    <option value="">Năm</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-primary">
                  Email
                  <span className="ml-1 text-xs opacity-80">(không thể thay đổi)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 rounded-lg text-sm bg-neutral-light-active border border-neutral text-primary cursor-not-allowed opacity-80"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isDirty || submitting}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-neutral-light hover:bg-primary-hover active:bg-primary-active font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Đang cập nhật...</>
                  ) : (
                    <><Pencil size={18} /> Cập nhật thông tin</>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </form>
    </div>
  );
}