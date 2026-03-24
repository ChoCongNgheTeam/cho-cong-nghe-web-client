"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, UserRole } from "../user.types";
import { createUser } from "../_libs/createUser";
import { updateUserApi } from "../_libs/updateUser";
import { useToasty } from "@/components/Toast";
import { User as UserIcon, Mail, Lock, Phone, ShieldCheck, Camera, X, ChevronLeft } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Gender = "MALE" | "FEMALE" | "OTHER";

interface UserFormState {
  userName: string;
  email: string;
  fullName: string;
  phone: string;
  gender: Gender;
  role: UserRole;
  isActive: boolean;
  avatarImage: string | null;
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

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center text-accent shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-primary">{title}</p>
        {subtitle && <p className="text-[11px] text-neutral-dark mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Field({ label, required, hint, error, children }: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
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
    "placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
    "transition-all duration-150",
    err ? "border-promotion bg-promotion-light/30" : "border-neutral hover:border-neutral-active",
  ].join(" ");
}

function selectCls() {
  return [
    "w-full border border-neutral px-4 py-2.5 rounded-xl text-sm text-primary bg-neutral-light",
    "hover:border-neutral-active focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
    "transition-all cursor-pointer",
  ].join(" ");
}

// ── Main Form ──────────────────────────────────────────────────────────────────

