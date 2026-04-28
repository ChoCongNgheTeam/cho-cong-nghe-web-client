"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Smartphone, Clock, MapPin, Check, X, AlertTriangle, LogOut, Loader2, KeyRound, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useToasty } from "@/components/Toast";
import apiRequest from "@/lib/api";
import { getMyLoginHistory, getMySessions, revokeSession, revokeAllSessions, type LoginHistory, type ActiveSession } from "../_libs/audit";
import { formatRelativeDate } from "@/helpers/formatRelativeDate";

// ─── Types ─────────────────────────────────────────────────────────────────────

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
type PwdErrors = Partial<Record<keyof PasswordForm, string>>;

// ─── Shared UI ─────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors";
const inputErrCls =
  "w-full rounded-xl border border-promotion bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-promotion/30 focus:border-promotion transition-colors";

function SectionCard({ icon: Icon, title, desc, children }: { icon: React.ElementType; title: string; desc?: string; children: React.ReactNode }) {
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
      <div className="px-6 py-6 space-y-4">{children}</div>
    </section>
  );
}

const validatePwd = (p: string) => ({
  length: p.length >= 8,
  upper: /[A-Z]/.test(p),
  lower: /[a-z]/.test(p),
  number: /[0-9]/.test(p),
  special: /[!@#$%^&*(),.?":{}|<>]/.test(p),
});

function PwdReq({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? <Check className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <X className="h-3.5 w-3.5 text-neutral-dark/40 shrink-0" />}
      <span className={met ? "text-green-600" : "text-neutral-dark"}>{text}</span>
    </div>
  );
}

// ─── Change Password ───────────────────────────────────────────────────────────

