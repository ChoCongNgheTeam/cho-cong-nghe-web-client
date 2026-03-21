"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LoginForm from "./login/LoginForm";
import RegisterForm from "./register/RegisterForm";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";

const AuthPage = () => {
   const searchParams = useSearchParams();
   const tabParam = searchParams.get("tab");
   
   const returnUrl = searchParams.get("redirect")       
    ? decodeURIComponent(searchParams.get("redirect")!)
    : "/";

   const [activeTab, setActiveTab] = useState<"login" | "register">(
      tabParam === "register" ? "register" : "login",
   );

   useEffect(() => {
      if (tabParam === "register" || tabParam === "login") {
         setActiveTab(tabParam);
      }
   }, [tabParam]);

   return (
      <div className="container py-4 sm:py-6 lg:py-8 min-h-[70vh]">
         <div className="pb-4 sm:pb-6">
            <Breadcrumb
               items={[
                  { label: "Trang chủ", href: "/" },
                  { label: "Tài khoản" },
               ]}
            />
         </div>

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
            {activeTab === "login" ? <LoginForm returnUrl={returnUrl}/> : <RegisterForm />}
         </div>

         <div className="hidden md:grid md:grid-cols-2 gap-0">
            <div className="border-r border-neutral">
               <LoginForm returnUrl={returnUrl}/>
            </div>
            <div>
               <RegisterForm />
            </div>
         </div>
      </div>
   );
};

export default AuthPage;
