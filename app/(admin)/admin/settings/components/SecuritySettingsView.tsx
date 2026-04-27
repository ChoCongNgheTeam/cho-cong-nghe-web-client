"use client";

import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
  Smartphone,
  Clock,
  MapPin,
  Check,
  X,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { useToasty } from "@/components/Toast";
import apiRequest from "@/lib/api";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
type PwdErrors = Partial<Record<keyof PasswordForm, string>>;

const inputCls =
  "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors";
const inputErrorCls =
  "w-full rounded-xl border border-promotion bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-promotion/30 focus:border-promotion transition-colors";

const validatePwdRules = (password: string) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
});

function SectionCard({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: React.ElementType;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
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

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
      ) : (
        <X className="h-3.5 w-3.5 text-neutral-dark/40 shrink-0" />
      )}
      <span className={met ? "text-green-600" : "text-neutral-dark"}>{text}</span>
    </div>
  );
}

/* ── mock data – replace with real API ── */
const DEVICES = [
  { id: "d1", name: "MacBook Pro", browser: "Chrome 124", location: "Biên Hòa, VN", time: "Hôm nay, 09:12", current: true },
  { id: "d2", name: "iPhone 15", browser: "Safari 17", location: "TP. HCM, VN", time: "Hôm qua, 21:45", current: false },
  { id: "d3", name: "Windows PC", browser: "Edge 124", location: "Hà Nội, VN", time: "26/03/2026, 08:15", current: false },
];

const LOGIN_HISTORY = [
  { id: "h1", browser: "Chrome 124 · MacBook Pro", ip: "113.160.12.4", location: "Biên Hòa, VN", time: "Hôm nay, 09:12", success: true },
  { id: "h2", browser: "Safari 17 · iPhone 15", ip: "27.65.80.14", location: "TP. HCM, VN", time: "Hôm qua, 21:45", success: true },
  { id: "h3", browser: "Unknown · Unknown", ip: "194.87.65.2", location: "Moscow, RU", time: "24/04/2026, 03:11", success: false },
  { id: "h4", browser: "Edge 124 · Windows PC", ip: "118.70.45.8", location: "Hà Nội, VN", time: "26/03/2026, 08:15", success: true },
];

