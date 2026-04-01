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
  "w-full rounded-lg border border-neutral bg-neutral-light px-3 py-2 text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40";

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
    return (
      <div className="rounded-2xl border border-neutral bg-neutral-light p-6 text-primary">
        Đang tải...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-neutral bg-neutral-light p-6 text-primary">
        Bạn chưa đăng nhập
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm">
          <div className="border-b border-neutral px-5 py-4">
            <div className="flex items-center gap-2 text-accent">
              <User className="h-5 w-5" />
              <h2 className="text-base font-semibold text-primary">
                Thông tin cá nhân
              </h2>
            </div>
            <p className="text-sm text-neutral-dark mt-1">
              Ảnh đại diện và thông tin cơ bản
            </p>
          </div>
          <div className="px-6 py-8 flex flex-col items-center text-center">
            <div className="relative h-28 w-28 rounded-full border-4 border-accent/20 bg-linear-to-br from-accent/20 via-neutral-light-active to-accent/10 flex items-center justify-center overflow-hidden">
              <Image
                src={form.avatarImage}
                alt="Avatar"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <p className="mt-4 text-lg font-semibold text-primary">
              {form.fullName || "—"}
            </p>
            <span className="mt-3 inline-flex items-center rounded-full bg-promotion px-4 py-1 text-xs font-semibold text-neutral-light">
              {(form.role || "ADMIN").toUpperCase()}
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm">
          <div className="border-b border-neutral px-5 py-4">
            <div className="flex items-center gap-2 text-accent">
              <Settings className="h-5 w-5" />
              <h2 className="text-base font-semibold text-primary">
                Thông tin cá nhân
              </h2>
            </div>
            <p className="text-sm text-neutral-dark mt-1">
              Cập nhật thông tin liên hệ và chi tiết cá nhân
            </p>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-neutral-dark">
                Họ và tên *
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2 text-sm text-neutral-dark">
                Email *
                <input value={form.email} readOnly className={inputClass} />
              </label>
              <label className="space-y-2 text-sm text-neutral-dark">
                Số điện thoại
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className={inputClass}
                />
              </label>
              <label className="space-y-2 text-sm text-neutral-dark">
                Vai trò
                <input value={form.role} readOnly className={inputClass} />
              </label>
            </div>
            <label className="space-y-2 text-sm text-neutral-dark">
              Địa chỉ
              <input placeholder="Nhập địa chỉ" className={inputClass} disabled />
            </label>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isDirty || saving}
                className={[
                  "inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition",
                  isDirty
                    ? "bg-accent text-white hover:bg-accent/90"
                    : "bg-neutral text-neutral-dark cursor-not-allowed",
                ].join(" ")}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm">
        <div className="border-b border-neutral px-5 py-4">
          <div className="flex items-center gap-2 text-accent">
            <Settings className="h-5 w-5" />
            <h2 className="text-base font-semibold text-primary">
              Thông tin tài khoản
            </h2>
          </div>
          <p className="text-sm text-neutral-dark mt-1">
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
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral bg-neutral-light-active px-4 py-3 text-sm"
            >
              <div className="text-neutral-dark">{row.label}</div>
              {row.badge ? (
                <span
                  className={[
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                    row.badge === "warning"
                      ? "bg-promotion-light text-promotion"
                      : "bg-accent-light text-accent",
                  ].join(" ")}
                >
                  {row.value}
                </span>
              ) : (
                <div className="text-primary font-semibold">{row.value}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
