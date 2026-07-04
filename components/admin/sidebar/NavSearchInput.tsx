"use client";

import { Search, X } from "lucide-react";

interface NavSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  dark?: boolean;
}

export function NavSearchInput({ value, onChange, dark = false }: NavSearchInputProps) {
  return (
    <div className="px-2 pt-2 pb-1 shrink-0">
      <div className="relative">
        <Search size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${dark ? "text-white/40" : "text-neutral-dark"}`} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tìm chức năng..."
          className={`w-full pl-8 pr-7 py-1.5 text-[12.5px] rounded-lg outline-none transition-colors ${
            dark
              ? "bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15"
              : "bg-neutral-light-active text-primary placeholder:text-neutral-dark border border-neutral focus:bg-neutral-light-hover"
          }`}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            aria-label="Xoá tìm kiếm"
            className={`absolute right-2 top-1/2 -translate-y-1/2 ${dark ? "text-white/50 hover:text-white" : "text-neutral-dark hover:text-primary"}`}
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