export default function SecuritySettingsView() {
  const { success, error } = useToasty();

  /* ── change password state ── */
  const [pwd, setPwd] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdErrors, setPwdErrors] = useState<PwdErrors>({});

  /* ── 2FA state ── */
  const [twoFaSms, setTwoFaSms] = useState(true);
  const [twoFaEmail, setTwoFaEmail] = useState(false);

  /* ── devices state ── */
  const [devices, setDevices] = useState(DEVICES);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  /* ── password rules ── */
  const pwdRules = validatePwdRules(pwd.newPassword);
  const strengthScore = Object.values(pwdRules).filter(Boolean).length;
  const strengthMeta = [
    { color: "bg-promotion", label: "Yếu", textColor: "text-promotion" },
    { color: "bg-promotion", label: "Yếu", textColor: "text-promotion" },
    { color: "bg-yellow-400", label: "Trung bình", textColor: "text-yellow-500" },
    { color: "bg-accent", label: "Khá", textColor: "text-accent" },
    { color: "bg-green-500", label: "Mạnh", textColor: "text-green-500" },
  ];
  const strength = strengthMeta[Math.min(strengthScore, 5) - 1] ?? strengthMeta[0];

  const validatePassword = (): boolean => {
    const errs: PwdErrors = {};
    if (!pwd.currentPassword) errs.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (!pwd.newPassword) errs.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (pwd.newPassword.length < 8) errs.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
    else if (pwd.newPassword === pwd.currentPassword) errs.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    if (!pwd.confirmPassword) errs.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    else if (pwd.newPassword !== pwd.confirmPassword) errs.confirmPassword = "Mật khẩu xác nhận không khớp";
    setPwdErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPwd((prev) => ({ ...prev, [name]: value }));
    if (pwdErrors[name as keyof PwdErrors]) {
      setPwdErrors((prev) => { const n = { ...prev }; delete n[name as keyof PwdErrors]; return n; });
    }
  };

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingPwd) return;
    if (!validatePassword()) return;
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
      const msg =
        (err as { data?: { message?: string }; message?: string })?.data?.message ||
        (err as { message?: string })?.message ||
        "Đổi mật khẩu thất bại";
      error(msg);
      if (msg.toLowerCase().includes("hiện tại") || msg.toLowerCase().includes("current")) {
        setPwdErrors({ currentPassword: "Mật khẩu hiện tại không đúng" });
      }
    } finally {
      setSavingPwd(false);
    }
  };

  const handleRevokeDevice = async (id: string) => {
    setRevokingId(id);
    try {
      // await apiRequest.delete(`/auth/devices/${id}`);
      await new Promise((r) => setTimeout(r, 800)); // mock
      setDevices((prev) => prev.filter((d) => d.id !== id));
      success("Đã thu hồi quyền truy cập thiết bị");
    } catch {
      error("Không thể thu hồi thiết bị");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Change password ── */}
      <SectionCard icon={Lock} title="Đổi mật khẩu" desc="Cập nhật mật khẩu định kỳ để tăng bảo mật">
        <form onSubmit={handleChangePwd} noValidate className="space-y-5">
          {/* current */}
          <div>
            <span className="block text-xs font-semibold text-neutral-dark uppercase tracking-wide mb-1.5">
              Mật khẩu hiện tại
            </span>
            <div className="relative">
              <input
                type={showPwd.current ? "text" : "password"}
                name="currentPassword"
                value={pwd.currentPassword}
                onChange={handlePwdChange}
                placeholder="Nhập mật khẩu hiện tại"
                className={`${pwdErrors.currentPassword ? inputErrorCls : inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => ({ ...s, current: !s.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary transition-colors"
              >
                {showPwd.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pwdErrors.currentPassword && (
              <p className="mt-1.5 text-xs text-promotion">{pwdErrors.currentPassword}</p>
            )}
          </div>

          <hr className="border-neutral" />

          <div className="grid gap-4 sm:grid-cols-2">
            {/* new */}
            <div>
              <span className="block text-xs font-semibold text-neutral-dark uppercase tracking-wide mb-1.5">
                Mật khẩu mới
              </span>
              <div className="relative">
                <input
                  type={showPwd.next ? "text" : "password"}
                  name="newPassword"
                  value={pwd.newPassword}
                  onChange={handlePwdChange}
                  placeholder="Tối thiểu 8 ký tự"
                  className={`${pwdErrors.newPassword ? inputErrorCls : inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => ({ ...s, next: !s.next }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary transition-colors"
                >
                  {showPwd.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwdErrors.newPassword && (
                <p className="mt-1.5 text-xs text-promotion">{pwdErrors.newPassword}</p>
              )}
            </div>
            {/* confirm */}
            <div>
              <span className="block text-xs font-semibold text-neutral-dark uppercase tracking-wide mb-1.5">
                Xác nhận mật khẩu mới
              </span>
              <div className="relative">
                <input
                  type={showPwd.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={pwd.confirmPassword}
                  onChange={handlePwdChange}
                  placeholder="Nhập lại mật khẩu mới"
                  className={`${pwdErrors.confirmPassword ? inputErrorCls : inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => ({ ...s, confirm: !s.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary transition-colors"
                >
                  {showPwd.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwdErrors.confirmPassword && (
                <p className="mt-1.5 text-xs text-promotion">{pwdErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* strength */}
          {pwd.newPassword.length > 0 && (
            <div className="space-y-2.5 p-4 rounded-xl border border-neutral bg-neutral-light-active/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-dark font-medium">Độ mạnh mật khẩu</span>
                <span className={`font-bold ${strength.textColor}`}>{strength.label}</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={[
                      "h-1.5 flex-1 rounded-full transition-all duration-300",
                      level <= strengthScore ? strength.color : "bg-neutral",
                    ].join(" ")}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 pt-1">
                <PasswordRequirement met={pwdRules.length} text="Ít nhất 8 ký tự" />
                <PasswordRequirement met={pwdRules.uppercase} text="Chữ hoa (A-Z)" />
                <PasswordRequirement met={pwdRules.lowercase} text="Chữ thường (a-z)" />
                <PasswordRequirement met={pwdRules.number} text="Chứa số (0-9)" />
                <PasswordRequirement met={pwdRules.special} text="Ký tự đặc biệt (!@#...)" />
              </div>
            </div>
          )}

          {/* tip */}
          <div className="flex gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
            <ShieldCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <ul className="text-xs text-primary/70 space-y-0.5 list-none">
              <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
              <li>Sử dụng mật khẩu khác nhau cho mỗi tài khoản</li>
              <li>Thay đổi mật khẩu định kỳ để bảo mật tốt hơn</li>
            </ul>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingPwd}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-neutral-light hover:bg-primary/90 shadow-sm active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {savingPwd ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Đang đổi...</>
              ) : (
                <><KeyRound className="h-4 w-4" />Đổi mật khẩu</>
              )}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* ── 2FA + Devices (2 col on large) ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 2FA */}
        <SectionCard icon={ShieldCheck} title="Xác thực hai lớp (2FA)" desc="Bảo vệ tài khoản với mã xác thực">
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-xl border border-neutral bg-neutral-light-active px-4 py-3 cursor-pointer hover:bg-neutral-light transition-colors">
              <span>
                <span className="block text-sm font-medium text-primary">2FA qua SMS</span>
                <span className="block text-xs text-neutral-dark mt-0.5">Gửi mã xác thực qua tin nhắn</span>
              </span>
              <input
                type="checkbox"
                checked={twoFaSms}
                onChange={(e) => setTwoFaSms(e.target.checked)}
                className="h-4 w-4 accent-accent ml-4 shrink-0"
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-neutral bg-neutral-light-active px-4 py-3 cursor-pointer hover:bg-neutral-light transition-colors">
              <span>
                <span className="block text-sm font-medium text-primary">2FA qua Email</span>
                <span className="block text-xs text-neutral-dark mt-0.5">Gửi mã xác thực qua email</span>
              </span>
              <input
                type="checkbox"
                checked={twoFaEmail}
                onChange={(e) => setTwoFaEmail(e.target.checked)}
                className="h-4 w-4 accent-accent ml-4 shrink-0"
              />
            </label>
            {!twoFaSms && !twoFaEmail && (
              <div className="flex gap-2 rounded-xl border border-amber-400/30 bg-amber-500/5 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Bật ít nhất một phương thức 2FA để bảo vệ tài khoản tốt hơn.</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Devices */}
        <SectionCard icon={Smartphone} title="Thiết bị đăng nhập" desc="Quản lý các thiết bị đang hoạt động">
          <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.id}
                className={[
                  "flex items-start justify-between gap-3 rounded-xl border px-4 py-3",
                  device.current
                    ? "border-accent/30 bg-accent/5"
                    : "border-neutral bg-neutral-light-active",
                ].join(" ")}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Smartphone className={`h-4 w-4 mt-0.5 shrink-0 ${device.current ? "text-accent" : "text-neutral-dark"}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {device.name} · {device.browser}
                      {device.current && (
                        <span className="ml-2 text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                          Hiện tại
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-neutral-dark mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {device.location} · {device.time}
                    </p>
                  </div>
                </div>
                {!device.current && (
                  <button
                    onClick={() => handleRevokeDevice(device.id)}
                    disabled={revokingId === device.id}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-600 shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {revokingId === device.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <LogOut className="h-3 w-3" />
                    )}
                    Thu hồi
                  </button>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Login history ── */}
      <SectionCard icon={Clock} title="Lịch sử đăng nhập" desc="Theo dõi các lần đăng nhập gần đây">
        <div className="rounded-xl border border-neutral overflow-hidden">
          <div className="divide-y divide-neutral">
            {LOGIN_HISTORY.map((log) => (
              <div key={log.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 py-3">
                <span
                  className={[
                    "inline-flex items-center justify-center h-7 w-7 rounded-lg shrink-0",
                    log.success
                      ? "bg-green-500/10 text-green-600"
                      : "bg-red-500/10 text-red-500",
                  ].join(" ")}
                >
                  {log.success ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{log.browser}</p>
                  <p className="text-xs text-neutral-dark mt-0.5 flex flex-wrap gap-x-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {log.location}
                    </span>
                    <span className="font-mono">{log.ip}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-neutral-dark">{log.time}</p>
                  <p
                    className={`text-[10px] font-semibold mt-0.5 ${log.success ? "text-green-600" : "text-red-500"}`}
                  >
                    {log.success ? "Thành công" : "Thất bại"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}