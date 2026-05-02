// EmailVerificationSuccess.tsx
"use client";

import { Popzy } from "@/components/Modal";
import React, { useState } from "react";

interface EmailVerificationModalProps {
   email: string;
   isOpen: boolean;
   onClose: () => void;
   onResend?: () => Promise<void>;
   onChangeEmail?: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
   email,
   isOpen,
   onClose,
   onResend,
   onChangeEmail,
}) => {
   const [resending, setResending] = useState(false);
   const [resent, setResent] = useState(false);
   const [countdown, setCountdown] = useState(0);

   const isGmail = email.toLowerCase().includes("@gmail.com");

   const handleResend = async () => {
      if (resending || countdown > 0) return;
      setResending(true);
      try {
         await onResend?.();
         setResent(true);
         setCountdown(60);
         const interval = setInterval(() => {
            setCountdown((prev) => {
               if (prev <= 1) {
                  clearInterval(interval);
                  return 0;
               }
               return prev - 1;
            });
         }, 1000);
      } finally {
         setResending(false);
      }
   };

   const handleChangeEmail = () => {
      onClose();
      onChangeEmail?.();
   };

   return (
      <Popzy
         isOpen={isOpen}
         onClose={onClose}
         closeMethods={["button"]}
         enableScrollLock
         content={
            <div className="overflow-hidden">
               {/* Gradient top bar — dùng rounded để khớp modal, không margin âm */}
               <div
                  className="h-1 rounded-t-xl -mx-5 -mt-5 mb-6"
                  style={{
                     background:
                        "linear-gradient(90deg, rgb(var(--accent)) 0%, rgb(var(--accent-dark)) 50%, rgb(var(--promotion)) 100%)",
                  }}
               />

               {/* Icon */}
               <div
                  className="relative w-17 h-17 rounded-full bg-accent-light border border-accent-light-active flex items-center justify-center mx-auto mb-4"
                  style={{ width: 68, height: 68 }}
               >
                  <svg
                     width="28"
                     height="28"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="rgb(var(--accent))"
                     strokeWidth="1.8"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  >
                     <rect x="2" y="4" width="20" height="16" rx="2" />
                     <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <div className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-full bg-green-500 border-2 border-[rgb(var(--neutral-light))] flex items-center justify-center">
                     <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                     >
                        <path d="M20 6 9 17l-5-5" />
                     </svg>
                  </div>
               </div>

               {/* Heading */}
               <h2 className="text-center text-[18px] font-bold tracking-tight text-primary mb-1.5">
                  Đăng ký thành công! 🎉
               </h2>
               <p className="text-center text-[13px] leading-relaxed text-neutral-darker mb-4">
                  Vui lòng xác nhận địa chỉ email để kích hoạt tài khoản của
                  bạn.
               </p>

               {/* Email chip */}
               <div className="flex items-center gap-2 bg-accent-light border border-accent-light-active rounded-[10px] px-3 py-2.5 mb-3">
                  <svg
                     width="15"
                     height="15"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="rgb(var(--accent))"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     className="shrink-0"
                  >
                     <rect x="2" y="4" width="20" height="16" rx="2" />
                     <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span className="text-[13px] font-semibold text-accent-dark break-all">
                     {email}
                  </span>
               </div>

               {/* Notice */}
               <div className="flex gap-2 items-start bg-[#fffbeb] dark:bg-[rgb(49_40_11/0.55)] border border-[#fde68a] dark:border-[rgb(120_100_30/0.4)] rounded-[10px] px-3 py-2.5 mb-4">
                  <svg
                     width="14"
                     height="14"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="#d97706"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     className="shrink-0 mt-[1px]"
                  >
                     <circle cx="12" cy="12" r="10" />
                     <path d="M12 8v4m0 4h.01" />
                  </svg>
                  <p className="text-[12px] leading-relaxed m-0 text-[#92400e] dark:text-[#fcd34d]">
                     Kiểm tra{" "}
                     <strong className="font-semibold">Hộp thư đến</strong> hoặc
                     thư mục{" "}
                     <strong className="font-semibold">Spam / Quảng cáo</strong>{" "}
                     nếu không thấy email.
                  </p>
               </div>

               {/* Gmail button */}
               {isGmail && (
                  <button
                     className="w-full px-3.5 py-[11px] flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover active:bg-accent-active text-neutral-light border-none rounded-[10px] text-[14px] font-semibold cursor-pointer transition-colors mb-2"
                     onClick={() =>
                        window.open(
                           "https://mail.google.com",
                           "_blank",
                           "noopener,noreferrer",
                        )
                     }
                  >
                     <svg
                        width="17"
                        height="17"
                        viewBox="0 0 48 48"
                        fill="none"
                     >
                        <path
                           fill="white"
                           opacity=".9"
                           d="M44 24c0-1.1-.1-2.2-.3-3.2H24v6.1h11.3c-.5 2.6-2 4.8-4.2 6.3v5.2h6.8C41.3 35 44 29.9 44 24z"
                        />
                        <path
                           fill="white"
                           opacity=".78"
                           d="M24 44c5.4 0 10-1.8 13.3-4.8l-6.8-5.2c-1.8 1.2-4.1 1.9-6.5 1.9-5 0-9.3-3.4-10.8-7.9H6.2v5.3C9.5 39.7 16.3 44 24 44z"
                        />
                        <path
                           fill="white"
                           opacity=".65"
                           d="M13.2 28c-.4-1.2-.7-2.5-.7-3.9s.2-2.7.7-3.9v-5.3H6.2C4.8 17.5 4 20.6 4 24s.8 6.5 2.2 9.1l7-5.1z"
                        />
                        <path
                           fill="white"
                           opacity=".85"
                           d="M24 13.2c2.8 0 5.3 1 7.3 2.8l5.5-5.5C33.9 7.5 29.3 5.6 24 5.6c-7.7 0-14.5 4.3-17.8 10.7l7 5.3C14.7 16.6 19 13.2 24 13.2z"
                        />
                     </svg>
                     Mở Gmail để xác nhận
                     <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(255,255,255,.75)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                     >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                     </svg>
                  </button>
               )}

               {/* Resend button */}
               <button
                  className="w-full px-3.5 py-[11px] flex items-center justify-center gap-2 bg-neutral-light hover:bg-accent-light text-primary hover:text-accent border border-neutral hover:border-accent rounded-[10px] text-[14px] font-medium cursor-pointer transition-all mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleResend}
                  disabled={resending || countdown > 0}
               >
                  <svg
                     width="15"
                     height="15"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     className={resending ? "animate-spin" : ""}
                  >
                     <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                  </svg>
                  {resending
                     ? "Đang gửi..."
                     : countdown > 0
                       ? `Gửi lại sau ${countdown}s`
                       : "Gửi lại email xác nhận"}
               </button>

               {resent && countdown > 0 && (
                  <p className="text-center text-[12px] text-green-500 font-medium mb-2">
                     ✓ Email xác nhận đã được gửi lại!
                  </p>
               )}

               {/* Divider */}
               <div className="flex items-center gap-2.5 my-3">
                  <div className="flex-1 h-px bg-neutral" />
                  <span className="text-[11px] text-neutral-dark">hoặc</span>
                  <div className="flex-1 h-px bg-neutral" />
               </div>

               {/* Change email */}
               <button
                  className="flex items-center justify-center gap-1.5 w-full bg-transparent border-none text-[13px] font-medium text-neutral-dark hover:text-accent cursor-pointer transition-colors"
                  onClick={handleChangeEmail}
               >
                  <svg
                     width="13"
                     height="13"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2.5"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  >
                     <path d="m12 19-7-7 7-7" />
                     <path d="M19 12H5" />
                  </svg>
                  Đổi email khác
               </button>
            </div>
         }
      />
   );
};

export default EmailVerificationModal;
