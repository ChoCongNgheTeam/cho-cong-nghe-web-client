"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Camera, ChevronDown, Loader2, Pencil, Trash2, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToasty } from "@/components/Toast";
import apiRequest from "@/lib/api";

/* ─────────────────────────── types ─────────────────────────── */
type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  role: string;
  avatarImage: string;
};
type Dob = { day: string; month: string; year: string };
type ProfileErrors = Partial<Record<keyof ProfileForm | "dob", string>>;
/* ────────────────────────── style helpers ────────────────────────── */
const inputCls =
  "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors";

const inputErrorCls =
  "w-full rounded-xl border border-promotion bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-promotion/30 focus:border-promotion transition-colors";

const selectCls =
  "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors cursor-pointer";

const readonlyCls = "w-full rounded-xl border border-neutral bg-neutral-light-active px-3.5 py-2.5 text-sm text-primary/60 cursor-not-allowed";

/* ── Phone validation (VN format) ── */
const isValidPhone = (phone: string) => phone === "" || /^(\+84|0)[0-9]{8,10}$/.test(phone.replace(/\s/g, ""));

/* ─────────────────── sub-components ─────────────────── */
function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="block text-xs font-semibold text-neutral-dark uppercase tracking-wide mb-1.5">
      {children}
      {hint && <span className="ml-1.5 normal-case font-normal text-neutral-dark/60">{hint}</span>}
    </span>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-promotion">{msg}</p>;
}

