"use client";

import { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useCategoryMenuStore } from "@/store/categoryMenu.store";

const CategoryMegaMenu = memo(() => {
  const isOpen = useCategoryMenuStore((s) => s.isOpen);
  const toggle = useCategoryMenuStore((s) => s.toggle);
  const close = useCategoryMenuStore((s) => s.close);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Tự đóng khi đổi route — vẫn giữ làm lưới an toàn
  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  return (
    <>
      <button
        onClick={toggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={[
          "p-2.5 px-5 rounded-lg flex items-center gap-2 transition-colors duration-150 text-white",
          "backdrop-blur-md border border-white/30",
          isOpen ? "bg-white/35" : "bg-white/20 hover:bg-white/30",
        ].join(" ")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-200 ${isOpen ? "rotate-90" : "rotate-0"}`}>
          <path d="M4.7041 4H10.7041V10H4.7041V4Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.7041 4H20.7041V10H14.7041V4Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.7041 14H10.7041V20H4.7041V14Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M14.7041 17C14.7041 17.7956 15.0202 18.5587 15.5828 19.1213C16.1454 19.6839 16.9085 20 17.7041 20C18.4998 20 19.2628 19.6839 19.8254 19.1213C20.388 18.5587 20.7041 17.7956 20.7041 17C20.7041 16.2044 20.388 15.4413 19.8254 14.8787C19.2628 14.3161 18.4998 14.3161 15.5828 14.8787C15.0202 15.4413 14.7041 16.2044 14.7041 17Z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm font-medium whitespace-nowrap cursor-pointer">Danh mục</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}>
          <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {mounted &&
        createPortal(
          <div
            aria-hidden="true"
            onClick={close}
            className={["fixed inset-0 z-40 transition-opacity duration-300 bg-black/50 backdrop-blur-[2px]", isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"].join(" ")}
          />,
          document.body,
        )}
    </>
  );
});

CategoryMegaMenu.displayName = "CategoryMegaMenu";

export default CategoryMegaMenu;
