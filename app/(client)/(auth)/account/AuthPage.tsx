// AuthPage
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LoginForm from "./login/LoginForm";
import RegisterForm from "./register/RegisterForm";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import apiRequest from "@/lib/api";
import EmailVerificationModal from "./register/EmailVerificationSuccess";

const AuthPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const returnUrl = searchParams.get("redirect") ? decodeURIComponent(searchParams.get("redirect")!) : "/";

  // Derive trực tiếp từ tabParam, không dùng effect
  const [activeTab, setActiveTab] = useState<"login" | "register">(tabParam === "register" ? "register" : "login");
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Init từ URL một lần duy nhất khi component mount — không setState trong effect
  const verifiedParam = searchParams.get("verified");
  const [verifiedStatus] = useState<"success" | "invalid" | null>(verifiedParam === "success" || verifiedParam === "invalid" ? verifiedParam : null);

  // Chỉ dùng effect cho side effect thật sự: clean URL (không setState ở đây)
  useEffect(() => {
    if (verifiedStatus) {
      router.replace("/account", { scroll: false });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResendEmail = async () => {
    if (!registeredEmail) return;
    await apiRequest.post("/auth/resend-verification", { email: registeredEmail }, { noAuth: true });
  };

  const handleRegisterSuccess = (email: string) => {
    setRegisteredEmail(email);
    setModalOpen(true);
    setActiveTab("login");
  };

  return (
    <div className="container py-4 sm:py-6 lg:py-8 min-h-[70vh]">
      {/* Modal nằm ở AuthPage — không bị unmount khi đổi tab */}
      <EmailVerificationModal
        email={registeredEmail ?? ""}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onResend={handleResendEmail}
        onChangeEmail={() => {
          setRegisteredEmail(null);
          setModalOpen(false);
          setActiveTab("register");
        }}
      />

      <div className="pb-4 sm:pb-6">
        <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Tài khoản" }]} />
      </div>

      {/* Banner kết quả verify email từ link trong hộp thư */}
      {verifiedStatus === "success" && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span>Email xác nhận thành công! Đăng nhập để tiếp tục.</span>
        </div>
      )}

      {verifiedStatus === "invalid" && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
          <span>Liên kết đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu gửi lại email xác nhận.</span>
        </div>
      )}

      {/* Banner xem lại — chỉ hiện khi modal đóng nhưng vẫn còn email */}
      {registeredEmail && !modalOpen && (
        <div className="mb-4 p-3 bg-accent-light border border-accent-light-active rounded-lg flex items-center justify-between gap-3 text-sm">
          <span className="text-accent-dark">
            Đang chờ xác nhận email <strong className="font-semibold">{registeredEmail}</strong>
          </span>
          <button type="button" onClick={() => setModalOpen(true)} className="shrink-0 text-accent font-medium hover:underline cursor-pointer">
            Xem lại
          </button>
        </div>
      )}

      <div className="md:hidden mb-6">
        <div className="relative flex border-b border-neutral">
          <div
            className="absolute bottom-0 h-0.5 bg-accent transition-all duration-300 ease-in-out"
            style={{
              width: "50%",
              left: activeTab === "login" ? "0%" : "50%",
            }}
          />
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === "login" ? "text-primary" : "text-neutral-darker hover:text-primary"}`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === "register" ? "text-primary" : "text-neutral-darker hover:text-primary"}`}
          >
            Đăng ký
          </button>
        </div>
      </div>

      <div className="md:hidden">{activeTab === "login" ? <LoginForm returnUrl={returnUrl} /> : <RegisterForm onSuccess={handleRegisterSuccess} />}</div>

      <div className="hidden md:grid md:grid-cols-2 gap-0">
        <div className="border-r border-neutral">
          <LoginForm returnUrl={returnUrl} />
        </div>
        <div>
          <RegisterForm onSuccess={handleRegisterSuccess} />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