function SectionCard({ icon: Icon, title, desc, children }: { icon: React.ElementType; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm overflow-hidden">
      <div className="border-b border-neutral px-6 py-4 bg-neutral-light-active/40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <Icon className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-primary">{title}</h2>
            {desc && <p className="text-xs text-neutral-dark mt-0.5">{desc}</p>}
          </div>
        </div>
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function ProfileSettingsView() {
  const { user, loading, refreshUser } = useAuth();
  const { success, error } = useToasty();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── profile state ── */
  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    role: "",
    avatarImage: "",
  });
  const [dob, setDob] = useState<Dob>({ day: "", month: "", year: "" });
  const [initial, setInitial] = useState<ProfileForm>({ ...form });
  const [initialDob, setInitialDob] = useState<Dob>({ ...dob });
  const [saving, setSaving] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});

  /* ── avatar state ── */
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  /* ── date options ── */
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i);

  /* ── init from user ── */
  useEffect(() => {
    if (!user) return;
    const date = user.dateOfBirth ? new Date(user.dateOfBirth) : null;
    const data: ProfileForm = {
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      gender: user.gender ? user.gender.toUpperCase() : "",
      role: user.role ?? "",
      avatarImage: user.avatarImage || "",
    };
    const dobData: Dob = date
      ? {
          day: String(date.getDate()),
          month: String(date.getMonth() + 1),
          year: String(date.getFullYear()),
        }
      : { day: "", month: "", year: "" };

    setForm(data);
    setInitial(data);
    setDob(dobData);
    setInitialDob(dobData);
  }, [user]);

  /* ── cleanup preview URL on unmount ── */
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  /* ── dirty check ── */
  const isDirty = useMemo(
    () =>
      form.fullName !== initial.fullName ||
      form.phone !== initial.phone ||
      form.gender !== initial.gender ||
      dob.day !== initialDob.day ||
      dob.month !== initialDob.month ||
      dob.year !== initialDob.year ||
      avatarFile !== null ||
      removeAvatar,
    [form, dob, initial, initialDob, avatarFile, removeAvatar],
  );

  /* ═══════════════════ VALIDATION ═══════════════════ */

  const validateProfile = (): boolean => {
    const errs: ProfileErrors = {};
    const name = form.fullName.trim();

    if (!name) {
      errs.fullName = "Vui lòng nhập họ và tên";
    } else if (name.length < 2) {
      errs.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    } else if (name.length > 100) {
      errs.fullName = "Họ và tên không được vượt quá 100 ký tự";
    }

    if (form.phone && !isValidPhone(form.phone)) {
      errs.phone = "Số điện thoại không hợp lệ (VD: 0999999999)";
    }

    const dobFilled = [dob.day, dob.month, dob.year].filter(Boolean).length;
    if (dobFilled > 0 && dobFilled < 3) {
      errs.dob = "Vui lòng chọn đầy đủ ngày, tháng, năm sinh";
    } else if (dobFilled === 3) {
      const d = new Date(Number(dob.year), Number(dob.month) - 1, Number(dob.day));
      const age = currentYear - d.getFullYear();
      if (age < 13) errs.dob = "Tuổi phải từ 13 trở lên";
      if (age > 120) errs.dob = "Năm sinh không hợp lệ";
    }

    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ═══════════════════ HANDLERS ═══════════════════ */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name as keyof ProfileErrors]) {
      setProfileErrors((prev) => {
        const n = { ...prev };
        delete n[name as keyof ProfileErrors];
        return n;
      });
    }
  };

  const handleDobChange = (field: keyof Dob, value: string) => {
    setDob((prev) => ({ ...prev, [field]: value }));
    if (profileErrors.dob) {
      setProfileErrors((prev) => {
        const n = { ...prev };
        delete n.dob;
        return n;
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      error("Ảnh không được vượt quá 5MB");
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
    if (form.avatarImage) setRemoveAvatar(true);
  };

  const displayAvatar = avatarPreview || (!removeAvatar && form.avatarImage) || "/images/avatar.png";
  const hasAvatar = !!(avatarPreview || (!removeAvatar && form.avatarImage));

  /* ── submit profile ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !isDirty) return;
    if (!validateProfile()) return;

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("fullName", form.fullName.trim());
      if (form.gender) fd.append("gender", form.gender);
      if (dob.day && dob.month && dob.year) {
        const date = new Date(Number(dob.year), Number(dob.month) - 1, Number(dob.day));
        fd.append("dateOfBirth", date.toISOString());
      }
      if (form.phone !== initial.phone && form.phone) fd.append("phone", form.phone);
      if (avatarFile) fd.append("avatarImage", avatarFile);
      else if (removeAvatar) fd.append("removeAvatar", "true");

      await apiRequest.patch("/users/me", fd);
      await refreshUser();
      success("Cập nhật thông tin thành công");

      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(null);
      setAvatarPreview(null);
      setRemoveAvatar(false);
      setInitial({ ...form });
      setInitialDob({ ...dob });
      setProfileErrors({});
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message?: unknown }).message ?? "") : "";
      error(msg || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };
  /* ════════════════════════════════ GUARD ════════════════════════════════ */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-neutral-dark text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải...
      </div>
    );
  }
  if (!user) {
    return <div className="rounded-2xl border border-neutral bg-neutral-light p-6 text-primary text-sm">Bạn chưa đăng nhập</div>;
  }

  /* ════════════════════════════════ RENDER ════════════════════════════════ */
  return (
    <div className="space-y-6">
      {/* ══ SECTION 1: Avatar + Identity ══ */}
      <SectionCard icon={UserCircle} title="Ảnh đại diện & Danh tính" desc="Ảnh đại diện và thông tin hiển thị của tài khoản">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-accent/40 to-accent/10 blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-28 h-28 rounded-full ring-2 ring-neutral overflow-hidden bg-neutral-light-active">
                <Image src={displayAvatar} alt="Avatar" fill className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0.5 right-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white shadow-lg hover:bg-accent/90 transition-colors"
                title="Thay ảnh đại diện"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              {hasAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute top-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
                  title="Xóa ảnh đại diện"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <div className="text-center">
              {avatarFile && <p className="text-[11px] text-neutral-dark truncate max-w-[120px]">{avatarFile.name}</p>}
              {removeAvatar && !avatarFile && <p className="text-[11px] text-red-500">Ảnh sẽ bị xóa khi lưu</p>}
              <p className="text-[11px] text-neutral-dark/60 mt-1">JPG, PNG · Tối đa 5MB</p>
            </div>
          </div>

          {/* Identity */}
          <div className="flex-1 w-full space-y-3">
            <div>
              <p className="text-xl font-bold text-primary">{form.fullName || "—"}</p>
              <p className="text-sm text-neutral-dark">{form.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">{(form.role || "ADMIN").toUpperCase()}</span>
              <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600">Đang hoạt động</span>
            </div>
            <div className="pt-2 border-t border-neutral text-xs text-neutral-dark">
              <span className="font-medium text-primary">ID:</span> <span className="font-mono">{user.id || "—"}</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ══ SECTION 2: Personal Info Form ══ */}
      <SectionCard icon={Pencil} title="Thông tin cá nhân" desc="Cập nhật thông tin liên hệ và chi tiết cá nhân">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Full name */}
            <div>
              <FieldLabel>Họ và tên *</FieldLabel>
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nhập họ và tên" className={profileErrors.fullName ? inputErrorCls : inputCls} />
              <FieldError msg={profileErrors.fullName} />
            </div>

            {/* Phone */}
            <div>
              <FieldLabel>Số điện thoại</FieldLabel>
              <input name="phone" type="tel" inputMode="numeric" value={form.phone} onChange={handleChange} placeholder="0912 345 678" className={profileErrors.phone ? inputErrorCls : inputCls} />
              <FieldError msg={profileErrors.phone} />
            </div>

            {/* Gender */}
            <div>
              <FieldLabel>Giới tính</FieldLabel>
              <div className="relative">
                <select name="gender" value={form.gender} onChange={handleChange} className={`${selectCls} pr-9`}>
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-dark" />
              </div>
            </div>

            {/* Email readonly */}
            <div>
              <FieldLabel hint="(không thể thay đổi)">Email</FieldLabel>
              <input value={form.email} readOnly className={readonlyCls} />
            </div>
          </div>

          {/* Date of birth */}
          <div>
            <FieldLabel>Ngày sinh</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { field: "day" as const, placeholder: "Ngày", options: days },
                  { field: "month" as const, placeholder: "Tháng", options: months },
                  { field: "year" as const, placeholder: "Năm", options: years },
                ] as const
              ).map(({ field, placeholder, options }) => (
                <div key={field} className="relative">
                  <select value={dob[field]} onChange={(e) => handleDobChange(field, e.target.value)} className={[selectCls, "pr-8 text-sm", profileErrors.dob ? "border-promotion" : ""].join(" ")}>
                    <option value="">{placeholder}</option>
                    {options.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-dark" />
                </div>
              ))}
            </div>
            <FieldError msg={profileErrors.dob} />
          </div>

          {/* Role readonly */}
          <div>
            <FieldLabel hint="(không thể thay đổi)">Vai trò</FieldLabel>
            <input value={form.role} readOnly className={readonlyCls} />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!isDirty || saving}
              className={[
                "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all",
                isDirty && !saving ? "bg-accent text-white hover:bg-accent/90 shadow-sm hover:shadow-md active:scale-95 cursor-pointer" : "bg-neutral text-neutral-dark cursor-not-allowed opacity-60",
              ].join(" ")}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