function ChangePasswordSection() {
  const { success, error } = useToasty();
  const [form, setForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<PwdErrors>({});
  const pwdRules = validatePwd(form.newPassword);

  const validate = (): boolean => {
    const e: PwdErrors = {};
    if (!form.currentPassword) e.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (!form.newPassword) e.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (!Object.values(pwdRules).every(Boolean)) e.newPassword = "Mật khẩu chưa đủ điều kiện";
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Mật khẩu không khớp";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await apiRequest.patch("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      success("Đổi mật khẩu thành công");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      error("Đổi mật khẩu thất bại — kiểm tra lại mật khẩu hiện tại");
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ field, label, showKey }: { field: keyof PasswordForm; label: string; showKey: keyof typeof show }) => (
    <div>
      <label className="block text-xs font-semibold text-neutral-dark uppercase tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? "text" : "password"}
          className={errors[field] ? inputErrCls + " pr-10" : inputCls + " pr-10"}
          value={form[field]}
          onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
        />
        <button type="button" onClick={() => setShow((p) => ({ ...p, [showKey]: !p[showKey] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary">
          {show[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {errors[field] && <p className="mt-1 text-xs text-promotion">{errors[field]}</p>}
    </div>
  );

  return (
    <SectionCard icon={KeyRound} title="Đổi mật khẩu" desc="Sử dụng mật khẩu mạnh để bảo vệ tài khoản">
      <Field field="currentPassword" label="Mật khẩu hiện tại" showKey="current" />
      <Field field="newPassword" label="Mật khẩu mới" showKey="next" />

      {form.newPassword && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-xl border border-neutral bg-neutral-light-active px-4 py-3">
          <PwdReq met={pwdRules.length} text="Ít nhất 8 ký tự" />
          <PwdReq met={pwdRules.upper} text="Chữ hoa (A-Z)" />
          <PwdReq met={pwdRules.lower} text="Chữ thường (a-z)" />
          <PwdReq met={pwdRules.number} text="Chứa số (0-9)" />
          <PwdReq met={pwdRules.special} text="Ký tự đặc biệt" />
        </div>
      )}

      <Field field="confirmPassword" label="Xác nhận mật khẩu mới" showKey="confirm" />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-neutral-light hover:bg-primary/90 shadow-sm active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
        >
          {saving ? (
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
    </SectionCard>
  );
}

// ─── Active Sessions ───────────────────────────────────────────────────────────

function SessionsSection() {
  const { success, error } = useToasty();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMySessions();
      setSessions(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    try {
      await revokeSession(id);
      setSessions((p) => p.filter((s) => s.id !== id));
      success("Thu hồi phiên thành công");
    } catch {
      error("Không thể thu hồi phiên");
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    try {
      await revokeAllSessions();
      await load();
      success("Đã đăng xuất tất cả thiết bị khác");
    } catch {
      error("Không thể thực hiện");
    } finally {
      setRevokingAll(false);
    }
  };

  const others = sessions.filter((s) => !s.isCurrent);

  return (
    <SectionCard icon={Smartphone} title="Thiết bị đăng nhập" desc="Quản lý các phiên đang hoạt động">
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={["flex items-start justify-between gap-3 rounded-xl border px-4 py-3", s.isCurrent ? "border-accent/30 bg-accent/5" : "border-neutral bg-neutral-light-active"].join(" ")}
            >
              <div className="flex items-start gap-3 min-w-0">
                <Smartphone className={`h-4 w-4 mt-0.5 shrink-0 ${s.isCurrent ? "text-accent" : "text-neutral-dark"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {s.deviceName ?? "Unknown device"} · {s.browser ?? "Unknown browser"}
                    {s.isCurrent && <span className="ml-2 text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">Hiện tại</span>}
                  </p>
                  <p className="text-xs text-neutral-dark mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {s.location ?? "—"} · {s.ip ?? "—"}
                  </p>
                  {s.lastUsedAt && <p className="text-xs text-neutral-dark">Dùng lần cuối: {formatRelativeDate(s.lastUsedAt)}</p>}
                </div>
              </div>
              {!s.isCurrent && (
                <button
                  onClick={() => handleRevoke(s.id)}
                  disabled={revokingId === s.id}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-600 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {revokingId === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogOut className="h-3 w-3" />}
                  Thu hồi
                </button>
              )}
            </div>
          ))}

          {others.length > 0 && (
            <button
              type="button"
              onClick={handleRevokeAll}
              disabled={revokingAll}
              className="w-full rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-100 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {revokingAll ? (
                <>
                  <Loader2 className="inline h-3.5 w-3.5 animate-spin mr-1.5" />
                  Đang đăng xuất...
                </>
              ) : (
                `Đăng xuất tất cả ${others.length} thiết bị khác`
              )}
            </button>
          )}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Login History ─────────────────────────────────────────────────────────────

function LoginHistorySection() {
  const [history, setHistory] = useState<LoginHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getMyLoginHistory({ page: p, limit: 15 });
      if (p === 1) setHistory(res.data);
      else setHistory((prev) => [...prev, ...res.data]);
      setHasMore(p < res.pagination.totalPages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <SectionCard icon={Clock} title="Lịch sử đăng nhập" desc="Theo dõi các lần đăng nhập gần đây">
      <div className="rounded-xl border border-neutral overflow-hidden divide-y divide-neutral">
        {history.map((h) => (
          <div key={h.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 py-3">
            <span className={["inline-flex items-center justify-center h-7 w-7 rounded-lg shrink-0", h.isSuccess ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"].join(" ")}>
              {h.isSuccess ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{h.browser ?? h.userAgent ?? "Unknown browser"}</p>
              <p className="text-xs text-neutral-dark mt-0.5 flex flex-wrap gap-x-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {h.location ?? "—"}
                </span>
                <span className="font-mono">{h.ip ?? "—"}</span>
                {h.failReason && <span className="text-red-500">{h.failReason}</span>}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-neutral-dark">{formatRelativeDate(h.createdAt)}</p>
              <p className={`text-[10px] font-semibold mt-0.5 ${h.isSuccess ? "text-green-600" : "text-red-500"}`}>{h.isSuccess ? "Thành công" : "Thất bại"}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
          </div>
        )}
      </div>

      {hasMore && !loading && (
        <button
          type="button"
          onClick={() => load(page + 1)}
          className="mx-auto mt-2 flex items-center gap-2 rounded-xl border border-neutral px-4 py-2 text-xs font-semibold text-primary hover:bg-neutral-light-active transition cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Tải thêm
        </button>
      )}
    </SectionCard>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function SecuritySettingsView() {
  return (
    <div className="space-y-6">
      <ChangePasswordSection />
      <SessionsSection />
      <LoginHistorySection />
    </div>
  );
}
