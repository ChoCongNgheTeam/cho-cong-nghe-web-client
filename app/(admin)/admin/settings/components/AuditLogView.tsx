"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardList, Search, Filter, AlertTriangle, Check, X, Shield, Package, Settings, UserCog, RefreshCw, ChevronDown, ChevronLeft, ChevronRight, Diff } from "lucide-react";
import { formatRelativeDate } from "@/helpers/formatRelativeDate";
import { getAuditLogs, type AuditLog, type AuditSeverity, type GetAuditLogsParams } from "../_libs/audit";

// ─── Config ───────────────────────────────────────────────────────────────────

const MODULE_OPTIONS = [
  { value: "", label: "Tất cả module" },
  { value: "product", label: "Sản phẩm" },
  { value: "order", label: "Đơn hàng" },
  { value: "review", label: "Đánh giá" },
  { value: "settings", label: "Cài đặt" },
  { value: "user", label: "Tài khoản" },
  { value: "auth", label: "Bảo mật" },
];

const SEVERITY_OPTIONS = [
  { value: "" as const, label: "Tất cả mức độ" },
  { value: "INFO" as const, label: "Info" },
  { value: "WARNING" as const, label: "Warning" },
  { value: "CRITICAL" as const, label: "Critical" },
];

const SEVERITY_STYLE: Record<AuditSeverity, { badge: string; dot: string }> = {
  INFO: { badge: "bg-blue-500/10 text-blue-600", dot: "bg-blue-500" },
  WARNING: { badge: "bg-amber-500/10 text-amber-600", dot: "bg-amber-500" },
  CRITICAL: { badge: "bg-red-500/10 text-red-500", dot: "bg-red-500" },
};

const MODULE_ICON: Record<string, React.ElementType> = {
  product: Package,
  order: Package,
  review: ClipboardList,
  settings: Settings,
  user: UserCog,
  auth: Shield,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterSelect({ value, onChange, options, icon: Icon }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; icon?: React.ElementType }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-dark pointer-events-none" />}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "rounded-xl border border-neutral bg-neutral-light py-2 pr-8 text-sm text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors cursor-pointer",
          Icon ? "pl-8" : "pl-3",
        ].join(" ")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-dark pointer-events-none" />
    </div>
  );
}

