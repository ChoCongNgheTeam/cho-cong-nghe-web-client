"use client";

import { useState, useEffect } from "react";
import { Popzy } from "@/components/Modal";
import { User, UserRole } from "../user.types";
import { createUser } from "../_libs/createUser";
import { updateUserApi } from "../_libs/updateUser";

/* ================= TYPE ================= */
type UserForm = Omit<User, "id" | "createdAt" | "updatedAt"> & {
  password?: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: User) => void;
  editingUser?: User | null;
}

/* ================= DEFAULT ================= */
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

export default function UserModal({
  isOpen,
  onClose,
  onSuccess,
  editingUser,
}: Props) {
  const [form, setForm] = useState<UserForm>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof UserForm, string>>>(
    {},
  );
  const [loading, setLoading] = useState(false);

  /* ================= INIT ================= */
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
  }, [editingUser, isOpen]);

  /* reset khi đóng modal */
  useEffect(() => {
    if (!isOpen) {
      setForm(defaultForm);
      setErrors({});
    }
  }, [isOpen]);

  /* ================= HANDLE ================= */
  const setField = <K extends keyof UserForm>(key: K, value: UserForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /* ================= VALIDATE ================= */
  const validate = () => {
    const err: Partial<Record<keyof UserForm, string>> = {};

    // userName
    if (!form.userName?.trim()) {
      err.userName = "Nhập username";
    } else if (form.userName.length < 3) {
      err.userName = "Tên đăng nhập phải từ 3 ký tự";
    } else if (form.userName.length > 30) {
      err.userName = "Tên đăng nhập tối đa 30 ký tự";
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.userName)) {
      err.userName = "Tên đăng nhập không hợp lệ";
    }

    // fullName
    if (!form.fullName?.trim()) {
      err.fullName = "Nhập họ tên";
    } else if (form.fullName.length < 3) {
      err.fullName = "Họ và tên phải từ 3 ký tự";
    } else if (form.fullName.length > 30) {
      err.fullName = "Họ và tên tối đa 30 ký tự";
    }

    // email
    if (!form.email?.trim()) {
      err.email = "Nhập email";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      err.email = "Email không hợp lệ";
    }

    // password (create only)
    if (!editingUser) {
      if (!form.password?.trim()) {
        err.password = "Nhập mật khẩu";
      } else if (form.password.length < 6) {
        err.password = "Mật khẩu phải ít nhất 6 ký tự";
      } else if (
        !/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/.test(form.password)
      ) {
        err.password =
          "Mật khẩu phải có chữ hoa, số và không chứa ký tự có dấu";
      }
    }

    // phone (optional nhưng nếu có thì phải đúng)
    if (form.phone?.trim()) {
      if (!/^0\d{9}$/.test(form.phone.trim())) {
        err.phone = "Số điện thoại không hợp lệ";
      }
    }

    // gender
    if (form.gender && !["MALE", "FEMALE", "OTHER"].includes(form.gender)) {
      err.gender = "Giới tính không hợp lệ";
    }

    // role
    if (!["CUSTOMER", "ADMIN", "STAFF"].includes(form.role)) {
      err.role = "Role không hợp lệ";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      //  clean data trước khi gửi
      const cleanForm = {
        ...form,
        userName: form.userName.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || "",
      };

      let user: User;

      if (editingUser) {
        user = await updateUserApi(editingUser.id, {
          userName: cleanForm.userName,
          email: cleanForm.email,
          fullName: cleanForm.fullName,
          phone: cleanForm.phone,
          gender: cleanForm.gender,
          role: cleanForm.role,
          isActive: cleanForm.isActive,
        });
      } else {
        user = await createUser({
          userName: cleanForm.userName,
          email: cleanForm.email,
          password: cleanForm.password!,
          fullName: cleanForm.fullName,
          phone: cleanForm.phone,
          gender: cleanForm.gender,
          role: cleanForm.role,
          isActive: cleanForm.isActive,
        });
      }

      onSuccess?.(user);
      onClose();
    } catch (err) {
      console.error("User error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <Popzy
      isOpen={isOpen}
      onClose={onClose}
      closeMethods={["button"]}
      footer
      cssClass="max-w-[1200px] w-full p-6"
      content={
        <div className="space-y-5 w-full max-h-[80vh] overflow-y-auto p-2">
          <h2 className="text-lg font-semibold border-b pb-3">
            {editingUser ? "Cập nhật user" : "Thêm user"}
          </h2>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 pb-3 ">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                {form.avatarImage ? (
                  <img
                    src={form.avatarImage}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl text-gray-400">👤</span>
                )}
              </div>

              <label
                htmlFor="avatarUpload"
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition"
                title="Chọn ảnh"
              >
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </label>

              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () =>
                    setField("avatarImage", reader.result as string);
                  reader.readAsDataURL(file);
                }}
              />
            </div>

            {form.avatarImage && (
              <button
                type="button"
                onClick={() => setField("avatarImage", null)}
                className="text-xs text-red-500 hover:text-red-700 transition"
              >
                Xóa ảnh
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 p-2">
            {/* Username */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                value={form.userName}
                onChange={(e) => setField("userName", e.target.value)}
                placeholder="vd: john_doe"
                className={`border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition box-border ${
                  errors.userName
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {errors.userName && (
                <p className="text-red-500 text-xs">{errors.userName}</p>
              )}
            </div>

            {/* FullName */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Họ tên
              </label>
              <input
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                placeholder="vd: Nguyễn Văn A"
                className={`border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition ${
                  errors.fullName
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="vd: email@example.com"
                className={`border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition ${
                  errors.email ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            {!editingUser && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="Ít nhất 6 ký tự, có chữ hoa và số"
                  className={`border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition ${
                    errors.password
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password}</p>
                )}
              </div>
            )}

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="vd: 0912345678"
                className={`border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition ${
                  errors.phone ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone}</p>
              )}
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Giới tính
              </label>
              <select
                value={form.gender}
                onChange={(e) =>
                  setField("gender", e.target.value as UserForm["gender"])
                }
                className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition bg-white"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <select
                value={form.role}
                onChange={(e) => setField("role", e.target.value as UserRole)}
                className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition bg-white"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Active */}
            <div className="flex items-center gap-2 md:col-span-2 pt-1">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setField("isActive", e.target.checked)}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
              <label
                htmlFor="isActive"
                className="text-sm text-gray-700 cursor-pointer select-none"
              >
                Kích hoạt tài khoản
              </label>
            </div>
          </div>
        </div>
      }
      footerButtons={[
        {
          title: "Hủy",
          onClick: onClose,
          className: "px-4 py-2 bg-gray-200 rounded hover:bg-gray-300",
        },
        {
          title: loading ? "Đang xử lý..." : editingUser ? "Cập nhật" : "Tạo",
          onClick: handleSubmit,
          className:
            "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700",
        },
      ]}
    />
  );
}
