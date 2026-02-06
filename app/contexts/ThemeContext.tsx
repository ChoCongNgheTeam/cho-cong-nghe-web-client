// contexts/ThemeContext.tsx
"use client";
import {
   createContext,
   useContext,
   useState,
   useEffect,
   ReactNode,
} from "react";

interface ThemeContextType {
   isDark: boolean;
   toggleTheme: () => void;
   mounted: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
   undefined,
);

export function ThemeProvider({ children }: { children: ReactNode }) {
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

   const toggleTheme = () => {
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
   };

   return (
      <ThemeContext.Provider value={{ isDark, toggleTheme, mounted }}>
         {children}
      </ThemeContext.Provider>
   );
}