function DiffViewer({ diff }: { diff: { before?: Record<string, unknown>; after?: Record<string, unknown> } }) {
  const keys = [...new Set([...Object.keys(diff.before ?? {}), ...Object.keys(diff.after ?? {})])];
  if (keys.length === 0) return null;

  return (
    <div className="mt-2 rounded-lg border border-neutral overflow-hidden text-[11px] font-mono">
      {keys.map((k) => {
        const before = diff.before?.[k];
        const after = diff.after?.[k];
        const changed = JSON.stringify(before) !== JSON.stringify(after);
        return (
          <div key={k} className={`flex gap-2 px-3 py-1 ${changed ? "bg-amber-50 dark:bg-amber-950/20" : ""}`}>
            <span className="text-neutral-dark shrink-0 w-32 truncate">{k}</span>
            {changed ? (
              <>
                <span className="text-red-500 line-through truncate">{String(before ?? "—")}</span>
                <span className="text-neutral-dark">→</span>
                <span className="text-green-600 truncate">{String(after ?? "—")}</span>
              </>
            ) : (
              <span className="text-primary truncate">{String(before ?? "—")}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LogRow({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_STYLE[log.severity];
  const Icon = MODULE_ICON[log.module] ?? ClipboardList;

  return (
    <div className={`border-b border-neutral last:border-b-0 ${log.severity === "CRITICAL" ? "bg-red-500/[0.03]" : ""}`}>
      <button type="button" onClick={() => setExpanded((p) => !p)} className="w-full text-left px-4 py-3.5 flex gap-3 items-start hover:bg-neutral-light-active transition-colors">
        {/* Icon */}
        <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg shrink-0 mt-0.5 bg-neutral-light-active">
          <Icon className="h-3.5 w-3.5 text-neutral-dark" />
        </span>

        {/* Main */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sev.badge}`}>{log.severity}</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral text-neutral-dark">{log.module}</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral text-neutral-dark">{log.action}</span>
            {!log.isSuccess && <span className="text-[10px] font-semibold text-red-500">FAILED</span>}
          </div>
          <p className="text-[13px] font-medium text-primary leading-snug">{log.description}</p>
          <p className="text-[11px] text-neutral-dark">
            {log.userName ?? "Unknown"} · {log.userRole ?? "—"} · {log.ip ?? "—"} · {log.location ?? "—"}
          </p>
        </div>

        {/* Time + chevron */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className="text-[11px] text-neutral-dark whitespace-nowrap">{formatRelativeDate(log.createdAt)}</span>
          {(log.diff || log.errorMsg) && <ChevronDown className={`h-3.5 w-3.5 text-neutral-dark transition-transform ${expanded ? "rotate-180" : ""}`} />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (log.diff || log.errorMsg) && (
        <div className="px-4 pb-4 ml-11 space-y-2">
          {log.errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 px-3 py-2">
              <p className="text-xs text-red-600 font-mono">{log.errorMsg}</p>
            </div>
          )}
          {log.diff && <DiffViewer diff={log.diff} />}
        </div>
      )}
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function AuditLogView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<GetAuditLogsParams>({
    module: "",
    severity: "",
    isSuccess: "",
    search: "",
  });
  const [search, setSearch] = useState("");

  const fetch = useCallback(async (p: number, f: GetAuditLogsParams) => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        page: p,
        limit: 20,
        ...(f.module ? { module: f.module } : {}),
        ...(f.severity ? { severity: f.severity as AuditSeverity } : {}),
        ...(f.isSuccess !== "" ? { isSuccess: f.isSuccess as boolean } : {}),
        ...(f.search ? { search: f.search } : {}),
      });
      setLogs(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(page, filters);
  }, [page, filters]);

  const applySearch = () => {
    setPage(1);
    setFilters((f) => ({ ...f, search }));
  };

  const setFilter = (key: keyof GetAuditLogsParams, value: string) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  return (
    <div className="space-y-4">
      {/* ── Filters ── */}
      <div className="rounded-2xl border border-neutral bg-neutral-light shadow-sm px-4 py-4 flex flex-wrap gap-3 items-center">
        <Filter className="h-4 w-4 text-neutral-dark shrink-0" />

        <FilterSelect value={filters.module ?? ""} onChange={(v) => setFilter("module", v)} options={MODULE_OPTIONS} />

        <FilterSelect value={filters.severity ?? ""} onChange={(v) => setFilter("severity", v)} options={SEVERITY_OPTIONS} />

        <FilterSelect
          value={String(filters.isSuccess ?? "")}
          onChange={(v) => setFilter("isSuccess", v === "" ? "" : v)}
          options={[
            { value: "", label: "Tất cả trạng thái" },
            { value: "true", label: "Thành công" },
            { value: "false", label: "Thất bại" },
          ]}
        />

        {/* Search */}
        <div className="flex flex-1 min-w-48 items-center gap-2 rounded-xl border border-neutral bg-neutral-light-active px-3 py-2">
          <Search className="h-3.5 w-3.5 text-neutral-dark shrink-0" />
          <input
            className="flex-1 bg-transparent text-sm text-primary placeholder:text-neutral-dark focus:outline-none"
            placeholder="Tìm theo mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
          />
        </div>

        <button
          type="button"
          onClick={() => fetch(page, filters)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral bg-neutral-light-active px-3 py-2 text-sm font-medium text-primary hover:bg-neutral transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Làm mới
        </button>
      </div>

      {/* ── Stats bar ── */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-xs text-neutral-dark">{loading ? "Đang tải..." : `${total} bản ghi`}</span>
        {total > 0 && (
          <span className="text-xs text-neutral-dark">
            · Trang {page}/{totalPages}
          </span>
        )}
      </div>

      {/* ── Log list ── */}
      <div className="rounded-2xl border border-neutral bg-neutral-light shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-5 w-5 animate-spin text-accent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <ClipboardList className="h-8 w-8 text-neutral-dark/30" />
            <p className="text-sm text-neutral-dark">Không có bản ghi nào</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral">
            {logs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 rounded-xl border border-neutral px-3 py-2 text-sm font-medium text-primary hover:bg-neutral-light-active disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </button>
          <span className="text-sm text-neutral-dark px-2">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 rounded-xl border border-neutral px-3 py-2 text-sm font-medium text-primary hover:bg-neutral-light-active disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
