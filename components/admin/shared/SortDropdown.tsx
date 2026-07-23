"use client";

export interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  options: SortOption[];
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
  ascLabel?: string;
  descLabel?: string;
}

const selectCls = "px-3 py-2 text-[12px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer";

/**
 * SortDropdown — cặp select "sắp xếp theo" + "chiều tăng/giảm" dùng chung,
 * thay cho 2 <select> bị viết tay lặp lại ở mỗi module (mỗi module tự định
 * nghĩa SortBy union riêng nên component này nhận options qua props).
 */
export function SortDropdown({ sortBy, sortOrder, options, onSortByChange, onSortOrderChange, ascLabel = "A → Z", descLabel = "Z → A" }: SortDropdownProps) {
  return (
    <>
      <select value={sortBy} onChange={(e) => onSortByChange(e.target.value)} className={selectCls}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value as "asc" | "desc")} className={selectCls}>
        <option value="asc">{ascLabel}</option>
        <option value="desc">{descLabel}</option>
      </select>
    </>
  );
}
