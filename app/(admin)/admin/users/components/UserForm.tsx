"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, UserRole } from "../user.types";
import { createUser } from "../_libs/createUser";
import { updateUserApi } from "../_libs/updateUser";
import { useToasty } from "@/components/Toast";

type UserForm = Omit<User, "id" | "createdAt" | "updatedAt"> & {
  password?: string;
};

interface Props {
  editingUser?: User | null;
}

const defaultForm: UserForm = {
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

function inputCls(err?: string) {
  return `w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition ${
    err ? "border-red-400 bg-red-50" : "border-gray-300"
  }`;
}

function Field({ label, required, hint, error, children }: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-400">*</span>}
        {hint && <span className="text-xs text-gray-400 font-normal">{hint}</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

export default function UserForm({ editingUser }: Props) {
  const router = useRouter();
  const { success, error: toastError } = useToasty();

  const [form, setForm] = useState<UserForm>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof UserForm, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setForm({
        userName: editingUser.userName ?? "",
        email: editingUser.email ?? "",
        fullName: editingUser.fullName ?? "",
        phone: editingUser.phone ?? "",
        gender: (editingUser.gender as UserForm["gender"]) ?? "MALE",
        role: editingUser.role ?? "CUSTOMER",
        isActive: editingUser.isActive ?? true,
        avatarImage: editingUser.avatarImage ?? null,
        password: "",
      });
    } else {
      setForm(defaultForm);
    }
  }, [editingUser]);

  const setField = <K extends keyof UserForm>(key: K, value: UserForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const err: Partial<Record<keyof UserForm, string>> = {};

    if (!form.userName?.trim()) err.userName = "Nhập username";
    else if (form.userName.length < 3) err.userName = "Tên đăng nhập phải từ 3 ký tự";
    else if (form.userName.length > 30) err.userName = "Tên đăng nhập tối đa 30 ký tự";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.userName)) err.userName = "Tên đăng nhập không hợp lệ";

    if (!form.fullName?.trim()) err.fullName = "Nhập họ tên";
    else if (form.fullName.length < 3) err.fullName = "Họ và tên phải từ 3 ký tự";
    else if (form.fullName.length > 30) err.fullName = "Họ và tên tối đa 30 ký tự";

    if (!form.email?.trim()) err.email = "Nhập email";
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = "Email không hợp lệ";

    if (!editingUser) {
      if (!form.password?.trim()) err.password = "Nhập mật khẩu";
      else if (form.password.length < 6) err.password = "Mật khẩu phải ít nhất 6 ký tự";
      else if (!/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/.test(form.password))
        err.password = "Mật khẩu phải có chữ hoa, số và không chứa ký tự có dấu";
    }

    if (editingUser && form.password?.trim()) {
      if (form.password.length < 6) err.password = "Mật khẩu phải ít nhất 6 ký tự";
      else if (!/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/.test(form.password))
        err.password = "Mật khẩu phải có chữ hoa, số và không chứa ký tự có dấu";
    }

    if (form.phone?.trim() && !/^0\d{9}$/.test(form.phone.trim()))
      err.phone = "Số điện thoại không hợp lệ";

    if (form.gender && !["MALE", "FEMALE", "OTHER"].includes(form.gender))
      err.gender = "Giới tính không hợp lệ";

    if (!["CUSTOMER", "ADMIN", "STAFF"].includes(form.role))
      err.role = "Role không hợp lệ";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const cleanForm = {
        ...form,
        userName: form.userName.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || "",
      };

      if (editingUser) {
        await updateUserApi(editingUser.id, {
          userName: cleanForm.userName,
          email: cleanForm.email,
          fullName: cleanForm.fullName,
          phone: cleanForm.phone,
          gender: cleanForm.gender,
          role: cleanForm.role,
          isActive: cleanForm.isActive,
          ...(cleanForm.password?.trim() && { password: cleanForm.password.trim() }),
        });
        success("Cập nhật người dùng thành công!");
      } else {
        await createUser({
          userName: cleanForm.userName,
          email: cleanForm.email,
          password: cleanForm.password!,
          fullName: cleanForm.fullName,
          phone: cleanForm.phone,
          gender: cleanForm.gender,
          role: cleanForm.role,
          isActive: cleanForm.isActive,
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/60">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingUser ? "Cập nhật người dùng" : "Thêm người dùng mới"}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {editingUser
              ? "Chỉnh sửa thông tin tài khoản"
              : "Điền đầy đủ thông tin để tạo tài khoản mới"}
          </p>
        </div>

        <div className="p-6 space-y-6">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 pb-5 border-b border-gray-100">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                {form.avatarImage ? (
                  <img src={form.avatarImage} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-gray-400">👤</span>
                )}
              </div>
              <label htmlFor="avatarUpload"
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
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
            {form.avatarImage && (
              <button type="button" onClick={() => setField("avatarImage", null)}
                className="text-xs text-red-500 hover:text-red-700 transition">
                Xóa ảnh
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">

            <Field label="Username" required error={errors.userName}>
              <input value={form.userName} onChange={(e) => setField("userName", e.target.value)}
                placeholder="vd: john_doe" className={inputCls(errors.userName)} />
            </Field>

            <Field label="Họ tên" required error={errors.fullName}>
              <input value={form.fullName} onChange={(e) => setField("fullName", e.target.value)}
                placeholder="vd: Nguyễn Văn A" className={inputCls(errors.fullName)} />
            </Field>

            <Field label="Email" required error={errors.email}>
              <input value={form.email} onChange={(e) => setField("email", e.target.value)}
                placeholder="vd: email@example.com" className={inputCls(errors.email)} />
            </Field>

            <Field
              label="Mật khẩu"
              required={!editingUser}
              hint={editingUser ? "(để trống nếu không đổi)" : undefined}
              error={errors.password}
            >
              <input type="password" value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder={editingUser ? "Nhập mật khẩu mới..." : "Ít nhất 6 ký tự, có chữ hoa và số"}
                className={inputCls(errors.password)} />
            </Field>

            <Field label="Số điện thoại" error={errors.phone}>
              <input value={form.phone} onChange={(e) => setField("phone", e.target.value)}
                placeholder="vd: 0912345678" className={inputCls(errors.phone)} />
            </Field>

            <Field label="Giới tính">
              <select value={form.gender}
                onChange={(e) => setField("gender", e.target.value as UserForm["gender"])}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition bg-white">
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </Field>

            <Field label="Role" error={errors.role}>
              <select value={form.role}
                onChange={(e) => setField("role", e.target.value as UserRole)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition bg-white">
                <option value="CUSTOMER">Customer</option>
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </Field>

            <div className="flex items-center gap-2 pt-2 md:col-span-2">
              <input id="isActive" type="checkbox" checked={form.isActive}
                onChange={(e) => setField("isActive", e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer" />
              <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer select-none">
                Kích hoạt tài khoản
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-end gap-3">
          <button type="button" onClick={() => router.push("/admin/users")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Hủy
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2">
            {loading && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? "Đang xử lý..." : editingUser ? "Cập nhật" : "Tạo người dùng"}
          </button>
        </div>
      </div>
    </div>
  );
}