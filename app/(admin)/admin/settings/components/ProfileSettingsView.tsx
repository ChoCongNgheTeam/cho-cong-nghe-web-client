"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Settings, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToasty } from "@/components/Toast";
import apiRequest from "@/lib/api";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  avatarImage: string;
};

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 focus:outline-none focus:border-indigo-300";

export default function ProfileSettingsView() {
  const { user, loading, refreshUser } = useAuth();
  const { success, error } = useToasty();
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    avatarImage: "/images/avatar.png",
  });
  const [initial, setInitial] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    avatarImage: "/images/avatar.png",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const data: FormState = {
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      role: user.role ?? "",
      avatarImage: user.avatarImage || "/images/avatar.png",
    };
    setForm(data);
    setInitial(data);
  }, [user]);

  const isDirty = useMemo(
    () => form.fullName !== initial.fullName || form.phone !== initial.phone,
    [form, initial]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || saving || !isDirty) return;
    setSaving(true);
    try {
      const payload: { fullName: string; phone?: string } = {
        fullName: form.fullName,
      };
      if (form.phone !== initial.phone && form.phone) {
        payload.phone = form.phone;
      }
      await apiRequest.patch("/users/me", payload);
      await refreshUser();
      success("Cập nhật thông tin thành công");
      setInitial({ ...form });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message ?? "")
          : "";
      error(message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-6">Đang tải...</div>;
  }

  if (!user) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-6">Bạn chưa đăng nhập</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <User className="h-5 w-5" />
              <h2 className="text-base font-semibold text-gray-900">
                Thông tin cá nhân
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Ảnh đại diện và thông tin cơ bản
            </p>
          </div>
          <div className="px-6 py-8 flex flex-col items-center text-center">
            <div className="relative h-28 w-28 rounded-full border-4 border-indigo-100 bg-linear-to-br from-indigo-200 via-purple-200 to-pink-200 flex items-center justify-center overflow-hidden">
              <Image
                src={form.avatarImage}
                alt="Avatar"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-900">
              {form.fullName || "—"}
            </p>
            <span className="mt-3 inline-flex items-center rounded-full bg-red-500 px-4 py-1 text-xs font-semibold text-white">
              {(form.role || "ADMIN").toUpperCase()}
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <Settings className="h-5 w-5" />
              <h2 className="text-base font-semibold text-gray-900">
                Thông tin cá nhân
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Cập nhật thông tin liên hệ và chi tiết cá nhân
            </p>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-gray-600">
                Họ và tên *
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2 text-sm text-gray-600">
                Email *
                <input
                  value={form.email}
                  readOnly
                  className={inputClass}
                />
              </label>
              <label className="space-y-2 text-sm text-gray-600">
                Số điện thoại
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className={inputClass}
                />
              </label>
              <label className="space-y-2 text-sm text-gray-600">
                Vai trò
                <input value={form.role} readOnly className={inputClass} />
              </label>
            </div>
            <label className="space-y-2 text-sm text-gray-600">
              Địa chỉ
              <input
                placeholder="Nhập địa chỉ"
                className={inputClass}
                disabled
              />
            </label>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isDirty || saving}
                className={[
                  "inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition",
                  isDirty
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed",
                ].join(" ")}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className="rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Settings className="h-5 w-5" />
            <h2 className="text-base font-semibold text-gray-900">
              Thông tin tài khoản
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Chi tiết về tài khoản và trạng thái
          </p>
        </div>
        <div className="px-6 py-5 space-y-3">
          {[
            { label: "ID tài khoản", value: user.id || "—" },
            { label: "Ngày tạo", value: "Không có thông tin" },
            { label: "Email đã xác thực", value: "Chưa xác thực", badge: "warning" },
            { label: "Trạng thái tài khoản", value: "Đang hoạt động", badge: "success" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm"
            >
              <div className="text-gray-600">{row.label}</div>
              {row.badge ? (
                <span
                  className={[
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                    row.badge === "warning"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-indigo-100 text-indigo-600",
                  ].join(" ")}
                >
                  {row.value}
                </span>
              ) : (
                <div className="text-gray-800 font-semibold">{row.value}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
