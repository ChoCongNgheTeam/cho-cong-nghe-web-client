"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileText, Loader2, ChevronDown } from "lucide-react";

type ExportFormat = "excel" | "csv";

interface ExportButtonProps {
  /** Gọi API export, trả về blob + filename */
  onExport: (format: ExportFormat) => Promise<{ blob: Blob; filename: string; count: number }>;
  label?: string;
  disabled?: boolean;
  onSuccess?: (count: number, format: ExportFormat) => void;
  onError?: (error: string) => void;
}

export function ExportButton({ onExport, label = "Export", disabled, onSuccess, onError }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExport = async (format: ExportFormat) => {
    setOpen(false);
    setLoading(format);
    try {
      const { blob, filename, count } = await onExport(format);

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      onSuccess?.(count, format);
    } catch (e: any) {
      onError?.(e?.message ?? "Đã xảy ra lỗi khi export");
    } finally {
      setLoading(null);
    }
  };

  const isLoading = !!loading;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !isLoading && !disabled && setOpen((v) => !v)}
        disabled={isLoading || disabled}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] font-medium transition-all
          ${
            isLoading || disabled
              ? "border-neutral text-neutral-dark/50 bg-neutral-light-active cursor-not-allowed opacity-60"
              : "border-neutral text-primary hover:bg-neutral-light-active cursor-pointer"
          }`}
      >
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        {isLoading ? (loading === "excel" ? "Đang tạo Excel..." : "Đang tạo CSV...") : label}
        {!isLoading && <ChevronDown size={12} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-48 bg-neutral-light border border-neutral rounded-xl shadow-lg z-30 overflow-hidden">
          <p className="px-3 py-2 text-[10px] font-semibold text-primary uppercase tracking-wider border-b border-neutral">Chọn định dạng</p>
          <button onClick={() => handleExport("excel")} className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-neutral-light-active text-left cursor-pointer">
            <FileSpreadsheet size={15} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-primary">Excel (.xlsx)</p>
              <p className="text-[11px] text-neutral-dark">Có định dạng, màu sắc</p>
            </div>
          </button>
          <button onClick={() => handleExport("csv")} className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-neutral-light-active text-left cursor-pointer border-t border-neutral">
            <FileText size={15} className="text-blue-500 shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-primary">CSV (.csv)</p>
              <p className="text-[11px] text-neutral-dark">Nhẹ, dùng với Google Sheets</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