export default function UserForm({ editingUser }: Props) {
  const router = useRouter();
  const { success, error: toastError } = useToasty();

  const [form, setForm] = useState<UserFormState>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingUser) {
      const gender: Gender = (["MALE", "FEMALE", "OTHER"] as Gender[]).includes(editingUser.gender as Gender)
        ? (editingUser.gender as Gender)
        : "MALE";

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
    } else {
      setForm(defaultForm);
    }
  }, [editingUser]);

  const setField = <K extends keyof UserFormState>(key: K, value: UserFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const err: FormErrors = {};

    if (!form.userName.trim()) err.userName = "Nhập username";
    else if (form.userName.length < 3) err.userName = "Tối thiểu 3 ký tự";
    else if (form.userName.length > 30) err.userName = "Tối đa 30 ký tự";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.userName)) err.userName = "Chỉ chữ, số và dấu gạch dưới";

    if (!form.fullName.trim()) err.fullName = "Nhập họ tên";
    else if (form.fullName.length < 3) err.fullName = "Tối thiểu 3 ký tự";
    else if (form.fullName.length > 50) err.fullName = "Tối đa 50 ký tự";

    if (!form.email.trim()) err.email = "Nhập email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = "Email không hợp lệ";

    if (!editingUser) {
      if (!form.password.trim()) err.password = "Nhập mật khẩu";
      else if (form.password.length < 6) err.password = "Tối thiểu 6 ký tự";
      else if (!/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/.test(form.password))
        err.password = "Cần có chữ hoa và số";
    } else if (form.password.trim()) {
      if (form.password.length < 6) err.password = "Tối thiểu 6 ký tự";
      else if (!/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/.test(form.password))
        err.password = "Cần có chữ hoa và số";
    }

    if (form.phone.trim() && !/^0\d{9}$/.test(form.phone.trim()))
      err.phone = "10 số, bắt đầu bằng 0";

    if (!(["CUSTOMER", "ADMIN", "STAFF"] as UserRole[]).includes(form.role))
      err.role = "Role không hợp lệ";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const clean: UserFormState = {
        ...form,
        userName: form.userName.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      };

      if (editingUser) {
        await updateUserApi(editingUser.id, {
          userName: clean.userName,
          email: clean.email,
          fullName: clean.fullName,
          phone: clean.phone,
          gender: clean.gender,
          role: clean.role,
          isActive: clean.isActive,
          ...(clean.password.trim() ? { password: clean.password.trim() } : {}),
        });
        success("Cập nhật người dùng thành công!");
      } else {
        await createUser({
          userName: clean.userName,
          email: clean.email,
          password: clean.password,
          fullName: clean.fullName,
          phone: clean.phone,
          gender: clean.gender,
          role: clean.role,
          isActive: clean.isActive,
        });
        success("Tạo người dùng thành công!");
      }
      router.push("/admin/users");
    } catch (err) {
      console.error("User error:", err);
      toastError("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 p-5 bg-neutral-light min-h-full">

      {/* ── Page header: back + title + breadcrumb ──────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/users")}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-neutral text-primary hover:bg-neutral-light-active hover:border-neutral-active transition-all cursor-pointer shrink-0"
          title="Quay lại danh sách"
        >
          <ChevronLeft size={16} />
        </button>
        <div>
         
        </div>
      </div>

      {/* ── Form card ────────────────────────────────────────────────────────── */}
      <div className="w-full ">
        <div className="bg-neutral-light rounded-2xl border border-neutral shadow-sm overflow-hidden">

          <div className="p-7 space-y-8">

            {/* Section 1: Avatar */}
            <section>
              <SectionTitle
                icon={<Camera size={16} />}
                title="Ảnh đại diện"
                subtitle="Hỗ trợ JPG, PNG – khuyến nghị tỉ lệ 1:1"
              />
              <div className="flex items-center gap-6">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 rounded-2xl border-2 border-neutral overflow-hidden bg-neutral-light-active flex items-center justify-center">
                    {form.avatarImage
                      ? <img src={form.avatarImage} alt="avatar" className="w-full h-full object-cover" />
                      : <UserIcon size={32} className="text-neutral-dark" />}
                  </div>
                  <label htmlFor="avatarUpload"
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-accent rounded-xl flex items-center justify-center cursor-pointer hover:bg-accent-hover transition-colors shadow-sm">
                    <Camera size={13} className="text-white" />
                  </label>
                  <input id="avatarUpload" type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setField("avatarImage", reader.result as string);
                      reader.readAsDataURL(file);
                    }} />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="avatarUpload"
                    className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-medium text-accent border border-accent rounded-xl hover:bg-accent-light transition-colors cursor-pointer w-fit">
                    <Camera size={13} /> Chọn ảnh
                  </label>
                  {form.avatarImage && (
                    <button type="button" onClick={() => setField("avatarImage", null)}
                      className="inline-flex items-center gap-1.5 text-[12px] text-promotion hover:text-promotion-hover transition-colors cursor-pointer w-fit">
                      <X size={12} /> Xóa ảnh
                    </button>
                  )}
                  <p className="text-[11px] text-neutral-dark">Kích thước tối đa: 5MB</p>
                </div>
              </div>
            </section>

            <div className="border-t border-neutral" />

            {/* Section 2: Account info */}
            <section>
              <SectionTitle
                icon={<UserIcon size={16} />}
                title="Thông tin tài khoản"
                subtitle="Tên đăng nhập và thông tin cơ bản"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <Field label="Username" required error={errors.userName}>
                  <input
                    value={form.userName}
                    onChange={(e) => setField("userName", e.target.value)}
                    placeholder="vd: john_doe"
                    className={inputCls(errors.userName)}
                  />
                </Field>

                <Field label="Họ và tên" required error={errors.fullName}>
                  <input
                    value={form.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                    placeholder="vd: Nguyễn Văn A"
                    className={inputCls(errors.fullName)}
                  />
                </Field>

                <Field label="Email" required error={errors.email}>
                  <div className="relative">
                    <input
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="vd: email@example.com"
                      className={`${inputCls(errors.email)} pl-10`}
                    />
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
                  </div>
                </Field>

                <Field label="Số điện thoại" error={errors.phone}>
                  <div className="relative">
                    <input
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="vd: 0912345678"
                      className={`${inputCls(errors.phone)} pl-10`}
                    />
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
                  </div>
                </Field>
              </div>
            </section>

            <div className="border-t border-neutral" />

            {/* Section 3: Security */}
            <section>
              <SectionTitle
                icon={<Lock size={16} />}
                title="Bảo mật"
                subtitle="Mật khẩu đăng nhập"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <Field
                  label="Mật khẩu"
                  required={!editingUser}
                  hint={editingUser ? "(để trống nếu không thay đổi)" : undefined}
                  error={errors.password}
                >
                  <div className="relative">
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                      placeholder={editingUser ? "Nhập mật khẩu mới..." : "Tối thiểu 6 ký tự, có chữ hoa và số"}
                      className={`${inputCls(errors.password)} pl-10`}
                    />
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
                  </div>
                </Field>
              </div>
            </section>

            <div className="border-t border-neutral" />

            {/* Section 4: Permissions & Status */}
            <section>
              <SectionTitle
                icon={<ShieldCheck size={16} />}
                title="Quyền & Trạng thái"
                subtitle="Phân quyền và cài đặt tài khoản"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">

                <Field label="Giới tính">
                  <select
                    value={form.gender}
                    onChange={(e) => setField("gender", e.target.value as Gender)}
                    className={selectCls()}
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </Field>

                <Field label="Vai trò" error={errors.role}>
                  <select
                    value={form.role}
                    onChange={(e) => setField("role", e.target.value as UserRole)}
                    className={selectCls()}
                  >
                    <option value="CUSTOMER">Khách hàng</option>
                    <option value="STAFF">Nhân viên</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </Field>

                <Field label="Trạng thái tài khoản">
                  <div
                    onClick={() => setField("isActive", !form.isActive)}
                    className={[
                      "flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all cursor-pointer select-none h-[46px]",
                      form.isActive
                        ? "border-accent bg-accent-light text-accent"
                        : "border-neutral bg-neutral-light-active text-neutral-dark",
                    ].join(" ")}
                  >
                    <span className="text-sm font-medium">
                      {form.isActive ? "Đang hoạt động" : "Bị khóa"}
                    </span>
                    <div
                      className={[
                        "flex items-center rounded-full p-0.5 transition-colors shrink-0",
                        form.isActive ? "bg-accent" : "bg-neutral-active",
                      ].join(" ")}
                      style={{ width: 40, height: 22 }}
                    >
                      <div className={[
                        "w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
                        form.isActive ? "translate-x-4" : "translate-x-0",
                      ].join(" ")} />
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
    </div>
  );
}