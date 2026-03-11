"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollBarTop() {
   const [progress, setProgress] = useState(0);
   const [showBackToTop, setShowBackToTop] = useState(false);

   useEffect(() => {
      const handleScroll = () => {
         const scrollTop = window.scrollY;
         const docHeight =
            document.documentElement.scrollHeight - window.innerHeight;
         const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
         setProgress(Math.min(percent, 100));
         setShowBackToTop(scrollTop > 300);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
   }, []);

   const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   return (
      <>
         {/* Progress bar */}
         {progress > 0 && (
            <div className="fixed top-0 left-0 right-0 z-9999 h-0.75 bg-transparent">
               <div
                  className="h-full bg-accent transition-[width] duration-100 ease-out"
                  style={{ width: `${progress}%` }}
               />
            </div>
         )}

         {/* Back to top button */}
         <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={`fixed bottom-6 right-6 z-9998 w-10 h-10 rounded-xl bg-accent hover:bg-accent-hover active:bg-accent-active text-white flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
               showBackToTop
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-4 pointer-events-none"
            }`}
         >
            <ArrowUp size={18} strokeWidth={2.5} />
         </button>
      </>
   );
}
