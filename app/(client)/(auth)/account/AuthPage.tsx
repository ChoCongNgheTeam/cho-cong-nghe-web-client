// AuthPage
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LoginForm from "./login/LoginForm";
import RegisterForm from "./register/RegisterForm";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";
import apiRequest from "@/lib/api";
import EmailVerificationModal from "./register/EmailVerificationSuccess";

const AuthPage = () => {
   const searchParams = useSearchParams();
   const tabParam = searchParams.get("tab");
   const returnUrl = searchParams.get("redirect")
      ? decodeURIComponent(searchParams.get("redirect")!)
      : "/";

   const [activeTab, setActiveTab] = useState<"login" | "register">(
      tabParam === "register" ? "register" : "login",
   );
   const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
   const [modalOpen, setModalOpen] = useState(false);

   useEffect(() => {
      if (tabParam === "register" || tabParam === "login") {
         setActiveTab(tabParam);
      }
   }, [tabParam]);

   const handleResendEmail = async () => {
      if (!registeredEmail) return;
      await apiRequest.post(
         "/auth/resend-verification",
         { email: registeredEmail },
         { noAuth: true },
      );
   };

   const handleRegisterSuccess = (email: string) => {
      setRegisteredEmail(email);
      setModalOpen(true);
      setActiveTab("login"); // chuyển tab bình thường, modal vẫn còn vì ở AuthPage
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
            <Breadcrumb
               items={[
                  { label: "Trang chủ", href: "/" },
                  { label: "Tài khoản" },
               ]}
            />
         </div>

         {/* Banner xem lại — chỉ hiện khi modal đóng nhưng vẫn còn email */}
         {registeredEmail && !modalOpen && (
            <div className="mb-4 p-3 bg-accent-light border border-accent-light-active rounded-lg flex items-center justify-between gap-3 text-sm">
               <span className="text-accent-dark">
                  Đang chờ xác nhận email{" "}
                  <strong className="font-semibold">{registeredEmail}</strong>
               </span>
               <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="shrink-0 text-accent font-medium hover:underline cursor-pointer"
               >
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
                  className={`flex-1 py-3 text-center font-medium transition-colors ${
                     activeTab === "login"
                        ? "text-primary"
                        : "text-neutral-darker hover:text-primary"
                  }`}
               >
                  Đăng nhập
               </button>
               <button
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 py-3 text-center font-medium transition-colors ${
                     activeTab === "register"
                        ? "text-primary"
                        : "text-neutral-darker hover:text-primary"
                  }`}
               >
                  Đăng ký
               </button>
            </div>
         </div>

         <div className="md:hidden">
            {activeTab === "login" ? (
               <LoginForm returnUrl={returnUrl} />
            ) : (
               <RegisterForm onSuccess={handleRegisterSuccess} />
            )}
         </div>

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
