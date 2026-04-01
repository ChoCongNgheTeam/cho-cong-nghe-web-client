"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToasty } from "@/components/Toast";
import { Pencil, ChevronDown, Loader2, X } from "lucide-react";
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

type Dob = { day: string; month: string; year: string };

interface ApiAddress {
  id: string;
  phone: string;
  isDefault: boolean;
}

const selectClass =
  "w-full px-3 py-2 rounded-lg text-sm bg-neutral-light border border-neutral text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors cursor-pointer";

const inputClass =
  "w-full px-3 py-2 rounded-lg text-sm bg-neutral-light border border-neutral text-primary placeholder:text-neutral-dark focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors";

export default function ProfileForm() {
  const { user, loading, refreshUser } = useAuth();
  const { success, error } = useToasty();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (!user) return;
    const date = user.dateOfBirth ? new Date(user.dateOfBirth) : null;
    const data: FormData = {
      fullName: user.fullName || "",
      phone: user.phone || "",
      gender: user.gender ? user.gender.toUpperCase() : "",
      email: user.email || "",
      avatarImage: user.avatarImage || "",
    };
    const dobData: Dob = date ? { day: String(date.getDate()), month: String(date.getMonth() + 1), year: String(date.getFullYear()) } : { day: "", month: "", year: "" };

    setFormData(data);
    setInitialFormData(data);
    setDob(dobData);
    setInitialDob(dobData);
  }, [user]);

  // Cleanup preview URL khi unmount hoặc đổi file
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const isDirty = useMemo(
    () =>
      formData.fullName !== initialFormData.fullName ||
      formData.phone !== initialFormData.phone ||
      formData.gender !== initialFormData.gender ||
      dob.day !== initialDob.day ||
      dob.month !== initialDob.month ||
      dob.year !== initialDob.year ||
      avatarFile !== null ||
      removeAvatar,
    [formData, dob, initialFormData, initialDob, avatarFile, removeAvatar],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Khi user chọn file ảnh
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Cleanup preview cũ
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);

    // Reset input để có thể chọn lại cùng file
    e.target.value = "";
  };

  // Xóa ảnh đã chọn (chưa upload) hoặc ảnh hiện tại
  const handleRemoveAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);

    // Nếu đang có ảnh thật trên server → đánh dấu removeAvatar
    if (formData.avatarImage) {
      setRemoveAvatar(true);
    }
  };

  // Ảnh hiển thị: preview local → ảnh server → placeholder
  const displayAvatar = avatarPreview || (!removeAvatar && formData.avatarImage) || "/images/avatar.png";
  const hasAvatar = !!(avatarPreview || (!removeAvatar && formData.avatarImage));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !isDirty) return;
    setSubmitting(true);

    try {
      // Luôn dùng FormData để route hỗ trợ cả file lẫn JSON
      const fd = new FormData();

      fd.append("fullName", formData.fullName);
      if (formData.gender) fd.append("gender", formData.gender);
      if (dob.day && dob.month && dob.year) {
        const date = new Date(Number(dob.year), Number(dob.month) - 1, Number(dob.day));
        fd.append("dateOfBirth", date.toISOString());
      }

      const phoneChanged = formData.phone !== initialFormData.phone;
      if (phoneChanged && formData.phone) fd.append("phone", formData.phone);

      // Avatar: gửi file mới hoặc flag xóa
      if (avatarFile) {
        fd.append("avatarImage", avatarFile);
      } else if (removeAvatar) {
        fd.append("removeAvatar", "true");
      }

      await apiRequest.patch("/users/me", fd);

      // Cập nhật SĐT vào địa chỉ mặc định
      if (phoneChanged && formData.phone) {
        try {
          const res = await apiRequest.get<{ success: boolean; data: ApiAddress[] }>("/addresses");
          const list = res?.data ?? [];
          const defaultAddr = list.find((a) => a.isDefault) ?? list[0];
          if (defaultAddr) await apiRequest.patch(`/addresses/${defaultAddr.id}`, { phone: formData.phone });
        } catch {
          /* silent */
        }
      }

      await refreshUser();
      success("Cập nhật thông tin thành công");

      // Reset avatar state sau khi lưu thành công
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(null);
      setAvatarPreview(null);
      setRemoveAvatar(false);

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
      <h1 className="text-base sm:text-xl md:text-2xl font-semibold text-primary mb-3 sm:mb-4 mt-1 sm:mt-2">Thông tin cá nhân</h1>

      <form onSubmit={handleSubmit}>
        <div className="px-0 sm:px-4 py-5 sm:py-8 rounded-2xl">
          <div className="w-full max-w-md mx-auto">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-1 gap-2">
              <div className="relative">
                {/* Decorative ring */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-accent/30 to-primary/20 blur-sm" />
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-neutral-light p-1 shadow-lg ring-2 ring-neutral">
                  <Image src={displayAvatar} alt="Avatar" className="rounded-full object-cover" fill />

                  {/* Nút chọn ảnh */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-accent text-white rounded-full p-1 sm:p-1.5 shadow-md transition-colors hover:bg-accent-hover"
                    title="Thay ảnh đại diện"
                  >
                    <Pencil size={12} className="sm:w-3.5 sm:h-3.5" />
                  </button>

                  {/* Nút xóa ảnh — chỉ hiện khi có ảnh */}
                  {hasAvatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 sm:p-1 shadow-md transition-colors hover:bg-red-600"
                      title="Xóa ảnh đại diện"
                    >
                      <X size={10} className="sm:w-3 sm:h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* File name hint khi đã chọn ảnh */}
              {avatarFile && <p className="text-xs text-neutral-dark truncate max-w-[180px]">{avatarFile.name}</p>}
              {removeAvatar && !avatarFile && <p className="text-xs text-red-500">Ảnh sẽ bị xóa khi lưu</p>}
            </div>

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

            {/* Fields */}
            <div className="px-2 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-primary">Họ và tên</label>
                <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nhập họ và tên" className={inputClass} />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-primary">Số điện thoại</label>
                <input name="phone" type="tel" inputMode="numeric" value={formData.phone} onChange={handleChange} placeholder="Nhập số điện thoại" className={inputClass} />
                <p className="text-xs text-neutral-dark leading-relaxed">Thay đổi SĐT sẽ tự động cập nhật vào địa chỉ mặc định</p>
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-primary">Giới tính</label>
                <div className="relative">
                  <select name="gender" value={formData.gender} onChange={handleChange} className={`${selectClass} appearance-none pr-10`}>
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark" />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-primary">Ngày sinh</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="relative">
                    <select value={dob.day} onChange={(e) => setDob((prev) => ({ ...prev, day: e.target.value }))} className={`${selectClass} appearance-none pr-7`}>
                      <option value="">Ngày</option>
                      {days.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-dark" />
                  </div>
                  <div className="relative">
                    <select value={dob.month} onChange={(e) => setDob((prev) => ({ ...prev, month: e.target.value }))} className={`${selectClass} appearance-none pr-7`}>
                      <option value="">Tháng</option>
                      {months.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-dark" />
                  </div>
                  <div className="relative">
                    <select value={dob.year} onChange={(e) => setDob((prev) => ({ ...prev, year: e.target.value }))} className={`${selectClass} appearance-none pr-7`}>
                      <option value="">Năm</option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-dark" />
                  </div>
                </div>
              </div>

              {/* Email (disabled) */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-primary">
                  Email
                  <span className="ml-1 text-xs opacity-70">(không thể thay đổi)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 rounded-lg text-sm bg-neutral-light-active border border-neutral text-primary cursor-not-allowed opacity-70"
                />
              </div>

              {/* Submit */}
              <div className="pt-1 sm:pt-2">
                <button
                  type="submit"
                  disabled={!isDirty || submitting}
                  className={`
                    w-full flex items-center justify-center gap-2
                    bg-primary text-neutral-light font-semibold
                    py-2.5 sm:py-3 rounded-xl
                    text-sm sm:text-base
                    shadow-md hover:shadow-lg
                    transition-all active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                    ${!submitting && isDirty ? "hover:bg-primary-hover active:bg-primary-active cursor-pointer" : "cursor-not-allowed"}
                  `}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin sm:w-[18px] sm:h-[18px]" /> Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Pencil size={16} className="sm:w-[18px] sm:h-[18px]" /> Cập nhật thông tin
                    </>
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
