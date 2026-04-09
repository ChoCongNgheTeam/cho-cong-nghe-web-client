"use client";

import { useState, useEffect, useRef } from "react"; // ← thêm useRef
import { useRouter } from "next/navigation";
import type { User, UserRole } from "../user.types";
import { createUser } from "../_libs/createUser";
import { updateUserApi } from "../_libs/updateUser";
import { useToasty } from "@/components/Toast";
import { User as UserIcon, Mail, Lock, Phone, ShieldCheck, Camera, X, AlertCircle } from "lucide-react";
import Image from "next/image"; // ← dùng Next/Image cho avatar tốt hơn

type Gender = "MALE" | "FEMALE" | "OTHER";

interface UserFormState {
  userName: string;
  email: string;
  fullName: string;
  phone: string;
  gender: Gender;
  role: UserRole;
  isActive: boolean;
  avatarImage: string | null; // giữ để hiển thị ảnh cũ
  password: string;
}

type FormErrors = Partial<Record<keyof UserFormState, string>>;

interface Props {
  editingUser?: User | null;
}

const defaultForm: UserFormState = {
  userName: "",
  email: "",
  fullName: "",
  phone: "",
  gender: "MALE",
  role: "CUSTOMER",
  isActive: true,
  avatarImage: null,
  password: "",
};

const GENDERS: Gender[] = ["MALE", "FEMALE", "OTHER"];

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center text-accent shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-primary">{title}</p>
        {subtitle && <p className="text-[11px] text-neutral-dark mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-primary flex items-center gap-1.5 uppercase tracking-wide">
        {label}
        {required && <span className="text-promotion text-base leading-none">*</span>}
        {hint && <span className="text-[11px] text-neutral-dark font-normal normal-case tracking-normal">{hint}</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-promotion flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-promotion inline-block" />
          {error}
        </p>
      )}
    </div>
  );
}

function inputCls(err?: string) {
  return [
    "w-full border px-4 py-2.5 rounded-xl text-sm text-primary bg-neutral-light",
    "placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-150",
    err ? "border-promotion bg-promotion-light/30" : "border-neutral hover:border-neutral-active",
  ].join(" ");
}

function selectCls() {
  return [
    "w-full border border-neutral px-4 py-2.5 rounded-xl text-sm text-primary bg-neutral-light",
    "hover:border-neutral-active focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all cursor-pointer",
  ].join(" ");
}

