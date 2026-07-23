"use client";

import { Search, X } from "lucide-react";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  /** Gọi khi nhấn Enter — thường dùng để "chốt" giá trị search (khác với onChange gõ từng ký tự) */
  onSubmit: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  /** Tailwind width class, mặc định "w-52" */
  widthClassName?: string;
}

/**
 * SearchBox — ô tìm kiếm dùng chung, thay cho pattern search input bị viết tay
 * lặp lại ở ~15 file (brands, attributes, products, promotions...).
 */
export function SearchBox({ value, onChange, onSubmit, onClear, placeholder = "Tìm kiếm...", widthClassName = "w-52" }: SearchBoxProps) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit(value);
        }}
        placeholder={placeholder}
        className={`pl-9 pr-8 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all ${widthClassName}`}
      />
      {value && (
        <button onClick={onClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary cursor-pointer">
          <X size={13} />
        </button>
      )}
    </div>
  );
}
