"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
interface WelcomeAnimationProps {
   userName: string;
   onComplete?: () => void;
}
export default function WelcomeAnimation({
   userName,
   onComplete,
}: WelcomeAnimationProps) {
   const [stage, setStage] = useState<"show" | "fade" | "complete">("complete");
   const [shouldShow, setShouldShow] = useState(false);
   // useEffect(() => {
      const lastShown = localStorage.getItem("welcomeAnimationLastShown");
   //    const today = new Date().toDateString();
   //    if (lastShown !== today) {
   setShouldShow(true);
   setStage("show");
   //       localStorage.setItem("welcomeAnimationLastShown", today);
   //    } else {
   //       onComplete?.();
   //    }
   // }, [onComplete]);

   useEffect(() => {
      if (!shouldShow) return;
      const fadeTimer = setTimeout(() => setStage("fade"), 3000);
      const completeTimer = setTimeout(() => {
         setStage("complete");
         onComplete?.();
      }, 3500);
      return () => {
         clearTimeout(fadeTimer);
         clearTimeout(completeTimer);
      };
   }, [shouldShow, onComplete]);
   if (stage === "complete" || !shouldShow) return null;
   return (
      <>
         <div
            className={`fixed inset-0 z-9999 bg-white flex items-center justify-center transition-opacity duration-500 ${
               stage === "fade" ? "opacity-0" : "opacity-100"
            }`}
         >
            <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
               <div className="w-full md:w-1/2 max-w-md">
                  <Image
                     src="/welcome.png"
                     alt="Welcome"
                     width={500}
                     height={700}
                     priority
                  />
               </div>
               <div className="w-full md:w-1/2 max-w-lg text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                     Xin chào, <span className="text-accent">{userName}!</span>
                  </h1>
                  <p className="text-lg text-primary mb-6 leading-relaxed">
                     Chào mừng bạn đến với ChoCongNghe 👋 Nơi cung cấp các sản
                     phẩm công nghệ chính hãng với giá tốt và dịch vụ uy tín.
                  </p>

                  <p className="text-base text-primary mb-8 leading-relaxed">
                     Để mang đến cho bạn trải nghiệm mua sắm phù hợp nhất, hãy
                     dành ít phút chia sẻ nhu cầu của bạn nhé!
                  </p>
               </div>
            </div>
         </div>
      </>
   );
}
