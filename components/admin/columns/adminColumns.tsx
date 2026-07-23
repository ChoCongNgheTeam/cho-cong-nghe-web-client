"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { AdminColumn } from "@/components/admin/AdminTables";

// SELECT COLUMN

/**
 * selectColumn — cột checkbox chọn dòng, thay pattern viết tay lặp lại ở
 * mọi TableXxx.tsx (TableBrands, TableAttributes, TableProducts...).
 */
export function selectColumn<T>(getId: (row: T) => string, selected: Set<string>, toggleOne: (id: string) => void): AdminColumn<T> {
  return {
    key: "_select",
    label: "",
    width: "w-10",
    align: "center",
    render: (row) => (
      <input
        type="checkbox"
        checked={selected.has(getId(row))}
        onChange={(e) => {
          e.stopPropagation();
          toggleOne(getId(row));
        }}
        className="w-3.5 h-3.5 rounded accent-accent cursor-pointer"
      />
    ),
  };
}

// STT COLUMN

/** sttColumn — cột số thứ tự theo trang, tính từ (page-1)*pageSize + index + 1 */
export function sttColumn<T>(page: number, pageSize: number): AdminColumn<T> {
  return {
    key: "_stt",
    label: "STT",
    width: "w-16",
    render: (_row, idx) => (page - 1) * pageSize + idx + 1,
  };
}

// STATUS DROPDOWN COLUMN

export interface StatusDropdownOption {
  value: string;
  label: string;
  /** Tailwind classes cho màu chữ + nền, vd "text-emerald-600 bg-emerald-50" */
  color: string;
}

interface StatusDropdownColumnParams<T> {
  label?: string;
  getId: (row: T) => string;
  /** Giá trị hiện tại (để so sánh, tránh gọi onChange khi chọn đúng option đang có) */
  getCurrentValue: (row: T) => string;
  /** Label + màu hiển thị cho giá trị hiện tại */
  getCurrentDisplay: (row: T) => { label: string; color: string };
  options: StatusDropdownOption[];
  openId: string | null;
  setOpenId: (id: string | null) => void;
  onChange: (row: T, value: string) => void;
  /** Vô hiệu hoá dropdown cho 1 số dòng, vd promotion đã hết hạn không cho đổi trạng thái */
  isDisabled?: (row: T) => boolean;
}

/**
 * statusDropdownColumn — cột trạng thái dạng dropdown-trong-bảng (bấm vào pill
 * để đổi trạng thái), thay pattern viết tay lặp lại (state `openStatusId` +
 * dropdown) ở TableBrands, TableAttributes, TablePromotions...
 */
export function statusDropdownColumn<T>({ label = "Trạng thái", getId, getCurrentValue, getCurrentDisplay, options, openId, setOpenId, onChange, isDisabled }: StatusDropdownColumnParams<T>): AdminColumn<T> {
  return {
    key: "_status",
    label,
    render: (row) => {
      const id = getId(row);
      const current = getCurrentDisplay(row);
      const isOpen = openId === id;
      const disabled = isDisabled?.(row) ?? false;
      return (
        <div className="relative inline-block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) setOpenId(isOpen ? null : id);
            }}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${current.color} ${disabled ? "cursor-default opacity-80" : "cursor-pointer"}`}
          >
            {current.label}
            {!disabled && <ChevronDown size={11} />}
          </button>
          {isOpen && !disabled && (
            <div className="absolute z-20 left-0 top-full mt-1 w-40 bg-neutral-light border border-neutral rounded-xl shadow-lg overflow-hidden">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (opt.value !== getCurrentValue(row)) onChange(row, opt.value);
                    setOpenId(null);
                  }}
                  className={`w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-neutral-light-active transition-colors cursor-pointer ${opt.color}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    },
  };
}

// ROW ACTION BUTTON

interface RowActionButtonProps {
  title: string;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  /** "default" = hover accent (xem/sửa), "danger" = hover đỏ (xoá),
   *  "success" = hover xanh lá (duyệt), "warning" = hover cam (từ chối/tạm dừng) */
  variant?: "default" | "danger" | "success" | "warning";
  disabled?: boolean;
}

const VARIANT_HOVER_CLASS: Record<NonNullable<RowActionButtonProps["variant"]>, string> = {
  default: "hover:bg-accent-light hover:text-accent",
  danger: "hover:bg-promotion-light hover:text-promotion",
  success: "hover:bg-emerald-50 hover:text-emerald-600",
  warning: "hover:bg-orange-50 hover:text-orange-500",
};

/**
 * RowActionButton — nút icon dùng trong cột hành động (_actions) của bảng.
 * Không phải column factory (vì bộ hành động mỗi module khác nhau — trash có
 * restore/hard-delete, reviews có approve...) mà là building block để module
 * tự lắp cột _actions của mình mà không phải copy lại className mỗi lần.
 */
export function RowActionButton({ title, children, href, onClick, variant = "default", disabled = false }: RowActionButtonProps) {
  const base = "w-7 h-7 flex items-center justify-center rounded-lg transition-colors";
  const activeCls = `${base} text-neutral-dark ${VARIANT_HOVER_CLASS[variant]}`;
  const disabledCls = `${base} text-neutral-dark/25 cursor-not-allowed`;

  if (href && !disabled) {
    return (
      <Link href={href} title={title} className={activeCls}>
        {children}
      </Link>
    );
  }

  return (
    <button title={title} onClick={disabled ? undefined : onClick} disabled={disabled} className={disabled ? disabledCls : `${activeCls} cursor-pointer`}>
      {children}
    </button>
  );
}
