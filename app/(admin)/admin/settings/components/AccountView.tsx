"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Check, ChevronDown, Eye, EyeOff, KeyRound, Loader2, LogOut, MapPin, Pencil, ShieldCheck, Smartphone, Trash2, UserCircle, X, AlertTriangle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToasty } from "@/components/Toast";
import apiRequest from "@/lib/api";

/* ─── types ─── */
type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  role: string;
  avatarImage: string;
};
type Dob = { day: string; month: string; year: string };
type PwdForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
type ProfileErrors = Partial<Record<keyof ProfileForm | "dob", string>>;
type PwdErrors = Partial<Record<keyof PwdForm, string>>;

/* ─── style ─── */
const cls = {
  input:
    "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors",
  inputErr:
    "w-full rounded-xl border border-promotion bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-promotion/30 focus:border-promotion transition-colors",
  select:
    "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors cursor-pointer",
  readonly: "w-full rounded-xl border border-neutral bg-neutral-light-active px-3.5 py-2.5 text-sm text-primary/60 cursor-not-allowed",
};

const validatePwd = (p: string) => ({
  length: p.length >= 8,
  upper: /[A-Z]/.test(p),
  lower: /[a-z]/.test(p),
  number: /[0-9]/.test(p),
  special: /[!@#$%^&*(),.?":{}|<>]/.test(p),
});

const isValidPhone = (p: string) => p === "" || /^(\+84|0)[0-9]{8,10}$/.test(p.replace(/\s/g, ""));

/* ─── sub-components ─── */
function Card({ icon: Icon, title, desc, children }: { icon: React.ElementType; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm overflow-hidden">
      <div className="border-b border-neutral px-6 py-4 bg-neutral-light-active/40 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Icon className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-primary">{title}</h2>
          {desc && <p className="text-xs text-neutral-dark mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="block text-xs font-semibold text-neutral-dark uppercase tracking-wide mb-1.5">
      {children}
      {hint && <span className="ml-1.5 normal-case font-normal text-neutral-dark/60">{hint}</span>}
    </span>
  );
}

function FieldErr({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-promotion">{msg}</p>;
}

function PwdReq({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? <Check className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <X className="h-3.5 w-3.5 text-neutral-dark/40 shrink-0" />}
      <span className={met ? "text-green-600" : "text-neutral-dark"}>{text}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════ */
export default function AccountView() {
  const { user, loading, refreshUser } = useAuth();
  const { success, error } = useToasty();
  const fileRef = useRef<HTMLInputElement>(null);

  /* profile */
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  /* password */
  const [pwd, setPwd] = useState<PwdForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdErrors, setPwdErrors] = useState<PwdErrors>({});

  /* 2FA */
  const [twoFaSms, setTwoFaSms] = useState(true);
  const [twoFaEmail, setTwoFaEmail] = useState(false);

  /* devices — replace DEVICES with real API: GET /auth/sessions */
  const [devices, setDevices] = useState([
    {
      id: "d1",
      name: "MacBook Pro",
      browser: "Chrome 124",
      location: "Biên Hòa, VN",
      time: "Hôm nay, 09:12",
      current: true,
    },
    {
      id: "d2",
      name: "iPhone 15",
      browser: "Safari 17",
      location: "TP. HCM, VN",
      time: "Hôm qua, 21:45",
      current: false,
    },
  ]);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  /* login history — replace with real API: GET /auth/login-history */
  const loginHistory = [
    {
      id: "h1",
      browser: "Chrome 124 · MacBook Pro",
      ip: "113.160.12.4",
      location: "Biên Hòa, VN",
      time: "Hôm nay, 09:12",
      success: true,
    },
    {
      id: "h2",
      browser: "Safari 17 · iPhone 15",
      ip: "27.65.80.14",
      location: "TP. HCM, VN",
      time: "Hôm qua, 21:45",
      success: true,
    },
    {
      id: "h3",
      browser: "Unknown",
      ip: "194.87.65.2",
      location: "Moscow, RU",
      time: "24/04/2026, 03:11",
      success: false,
    },
  ];

  const currentYear = new Date().getFullYear();
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i);

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

  useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    },
    [avatarPreview],
  );

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

  const pwdRules = validatePwd(pwd.newPassword);
  const strengthScore = Object.values(pwdRules).filter(Boolean).length;
  const strengthBar = [
    { color: "bg-promotion", label: "Yếu", text: "text-promotion" },
    { color: "bg-promotion", label: "Yếu", text: "text-promotion" },
    { color: "bg-yellow-400", label: "Trung bình", text: "text-yellow-500" },
    { color: "bg-accent", label: "Khá", text: "text-accent" },
    { color: "bg-green-500", label: "Mạnh", text: "text-green-500" },
  ][Math.min(strengthScore, 5) - 1] ?? {
    color: "bg-promotion",
    label: "Yếu",
    text: "text-promotion",
  };

  /* ── validate ── */
  const validateProfile = () => {
    const errs: ProfileErrors = {};
    const name = form.fullName.trim();
    if (!name) errs.fullName = "Vui lòng nhập họ và tên";
    else if (name.length < 2) errs.fullName = "Tối thiểu 2 ký tự";
    else if (name.length > 100) errs.fullName = "Tối đa 100 ký tự";
    if (form.phone && !isValidPhone(form.phone)) errs.phone = "Số điện thoại không hợp lệ (VD: 0999999999)";
    const dobFilled = [dob.day, dob.month, dob.year].filter(Boolean).length;
    if (dobFilled > 0 && dobFilled < 3) errs.dob = "Vui lòng chọn đầy đủ ngày, tháng, năm";
    else if (dobFilled === 3) {
      const age = currentYear - Number(dob.year);
      if (age < 13) errs.dob = "Tuổi phải từ 13 trở lên";
      if (age > 120) errs.dob = "Năm sinh không hợp lệ";
    }
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePassword = () => {
    const errs: PwdErrors = {};
    if (!pwd.currentPassword) errs.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (!pwd.newPassword) errs.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (pwd.newPassword.length < 8) errs.newPassword = "Tối thiểu 8 ký tự";
    else if (pwd.newPassword === pwd.currentPassword) errs.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    if (!pwd.confirmPassword) errs.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (pwd.newPassword !== pwd.confirmPassword) errs.confirmPassword = "Mật khẩu không khớp";
    setPwdErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── handlers ── */
  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (profileErrors[name as keyof ProfileErrors])
      setProfileErrors((p) => {
        const n = { ...p };
        delete n[name as keyof ProfileErrors];
        return n;
      });
  };

  const handleDob = (field: keyof Dob, value: string) => {
    setDob((p) => ({ ...p, [field]: value }));
    if (profileErrors.dob)
      setProfileErrors((p) => {
        const n = { ...p };
        delete n.dob;
        return n;
      });
  };

  const handlePwdField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPwd((p) => ({ ...p, [name]: value }));
    if (pwdErrors[name as keyof PwdErrors])
      setPwdErrors((p) => {
        const n = { ...p };
        delete n[name as keyof PwdErrors];
        return n;
      });
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !isDirty || !validateProfile()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("fullName", form.fullName.trim());
      if (form.gender) fd.append("gender", form.gender);
      if (dob.day && dob.month && dob.year) fd.append("dateOfBirth", new Date(Number(dob.year), Number(dob.month) - 1, Number(dob.day)).toISOString());
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

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingPwd || !validatePassword()) return;
    setSavingPwd(true);
    try {
      await apiRequest.post("/auth/change-password", {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
        confirmPassword: pwd.confirmPassword,
      });
      success("Đổi mật khẩu thành công");
      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwdErrors({});
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string }; message?: string })?.data?.message || (err as { message?: string })?.message || "Đổi mật khẩu thất bại";
      error(msg);
      if (msg.toLowerCase().includes("hiện tại") || msg.toLowerCase().includes("current")) setPwdErrors({ currentPassword: "Mật khẩu hiện tại không đúng" });
    } finally {
      setSavingPwd(false);
    }
  };

  const handleRevokeDevice = async (id: string) => {
    setRevokingId(id);
    try {
      await apiRequest.delete(`/auth/sessions/${id}`);
      setDevices((p) => p.filter((d) => d.id !== id));
      success("Đã thu hồi quyền truy cập thiết bị");
    } catch {
      error("Không thể thu hồi thiết bị");
    } finally {
      setRevokingId(null);
    }
  };

  const displayAvatar = avatarPreview || (!removeAvatar && form.avatarImage) || "/images/avatar.png";
  const hasAvatar = !!(avatarPreview || (!removeAvatar && form.avatarImage));

  if (loading)
    return (
      <div className="flex items-center justify-center py-16 text-neutral-dark text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
      </div>
    );
  if (!user) return <div className="rounded-2xl border border-neutral bg-neutral-light p-6 text-sm text-primary">Bạn chưa đăng nhập</div>;

  return (
    <div className="space-y-6">
      {/* ── 1. Avatar + identity ── */}
      <Card icon={UserCircle} title="Ảnh đại diện & Danh tính">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-accent/40 to-accent/10 blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-28 h-28 rounded-full ring-2 ring-neutral overflow-hidden bg-neutral-light-active">
                <Image src={displayAvatar} alt="Avatar" fill className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0.5 right-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white shadow-lg hover:bg-accent/90 transition-colors"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              {hasAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute top-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
            <p className="text-[11px] text-neutral-dark/60">JPG, PNG · Tối đa 5MB</p>
          </div>
          <div className="flex-1 w-full space-y-2">
            <p className="text-xl font-bold text-primary">{form.fullName || "—"}</p>
            <p className="text-sm text-neutral-dark">{form.email}</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">{(form.role || "ADMIN").toUpperCase()}</span>
              <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600">Đang hoạt động</span>
            </div>
            <p className="text-xs text-neutral-dark pt-1 border-t border-neutral">
              <span className="font-medium text-primary">ID:</span> <span className="font-mono">{user.id}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* ── 2. Personal info ── */}
      <Card icon={Pencil} title="Thông tin cá nhân" desc="Cập nhật thông tin liên hệ và chi tiết cá nhân">
        <form onSubmit={handleSaveProfile} noValidate className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Họ và tên *</Label>
              <input name="fullName" value={form.fullName} onChange={handleField} placeholder="Nhập họ và tên" className={profileErrors.fullName ? cls.inputErr : cls.input} />
              <FieldErr msg={profileErrors.fullName} />
            </div>
            <div>
              <Label>Số điện thoại</Label>
              <input name="phone" type="tel" inputMode="numeric" value={form.phone} onChange={handleField} placeholder="0912 345 678" className={profileErrors.phone ? cls.inputErr : cls.input} />
              <FieldErr msg={profileErrors.phone} />
            </div>
            <div>
              <Label>Giới tính</Label>
              <div className="relative">
                <select name="gender" value={form.gender} onChange={handleField} className={`${cls.select} pr-9`}>
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-dark" />
              </div>
            </div>
            <div>
              <Label hint="(không thể thay đổi)">Email</Label>
              <input value={form.email} readOnly className={cls.readonly} />
            </div>
          </div>

          <div>
            <Label>Ngày sinh</Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  {
                    field: "day" as const,
                    placeholder: "Ngày",
                    options: days,
                  },
                  {
                    field: "month" as const,
                    placeholder: "Tháng",
                    options: months,
                  },
                  {
                    field: "year" as const,
                    placeholder: "Năm",
                    options: years,
                  },
                ] as const
              ).map(({ field, placeholder, options }) => (
                <div key={field} className="relative">
                  <select value={dob[field]} onChange={(e) => handleDob(field, e.target.value)} className={`${cls.select} pr-8 text-sm ${profileErrors.dob ? "border-promotion" : ""}`}>
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
            <FieldErr msg={profileErrors.dob} />
          </div>

          <div>
            <Label hint="(không thể thay đổi)">Vai trò</Label>
            <input value={form.role} readOnly className={cls.readonly} />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!isDirty || saving}
              className={[
                "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all",
                isDirty && !saving ? "bg-accent text-white hover:bg-accent/90 shadow-sm active:scale-95 cursor-pointer" : "bg-neutral text-neutral-dark cursor-not-allowed opacity-60",
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
      </Card>

      {/* ── 3. Password ── */}
      <Card icon={KeyRound} title="Đổi mật khẩu" desc="Cập nhật mật khẩu định kỳ để bảo vệ tài khoản">
        <form onSubmit={handleChangePwd} noValidate className="space-y-5">
          <div>
            <Label>Mật khẩu hiện tại</Label>
            <div className="relative">
              <input
                type={showPwd.current ? "text" : "password"}
                name="currentPassword"
                value={pwd.currentPassword}
                onChange={handlePwdField}
                placeholder="Nhập mật khẩu hiện tại"
                className={`${pwdErrors.currentPassword ? cls.inputErr : cls.input} pr-10`}
              />
              <button type="button" onClick={() => setShowPwd((s) => ({ ...s, current: !s.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary">
                {showPwd.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldErr msg={pwdErrors.currentPassword} />
          </div>

          <hr className="border-neutral" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Mật khẩu mới</Label>
              <div className="relative">
                <input
                  type={showPwd.next ? "text" : "password"}
                  name="newPassword"
                  value={pwd.newPassword}
                  onChange={handlePwdField}
                  placeholder="Tối thiểu 8 ký tự"
                  className={`${pwdErrors.newPassword ? cls.inputErr : cls.input} pr-10`}
                />
                <button type="button" onClick={() => setShowPwd((s) => ({ ...s, next: !s.next }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary">
                  {showPwd.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldErr msg={pwdErrors.newPassword} />
            </div>
            <div>
              <Label>Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <input
                  type={showPwd.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={pwd.confirmPassword}
                  onChange={handlePwdField}
                  placeholder="Nhập lại mật khẩu mới"
                  className={`${pwdErrors.confirmPassword ? cls.inputErr : cls.input} pr-10`}
                />
                <button type="button" onClick={() => setShowPwd((s) => ({ ...s, confirm: !s.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary">
                  {showPwd.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldErr msg={pwdErrors.confirmPassword} />
            </div>
          </div>

          {pwd.newPassword.length > 0 && (
            <div className="space-y-2.5 p-4 rounded-xl border border-neutral bg-neutral-light-active/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-dark font-medium">Độ mạnh mật khẩu</span>
                <span className={`font-bold ${strengthBar.text}`}>{strengthBar.label}</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((l) => (
                  <div key={l} className={["h-1.5 flex-1 rounded-full transition-all", l <= strengthScore ? strengthBar.color : "bg-neutral"].join(" ")} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 pt-1">
                <PwdReq met={pwdRules.length} text="Ít nhất 8 ký tự" />
                <PwdReq met={pwdRules.upper} text="Chữ hoa (A-Z)" />
                <PwdReq met={pwdRules.lower} text="Chữ thường (a-z)" />
                <PwdReq met={pwdRules.number} text="Chứa số (0-9)" />
                <PwdReq met={pwdRules.special} text="Ký tự đặc biệt (!@#...)" />
              </div>
            </div>
          )}

          <div className="flex gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
            <ShieldCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <ul className="text-xs text-primary/70 space-y-0.5">
              <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
              <li>Sử dụng mật khẩu khác nhau cho mỗi tài khoản</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingPwd}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-neutral-light hover:bg-primary/90 shadow-sm active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
            >
              {savingPwd ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang đổi...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Đổi mật khẩu
                </>
              )}
            </button>
          </div>
        </form>
      </Card>

      {/* ── 4. 2FA + Devices (2 cols) ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card icon={ShieldCheck} title="Xác thực hai lớp (2FA)" desc="Bảo vệ tài khoản với mã xác thực">
          <div className="space-y-3">
            {[
              {
                key: "sms",
                label: "2FA qua SMS",
                desc: "Gửi mã qua tin nhắn",
                checked: twoFaSms,
                set: setTwoFaSms,
              },
              {
                key: "email",
                label: "2FA qua Email",
                desc: "Gửi mã qua email",
                checked: twoFaEmail,
                set: setTwoFaEmail,
              },
            ].map((r) => (
              <label
                key={r.key}
                className="flex items-center justify-between rounded-xl border border-neutral bg-neutral-light-active px-4 py-3 cursor-pointer hover:bg-neutral-light transition-colors"
              >
                <span>
                  <span className="block text-sm font-medium text-primary">{r.label}</span>
                  <span className="block text-xs text-neutral-dark mt-0.5">{r.desc}</span>
                </span>
                <input type="checkbox" checked={r.checked} onChange={(e) => r.set(e.target.checked)} className="h-4 w-4 accent-accent ml-4 shrink-0" />
              </label>
            ))}
            {!twoFaSms && !twoFaEmail && (
              <div className="flex gap-2 rounded-xl border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">Bật ít nhất một phương thức 2FA.</p>
              </div>
            )}
          </div>
        </Card>

        <Card icon={Smartphone} title="Thiết bị đăng nhập" desc="Quản lý các phiên đang hoạt động">
          <div className="space-y-3">
            {devices.map((d) => (
              <div
                key={d.id}
                className={["flex items-start justify-between gap-3 rounded-xl border px-4 py-3", d.current ? "border-accent/30 bg-accent/5" : "border-neutral bg-neutral-light-active"].join(" ")}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Smartphone className={`h-4 w-4 mt-0.5 shrink-0 ${d.current ? "text-accent" : "text-neutral-dark"}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {d.name} · {d.browser}
                      {d.current && <span className="ml-2 text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">Hiện tại</span>}
                    </p>
                    <p className="text-xs text-neutral-dark mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {d.location} · {d.time}
                    </p>
                  </div>
                </div>
                {!d.current && (
                  <button
                    onClick={() => handleRevokeDevice(d.id)}
                    disabled={revokingId === d.id}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-600 shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {revokingId === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogOut className="h-3 w-3" />}
                    Thu hồi
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 5. Login history ── */}
      <Card icon={Clock} title="Lịch sử đăng nhập" desc="Theo dõi các lần đăng nhập gần đây">
        <div className="rounded-xl border border-neutral overflow-hidden divide-y divide-neutral">
          {loginHistory.map((h) => (
            <div key={h.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 py-3">
              <span className={["inline-flex items-center justify-center h-7 w-7 rounded-lg shrink-0", h.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"].join(" ")}>
                {h.success ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">{h.browser}</p>
                <p className="text-xs text-neutral-dark mt-0.5 flex flex-wrap gap-x-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {h.location}
                  </span>
                  <span className="font-mono">{h.ip}</span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-neutral-dark">{h.time}</p>
                <p className={`text-[10px] font-semibold mt-0.5 ${h.success ? "text-green-600" : "text-red-500"}`}>{h.success ? "Thành công" : "Thất bại"}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
