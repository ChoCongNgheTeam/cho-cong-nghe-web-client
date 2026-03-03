"use client"; // ← Bắt buộc phải có dòng này
import { createContext, useContext, useState } from "react";

type FontSize = "small" | "large";

const FontSizeContext = createContext<{
   fontSize: FontSize;
   setFontSize: (size: FontSize) => void;
}>({ fontSize: "small", setFontSize: () => {} });

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
   const [fontSize, setFontSize] = useState<FontSize>("small");
   return (
      <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
         {children}
      </FontSizeContext.Provider>
   );
}

export function useFontSize() {
   return useContext(FontSizeContext);
}
