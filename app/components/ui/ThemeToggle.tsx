"use client";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";
interface ToggleSwitchProps {
   className?: string;
}
export default function ToggleSwitch({ className = "" }: ToggleSwitchProps) {
   const { isDark, toggleTheme, mounted } = useTheme();
   if (!mounted) {
      return null;
   }
   return (
      <div
         onClick={toggleTheme}
         className={`hidden xl:block fixed z-100 left-3 top-[60vh] w-10 h-28 rounded-full cursor-pointer shadow-lg opacity-70 hover:opacity-100 transition-all duration-300 ${
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
               isDark ? "top-1" : "top-15"
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
