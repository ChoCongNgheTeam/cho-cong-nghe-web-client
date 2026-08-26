"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Mail, KeyRound, Loader2 } from "lucide-react";
import { requestEmailOtp, verifyEmailOtp } from "./OtpHandler";
import type { User as AuthUser } from "./types";

type Step = "closed" | "email" | "otp";

interface EmailOtpLoginProps {
  onSuccess: (user: AuthUser, accessToken: string) => void;
  onError: (msg: string) => void;
  disabled?: boolean;
}

const RESEND_COOLDOWN_SECONDS = 60; // khớp với RESEND_COOLDOWN_MS ở otp.service.ts (BE)

// ApiError (lib/api/errors) extends Error — message đã là message thật từ
// server (errorData?.message), không cần đào sâu vào response/data như axios.
const extractErrorMessage = (err: unknown, fallback: string): string => {
  return err instanceof Error && err.message ? err.message : fallback;
};

const socialButtonClass =
  "w-full flex items-center justify-center gap-2 border border-neutral py-2.5 rounded-lg hover:bg-neutral hover:border-neutral-dark cursor-pointer transition-colors disabled:opacity-50 bg-neutral-light";

const inputCls =
  "w-full pl-10 pr-3 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark";

export function EmailOtpLogin({ onSuccess, onError, disabled }: EmailOtpLoginProps) {
  const [step, setStep] = useState<Step>("closed");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const isAnyLoading = disabled || requestLoading || verifyLoading;

  const sendOtp = async () => {
    setLocalError(null);
    if (!email.trim() || !email.includes("@")) {
      setLocalError("Email không hợp lệ");
      return;
    }
    setRequestLoading(true);
    try {
      await requestEmailOtp(email.trim());
      setStep("otp");
      setCode("");
      startCooldown();
    } catch (err) {
      setLocalError(extractErrorMessage(err, "Không thể gửi mã OTP, vui lòng thử lại"));
    } finally {
      setRequestLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setLocalError("Vui lòng nhập đủ 6 số");
      return;
    }
    setLocalError(null);
    setVerifyLoading(true);
    try {
      const { user, accessToken } = await verifyEmailOtp(email.trim(), code);
      onSuccess(user, accessToken);
    } catch (err) {
      const msg = extractErrorMessage(err, "Mã OTP không đúng hoặc đã hết hạn");
      setLocalError(msg);
      onError(msg);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleCodeChange = (raw: string) => {
    setCode(raw.replace(/[^0-9]/g, "").slice(0, 6));
  };

  // ── Step: closed — chỉ là 1 nút giống các nút social khác ──
  if (step === "closed") {
    return (
      <button type="button" onClick={() => setStep("email")} className={socialButtonClass} disabled={isAnyLoading}>
        <Mail className="w-5 h-5 text-neutral-darker" />
        <span className="text-primary font-medium text-base">Đăng nhập bằng mã OTP qua Email</span>
      </button>
    );
  }

  // ── Step: email — nhập email để nhận mã ──
  if (step === "email") {
    return (
      <div className="border border-neutral rounded-lg p-4 space-y-3 bg-neutral-light">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            className={inputCls}
            disabled={isAnyLoading}
            autoComplete="email"
            autoFocus
          />
        </div>
        {localError && (
          <p className="text-sm text-promotion" role="alert">
            {localError}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setStep("closed");
              setLocalError(null);
            }}
            className="text-sm text-neutral-darker hover:text-primary transition-colors cursor-pointer px-1"
            disabled={isAnyLoading}
          >
            ← Quay lại
          </button>
          <button
            type="button"
            onClick={sendOtp}
            disabled={isAnyLoading}
            className="flex-1 bg-primary-dark text-neutral-light py-2.5 rounded-lg font-medium hover:bg-primary-hover transition cursor-pointer text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {requestLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {requestLoading ? "Đang gửi..." : "Gửi mã"}
          </button>
        </div>
      </div>
    );
  }

  // ── Step: otp — nhập mã 6 số vừa nhận ──
  // Không dùng thẻ <form> ở đây — component này được render bên trong
  // <form> của LoginForm (login user/password), lồng <form> trong <form>
  // là HTML không hợp lệ và khiến submit rơi nhầm vào form ngoài cùng
  // (gây navigate tới /account? theo GET mặc định, không gọi API nào cả).
  return (
    <div className="border border-neutral rounded-lg p-4 space-y-3 bg-neutral-light">
      <p className="text-sm text-neutral-darker">
        Mã xác thực đã được gửi tới <span className="font-medium text-primary">{email}</span>
      </p>

      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
        <input
          type="text"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleVerify();
            }
          }}
          placeholder="000000"
          inputMode="numeric"
          maxLength={6}
          className={`${inputCls} text-center tracking-[0.5em] font-semibold`}
          disabled={isAnyLoading}
          autoFocus
        />
      </div>

      {localError && (
        <p className="text-sm text-promotion" role="alert">
          {localError}
        </p>
      )}

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setLocalError(null);
          }}
          className="text-neutral-darker hover:text-primary transition-colors cursor-pointer"
          disabled={isAnyLoading}
        >
          ← Đổi email khác
        </button>

        {cooldown > 0 ? (
          <span className="text-neutral-dark">Gửi lại mã sau {cooldown}s</span>
        ) : (
          <button type="button" onClick={sendOtp} className="text-primary hover:underline cursor-pointer" disabled={isAnyLoading}>
            Gửi lại mã
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleVerify}
        disabled={isAnyLoading || code.length !== 6}
        className="w-full bg-primary-dark text-neutral-light py-2.5 rounded-lg font-medium hover:bg-primary-hover transition cursor-pointer text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {verifyLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {verifyLoading ? "Đang xác thực..." : "Xác nhận & Đăng nhập"}
      </button>
    </div>
  );
}
