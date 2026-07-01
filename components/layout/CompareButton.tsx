"use client";

import { useCompareStore } from "@/store/compare/compare.store";
import { GitCompareArrows } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo } from "react";

export const CompareButton = memo(() => {
  const router = useRouter();
  const { items } = useCompareStore();
  return (
    <button
      onClick={() => router.push("/compare")}
      title="So sánh"
      className="inline-flex items-center gap-2 relative p-2 rounded-lg transition-colors duration-150 cursor-pointer hover:bg-white/10 active:bg-white/20"
    >
      <GitCompareArrows className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
      <span className="text-sm font-medium text-white whitespace-nowrap">So sánh</span>
      {items.length > 0 && (
        <span
          className="absolute -right-0.5 -bottom-0.5 min-w-[18px] h-[18px] px-[3px] flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm"
          style={{ background: "#fff", color: "#0f2050", boxShadow: "0 0 0 2px rgba(15,32,80,0.5)" }}
        >
          {items.length}
        </span>
      )}
    </button>
  );
});
CompareButton.displayName = "CompareButton";
