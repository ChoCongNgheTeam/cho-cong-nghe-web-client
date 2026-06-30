"use client";
import { useEffect, useState } from "react";
import { ChevronsUp } from "lucide-react";

export default function BackToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className={`px-2.5 py-2 w-auto h-10 rounded-xl bg-black hover:bg-accent-hover active:bg-accent-active
        text-white flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer
        ${show ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}
    >
      <div className="flex gap-1">
        <span className="hidden md:block text-sm font-medium">Lên đầu</span>
        <ChevronsUp size={18} strokeWidth={2.5} />
      </div>
    </button>
  );
}
