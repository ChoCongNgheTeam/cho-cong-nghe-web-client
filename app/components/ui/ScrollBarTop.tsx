"use client";
import { useEffect, useState } from "react";

export default function ScrollBarTop() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-9999 h-0.75 bg-transparent">
      <div className="h-full bg-accent transition-[width] duration-100 ease-out" style={{ width: `${progress}%` }} />
    </div>
  );
}
