"use client";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

interface ToggleSwitchProps {
   defaultValue?: boolean;
   onChange?: (value: boolean) => void;
   className?: string;
}

export default function ToggleSwitch({
   defaultValue = false,
   onChange,
   className = "",
}: ToggleSwitchProps) {
   const [isDark, setIsDark] = useState(false);
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      setMounted(true);
      
      // CHỈ đọc từ localStorage, KHÔNG theo system preference
      const savedTheme = localStorage.getItem("theme");
      const shouldBeDark = savedTheme === "dark";
      
      setIsDark(shouldBeDark);
      
      // Force apply theme ngay khi mount
      const html = document.documentElement;
      if (shouldBeDark) {
         html.classList.add("dark");
         html.style.colorScheme = "dark";
      } else {
         html.classList.remove("dark");
         html.style.colorScheme = "light";
      }
   }, []);

   const handleToggle = () => {
      const newIsDark = !isDark;
      setIsDark(newIsDark);

      const html = document.documentElement;
      
      if (newIsDark) {
         html.classList.add("dark");
         html.style.colorScheme = "dark";
         localStorage.setItem("theme", "dark");
      } else {
         html.classList.remove("dark");
         html.style.colorScheme = "light";
         localStorage.setItem("theme", "light");
      }

      onChange?.(newIsDark);
   };

   // Prevent hydration mismatch
   if (!mounted) {
      return null;
   }

   return (
      <div
         onClick={handleToggle}
         className={`hidden xl:block fixed z-[100] left-3 top-[60vh] w-10 h-28 rounded-full cursor-pointer shadow-lg opacity-70 hover:opacity-100 transition-all duration-300 ${
            isDark ? "bg-neutral-dark" : "bg-primary-dark"
         } ${className}`}
      >
         {/* Label Dark */}
         <div
            className={`absolute top-4 left-0 w-full text-center text-xs font-medium transition-opacity duration-300 ${
               isDark
                  ? "opacity-100 text-neutral-light"
                  : "opacity-40 text-neutral"
            }`}
         >
            Dark
         </div>

         {/* Toggle button */}
         <div
            className={`absolute w-8 h-12 bg-neutral-light rounded-full left-1 shadow-md flex items-center justify-center transition-all duration-300 ${
               isDark ? "top-1" : "top-[60px]"
            }`}
         >
            {isDark ? (
               <Moon className="w-4 h-4 text-primary" />
            ) : (
               <Sun className="w-4 h-4 text-primary" />
            )}
         </div>

         {/* Label Light */}
         <div
            className={`absolute bottom-4 left-0 w-full text-center text-xs font-medium transition-opacity duration-300 ${
               isDark
                  ? "opacity-40 text-neutral"
                  : "opacity-100 text-neutral-light"
            }`}
         >
            Light
         </div>
      </div>
   );
}