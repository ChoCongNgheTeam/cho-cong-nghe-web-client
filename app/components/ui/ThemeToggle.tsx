"use client";
import { useState, useEffect } from "react";

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
   const [isLight, setIsLight] = useState(defaultValue);

   // Load dark mode preference on mount
   useEffect(() => {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
         "(prefers-color-scheme: dark)"
      ).matches;
      const shouldBeDark =
         savedTheme === "dark" || (!savedTheme && prefersDark);

      setIsLight(!shouldBeDark); // isLight = true means light mode
      if (shouldBeDark) {
         document.documentElement.classList.add("dark");
      }
   }, []);

   const handleToggle = () => {
      const newIsLight = !isLight;
      setIsLight(newIsLight);

      // Update dark mode
      if (newIsLight) {
         // Switching to light mode
         document.documentElement.classList.remove("dark");
         localStorage.setItem("theme", "light");
      } else {
         // Switching to dark mode
         document.documentElement.classList.add("dark");
         localStorage.setItem("theme", "dark");
      }

      onChange?.(newIsLight);
   };

   return (
      <div
         onClick={handleToggle}
         className={`hidden xl:block fixed z-[100] left-3 top-[60vh] w-10 h-28 rounded-full cursor-pointer shadow-lg opacity-70  hover:opacity-100 transition-all duration-300 ${
            isLight ? "bg-primary-dark" : "bg-neutral-dark"
         } ${className}`}
      >
         <div
            className={`absolute top-4 left-0 w-full text-center text-xs font-medium transition-opacity duration-300 ${
               isLight
                  ? "opacity-100 text-neutral-light"
                  : "opacity-40 text-primary-darker"
            }`}
         >
            Dark
         </div>
         <div
            className={`absolute w-8 h-12 bg-neutral-light rounded-full left-1 shadow-md flex items-center justify-center text-[10px] font-semibold text-primary transition-all duration-300 ${
               isLight ? "top-[60px]" : "top-1"
            }`}
         >
            {isLight ? "Light" : "Dark"}
         </div>
         <div
            className={`absolute bottom-4 left-0 w-full text-center text-xs font-medium transition-opacity duration-300 ${
               isLight
                  ? "opacity-40 text-neutral"
                  : "opacity-100 text-neutral-light"
            }`}
         >
            Light
         </div>
      </div>
   );
}
