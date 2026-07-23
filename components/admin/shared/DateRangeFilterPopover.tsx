"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";

interface DateRangeFilterPopoverProps {
  dateFrom: string;
  dateTo: string;
  onApply: (from: string, to: string) => void;
  onClear: () => void;
  /** Nhãn trên nút bấm, mặc định "Ngày tạo" */
  label?: string;
  /** Tiêu đề trong popover, mặc định "Lọc theo ngày tạo" */
  popoverTitle?: string;
}

/**
 * DateRangeFilterPopover — popup lọc theo khoảng ngày dùng chung.
 * Lift nguyên từ `DateFilterPopover` viết tay trong brands/page.tsx (bản đầy
 * đủ nhất), thêm props `label`/`popoverTitle` để module khác tuỳ biến nhãn.
 */
export function DateRangeFilterPopover({ dateFrom, dateTo, onApply, onClear, label = "Ngày tạo", popoverTitle = "Lọc theo ngày tạo" }: DateRangeFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(dateFrom);
  const [to, setTo] = useState(dateTo);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFrom(dateFrom);
    setTo(dateTo);
  }, [dateFrom, dateTo]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasFilter = !!dateFrom || !!dateTo;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-[13px] transition-colors cursor-pointer ${
          hasFilter ? "border-accent bg-accent/5 text-accent font-medium" : "border-neutral bg-neutral-light text-primary hover:bg-neutral-light-active"
        }`}
      >
        <CalendarDays size={14} />
        {label}
        {hasFilter && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onClear();
              setOpen(false);
            }}
            className="ml-1 hover:text-promotion cursor-pointer"
          >
            <X size={11} />
          </span>
        )}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-30 bg-neutral-light border border-neutral rounded-xl shadow-lg p-4 w-72 space-y-3">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">{popoverTitle}</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-primary block mb-1">Từ ngày</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-2 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[11px] text-primary block mb-1">Đến ngày</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-2 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                onClear();
                setFrom("");
                setTo("");
                setOpen(false);
              }}
              className="flex-1 px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary hover:bg-neutral-light-active transition-colors cursor-pointer"
            >
              Xoá lọc
            </button>
            <button
              onClick={() => {
                onApply(from, to);
                setOpen(false);
              }}
              className="flex-1 px-3 py-1.5 text-[12px] bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors cursor-pointer font-medium"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