export default function UserForm({ editingUser }: Props) {
  const router = useRouter();
  const { success, error: toastError } = useToasty();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<UserFormState>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [phoneInputWarning, setPhoneInputWarning] = useState("");

  // Avatar states (mới)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  useEffect(() => {
    if (editingUser) {
      const gender: Gender = GENDERS.includes(editingUser.gender as Gender) ? (editingUser.gender as Gender) : "MALE";
      setForm({
        userName: editingUser.userName ?? "",
        email: editingUser.email ?? "",
        fullName: editingUser.fullName ?? "",
        phone: editingUser.phone ?? "",
        gender,
        role: editingUser.role ?? "CUSTOMER",
        isActive: editingUser.isActive ?? true,
        avatarImage: editingUser.avatarImage ?? null,
        password: "",
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      setRemoveAvatar(false);
    } else {
      setForm(defaultForm);
      setAvatarFile(null);
      setAvatarPreview(null);
      setRemoveAvatar(false);
    }
  }, [editingUser]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const setField = <K extends keyof UserFormState>(key: K, value: UserFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Xử lý chọn file ảnh (mới)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
    setField("avatarImage", null); // reset avatarImage cũ để ưu tiên preview

    // Reset input để chọn lại cùng file
    e.target.value = "";
  };

  // Xóa ảnh (mới)
  const handleRemoveAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);

    if (form.avatarImage) {
      setRemoveAvatar(true);
      setField("avatarImage", null);
    } else {
      setRemoveAvatar(false);
    }
  };

  // Ảnh hiển thị
  const displayAvatar = avatarPreview || (!removeAvatar && form.avatarImage) || undefined;
  const hasAvatar = !!(avatarPreview || (!removeAvatar && form.avatarImage));

  const validate = (): boolean => {
    // ... giữ nguyên validate cũ của bạn
    const err: FormErrors = {};
    if (!form.userName.trim()) err.userName = "Nhập username";
    else if (form.userName.length < 3) err.userName = "Tối thiểu 3 ký tự";
    else if (form.userName.length > 30) err.userName = "Tối đa 30 ký tự";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.userName)) err.userName = "Chỉ chữ, số và dấu gạch dưới";

    if (!form.fullName.trim()) err.fullName = "Nhập họ tên";
    else if (form.fullName.length < 3) err.fullName = "Tối thiểu 3 ký tự";
    else if (form.fullName.length > 50) err.fullName = "Tối đa 50 ký tự";

    if (!editingUser) {
      if (!form.email.trim()) err.email = "Nhập email";
      else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = "Email không hợp lệ";
    }

    if (form.phone.trim() && !/^0\d{9}$/.test(form.phone.trim())) err.phone = "10 số, bắt đầu bằng 0";

    const pwRule = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/;
    if (!editingUser) {
      if (!form.password.trim()) err.password = "Nhập mật khẩu";
      else if (form.password.length < 6) err.password = "Tối thiểu 6 ký tự";
      else if (!pwRule.test(form.password)) err.password = "Cần có chữ hoa và số";
    } else if (form.password.trim()) {
      if (form.password.length < 6) err.password = "Tối thiểu 6 ký tự";
      else if (!pwRule.test(form.password)) err.password = "Cần có chữ hoa và số";
    }

    const validRoles: UserRole[] = ["CUSTOMER", "ADMIN", "STAFF"];
    if (!validRoles.includes(form.role)) err.role = "Role không hợp lệ";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      if (editingUser) {
        // Dùng FormData khi edit để hỗ trợ upload ảnh
        const fd = new FormData();

        fd.append("userName", form.userName.trim());
        fd.append("email", form.email.trim());
        fd.append("fullName", form.fullName.trim());
        fd.append("phone", form.phone.trim());
        fd.append("gender", form.gender);
        fd.append("role", form.role);
        fd.append("isActive", String(form.isActive));

        if (form.password.trim()) {
          fd.append("password", form.password.trim());
        }

        // Avatar logic
        if (avatarFile) {
          fd.append("avatarImage", avatarFile);
        } else if (removeAvatar) {
          fd.append("removeAvatar", "true");
        }

        await updateUserApi(editingUser.id, fd); // ← giả sử updateUserApi hỗ trợ FormData (nếu không, bạn cần sửa hàm này thành fetch FormData)

        success("Cập nhật người dùng thành công!");
      } else {
        // Tạo mới: giữ nguyên object (hoặc bạn có thể mở rộng sau)
        await createUser({
          userName: form.userName.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          gender: form.gender,
          role: form.role,
          isActive: form.isActive,
        });
        success("Tạo người dùng thành công!");
      }

      router.push("/admin/users");
    } catch (err) {
      console.error("User submit error:", err);
      toastError("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 p-5 bg-neutral-light min-h-full">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl font-bold text-primary leading-tight">{editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</h1>
        {editingUser ? (
          <p className="text-[13px] text-neutral-dark mt-0.5">
            Đang chỉnh sửa: <span className="font-semibold text-primary">{editingUser.fullName || editingUser.userName}</span>
            <span className="ml-2 text-[11px] font-mono opacity-60">ID: {editingUser.id}</span>
          </p>
        ) : (
          <p className="text-[13px] text-neutral-dark mt-0.5">Điền thông tin để tạo tài khoản mới</p>
        )}
      </div>

      {/* ── Form card ── */}
      <div className="bg-neutral-light rounded-2xl border border-neutral shadow-sm overflow-hidden">
        <div className="p-7 space-y-8">
          {/* Avatar */}
          <section>
            <SectionTitle icon={<Camera size={16} />} title="Ảnh đại diện" subtitle="Hỗ trợ JPG, PNG – khuyến nghị tỉ lệ 1:1" />

            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl border-2 border-neutral overflow-hidden bg-neutral-light-active">
                  {displayAvatar ? (
                    <Image src={displayAvatar} alt="avatar" className="w-full h-full object-cover" width={96} height={96} />
                  ) : (
                    <UserIcon size={32} className="text-neutral-dark m-auto" />
                  )}
                </div>

                {/* Nút chọn ảnh */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-accent rounded-xl flex items-center justify-center cursor-pointer hover:bg-accent-hover transition-colors shadow-sm"
                >
                  <Camera size={13} className="text-white" />
                </button>

                {/* Nút xóa ảnh */}
                {hasAvatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-red-500 rounded-xl flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors shadow-sm"
                  >
                    <X size={13} className="text-white" />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-medium text-accent border border-accent rounded-xl hover:bg-accent-light transition-colors cursor-pointer w-fit"
                >
                  <Camera size={13} /> Chọn ảnh
                </button>

                {avatarFile && <p className="text-[11px] text-neutral-dark truncate max-w-[200px]">{avatarFile.name}</p>}
                {removeAvatar && !avatarFile && <p className="text-[11px] text-red-500">Ảnh sẽ bị xóa khi lưu</p>}

                <p className="text-[11px] text-neutral-dark">Kích thước tối đa: 5MB</p>
              </div>
            </div>

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </section>
          <div className="border-t border-neutral" />

          {/* Account info */}
          <section>
            <SectionTitle icon={<UserIcon size={16} />} title="Thông tin tài khoản" subtitle="Tên đăng nhập và thông tin cơ bản" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Username" required error={errors.userName}>
                <input value={form.userName} onChange={(e) => setField("userName", e.target.value)} placeholder="vd: john_doe" className={inputCls(errors.userName)} />
              </Field>

              <Field label="Họ và tên" required error={errors.fullName}>
                <input value={form.fullName} onChange={(e) => setField("fullName", e.target.value)} placeholder="vd: Nguyễn Văn A" className={inputCls(errors.fullName)} />
              </Field>

              {/* Email — chỉ đọc khi edit */}
              <Field label="Email" required={!editingUser} error={errors.email}>
                <div className="relative">
                  <input
                    value={form.email}
                    onChange={(e) => !editingUser && setField("email", e.target.value)}
                    readOnly={!!editingUser}
                    placeholder="vd: email@example.com"
                    className={`${inputCls(errors.email)} pl-10 ${editingUser ? "cursor-not-allowed opacity-60 select-none" : ""}`}
                  />
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
                </div>
                {editingUser && (
                  <p className="text-[11px] text-neutral-dark flex items-center gap-1 mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-neutral-dark inline-block" />
                    Email không thể thay đổi
                  </p>
                )}
              </Field>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-primary flex items-center gap-1.5 uppercase tracking-wide">Số điện thoại</label>
                <div className="relative">
                  <input
                    value={form.phone}
                    inputMode="numeric"
                    onChange={(e) => {
                      const raw = e.target.value;
                      const digitsOnly = raw.replace(/\D/g, "");
                      if (raw !== digitsOnly) {
                        setPhoneInputWarning("Chỉ được nhập số, không dùng chữ hoặc ký tự đặc biệt");
                        setTimeout(() => setPhoneInputWarning(""), 2500);
                      } else {
                        setPhoneInputWarning("");
                      }
                      setField("phone", digitsOnly);
                    }}
                    placeholder="vd: 0912345678"
                    className={`${inputCls(errors.phone)} pl-10`}
                    maxLength={10}
                  />
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
                </div>
                {phoneInputWarning && (
                  <p className="text-[11px] text-amber-600 flex items-center gap-1">
                    <AlertCircle size={11} className="shrink-0" />
                    {phoneInputWarning}
                  </p>
                )}
                {errors.phone && !phoneInputWarning && (
                  <p className="text-[11px] text-promotion flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-promotion inline-block" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="border-t border-neutral" />

          {/* Security — chỉ hiển thị khi tạo mới */}
          {!editingUser && (
            <>
              <section>
                <SectionTitle icon={<Lock size={16} />} title="Bảo mật" subtitle="Mật khẩu đăng nhập" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <Field label="Mật khẩu" required error={errors.password}>
                    <div className="relative">
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setField("password", e.target.value)}
                        placeholder="Tối thiểu 6 ký tự, có chữ hoa và số"
                        className={`${inputCls(errors.password)} pl-10`}
                      />
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
                    </div>
                  </Field>
                </div>
              </section>

              <div className="border-t border-neutral" />
            </>
          )}

          {/* Permissions & Status */}
          <section>
            <SectionTitle icon={<ShieldCheck size={16} />} title="Quyền & Trạng thái" subtitle="Phân quyền và cài đặt tài khoản" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
              <Field label="Giới tính">
                <select value={form.gender} onChange={(e) => setField("gender", e.target.value as Gender)} className={selectCls()}>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </Field>

              <Field label="Vai trò" error={errors.role}>
                <select value={form.role} onChange={(e) => setField("role", e.target.value as UserRole)} className={selectCls()}>
                  <option value="CUSTOMER">Khách hàng</option>
                  <option value="STAFF">Nhân viên</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </Field>

              <Field label="Trạng thái tài khoản">
                <div
                  onClick={() => setField("isActive", !form.isActive)}
                  className={[
                    "flex items-center justify-between px-4 rounded-xl border transition-all cursor-pointer select-none h-[46px]",
                    form.isActive ? "border-accent bg-accent-light text-accent" : "border-neutral bg-neutral-light-active text-neutral-dark",
                  ].join(" ")}
                >
                  <span className="text-sm font-medium">{form.isActive ? "Đang hoạt động" : "Bị khóa"}</span>
                  <div className={["flex items-center rounded-full p-0.5 transition-colors shrink-0", form.isActive ? "bg-accent" : "bg-neutral-active"].join(" ")} style={{ width: 40, height: 22 }}>
                    <div className={["w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200", form.isActive ? "translate-x-4" : "translate-x-0"].join(" ")} />
                  </div>
                </div>
              </Field>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-neutral bg-neutral-light-active/60 flex items-center justify-between gap-3">
          <p className="text-[11px] text-neutral-dark">
            <span className="text-promotion">*</span> Các trường bắt buộc
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/users")}
              className="px-5 py-2.5 text-sm font-medium text-primary bg-neutral-light border border-neutral rounded-xl hover:bg-neutral-light-active transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-accent rounded-xl hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? "Đang xử lý..." : editingUser ? "Lưu thay đổi" : "Tạo người dùng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
