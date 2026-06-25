"use client";

import { useCompareStore } from "@/(client)/compare/compareStore";
import { GitCompareArrows } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { ICON_BTN_CLASS } from "../_libs/constants";

export const CompareButton = memo(() => {
  const router = useRouter();
  const { items } = useCompareStore();
  return (
    <button onClick={() => router.push("/compare")} className={ICON_BTN_CLASS} title="So sánh">
      <GitCompareArrows className="w-5 h-5 lg:w-6 lg:h-6" />
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
