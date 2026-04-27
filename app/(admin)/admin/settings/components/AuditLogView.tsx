"use client";

import { useState, useMemo } from "react";
import {
   ClipboardList,
   Search,
   Filter,
   ChevronDown,
   AlertTriangle,
   Check,
   X,
   Shield,
   Package,
   FileText,
   Settings,
   UserCog,
   Lock,
   MapPin,
   Monitor,
   RefreshCw,
   Download,
} from "lucide-react";
import { formatRelativeDate } from "@/helpers/formatRelativeDate";

/* ─────────────── Types ─────────────── */
type LogSeverity = "info" | "warning" | "critical";
type LogModule =
   | "Sản phẩm"
   | "Đơn hàng"
   | "Nội dung"
   | "Cài đặt"
   | "Tài khoản"
   | "Bảo mật";
type LogStatus = "success" | "fail";

type AuditLog = {
   id: string;
   who: { name: string; role: string; id: string };
   when: string;
   where: { ip: string; device: string; browser: string; location: string };
   what: string;
   module: LogModule;
   status: LogStatus;
   severity: LogSeverity;
   detail?: string;
};

/* ─────────────── Mock data ─────────────── */
const MOCK_LOGS: AuditLog[] = [
   {
      id: "log-001",
      who: { name: "Nguyễn Văn A", role: "Staff", id: "USR-012" },
      when: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      where: {
         ip: "113.160.12.4",
         device: "MacBook Pro",
         browser: "Chrome 124",
         location: "Biên Hòa, VN",
      },
      what: 'Thay đổi giá "iPhone 15 Pro Max": 30.000.000đ → 10.000.000đ',
      module: "Sản phẩm",
      status: "success",
      severity: "critical",
      detail: "Giảm giá bất thường 67% — Cần xem xét ngay",
   },
   {
      id: "log-002",
      who: { name: "Unknown", role: "—", id: "—" },
      when: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      where: {
         ip: "194.87.65.2",
         device: "Unknown",
         browser: "Unknown",
         location: "Moscow, RU",
      },
      what: "Đăng nhập thất bại liên tiếp 7 lần → Tài khoản bị khóa tạm thời 30 phút",
      module: "Bảo mật",
      status: "fail",
      severity: "critical",
      detail: "Brute force attack detected — IP đã bị chặn tự động",
   },
   {
      id: "log-003",
      who: { name: "Trần Thị B", role: "Admin", id: "USR-001" },
      when: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      where: {
         ip: "113.160.12.4",
         device: "MacBook Pro",
         browser: "Safari 17",
         location: "Biên Hòa, VN",
      },
      what: "Xác nhận đơn hàng #ORD-4821 (2.850.000đ)",
      module: "Đơn hàng",
      status: "success",
      severity: "info",
   },
   {
      id: "log-004",
      who: { name: "Lê Minh C", role: "Staff", id: "USR-034" },
      when: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      where: {
         ip: "118.70.45.8",
         device: "Windows PC",
         browser: "Edge 124",
         location: "Hà Nội, VN",
      },
      what: 'Thêm bài viết mới: "Top 5 laptop văn phòng 2026"',
      module: "Nội dung",
      status: "success",
      severity: "info",
   },
   {
      id: "log-005",
      who: { name: "Nguyễn Văn A", role: "Staff", id: "USR-012" },
      when: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      where: {
         ip: "113.160.12.4",
         device: "MacBook Pro",
         browser: "Chrome 124",
         location: "Biên Hòa, VN",
      },
      what: 'Xóa sản phẩm "Chuột Logitech MX Master 3S" (SKU: LOG-001)',
      module: "Sản phẩm",
      status: "success",
      severity: "warning",
      detail: "Hành động không thể hoàn tác",
   },
   {
      id: "log-006",
      who: { name: "Phạm Thị D", role: "Admin", id: "USR-002" },
      when: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      where: {
         ip: "27.65.80.14",
         device: "iPhone 15",
         browser: "Safari 17",
         location: "TP. HCM, VN",
      },
      what: 'Thay đổi cấu hình SEO: robots.txt → "noindex, nofollow"',
      module: "Cài đặt",
      status: "success",
      severity: "warning",
      detail: "Ảnh hưởng toàn bộ khả năng index của Google",
   },
   {
      id: "log-007",
      who: { name: "Trần Thị B", role: "Admin", id: "USR-001" },
      when: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      where: {
         ip: "113.160.12.4",
         device: "MacBook Pro",
         browser: "Chrome 124",
         location: "Biên Hòa, VN",
      },
      what: 'Tạo nhóm người dùng mới: "Telesale team" (8 thành viên)',
      module: "Tài khoản",
      status: "success",
      severity: "info",
   },
   {
      id: "log-008",
      who: { name: "Lê Minh C", role: "Staff", id: "USR-034" },
      when: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      where: {
         ip: "118.70.45.8",
         device: "Windows PC",
         browser: "Edge 124",
         location: "Hà Nội, VN",
      },
      what: "Cố gắng truy cập module Phân quyền (không có quyền)",
      module: "Bảo mật",
      status: "fail",
      severity: "warning",
      detail: "RBAC: Quyền truy cập bị từ chối",
   },
];

const MODULE_ICON: Record<LogModule, React.ElementType> = {
   "Sản phẩm": Package,
   "Đơn hàng": ClipboardList,
   "Nội dung": FileText,
   "Cài đặt": Settings,
   "Tài khoản": UserCog,
   "Bảo mật": Lock,
};

const MODULE_COLOR: Record<LogModule, string> = {
   "Sản phẩm": "bg-accent/10 text-accent",
   "Đơn hàng": "bg-blue-500/10 text-blue-600",
   "Nội dung": "bg-purple-500/10 text-purple-600",
   "Cài đặt": "bg-neutral text-neutral-dark",
   "Tài khoản": "bg-green-500/10 text-green-600",
   "Bảo mật": "bg-red-500/10 text-red-600",
};

const SEVERITY_META: Record<
   LogSeverity,
   { label: string; color: string; dot: string }
> = {
   info: {
      label: "Thường",
      color: "bg-neutral text-neutral-dark",
      dot: "bg-neutral-dark",
   },
   warning: {
      label: "Cảnh báo",
      color: "bg-amber-500/10 text-amber-600",
      dot: "bg-amber-500",
   },
   critical: {
      label: "Nghiêm trọng",
      color: "bg-red-500/10 text-red-600",
      dot: "bg-red-500",
   },
};

const ALL_MODULES: LogModule[] = [
   "Sản phẩm",
   "Đơn hàng",
   "Nội dung",
   "Cài đặt",
   "Tài khoản",
   "Bảo mật",
];
const ALL_STATUSES = ["success", "fail"] as const;
const ALL_SEVERITIES: LogSeverity[] = ["info", "warning", "critical"];

/* ─────────────── Component ─────────────── */
export default function AuditLogView() {
   const [search, setSearch] = useState("");
   const [moduleFilter, setModuleFilter] = useState<LogModule | "">("");
   const [statusFilter, setStatusFilter] = useState<LogStatus | "">("");
   const [severityFilter, setSeverityFilter] = useState<LogSeverity | "">("");
   const [expanded, setExpanded] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);

   const filtered = useMemo(() => {
      return MOCK_LOGS.filter((log) => {
         const q = search.trim().toLowerCase();
         if (
            q &&
            !log.who.name.toLowerCase().includes(q) &&
            !log.what.toLowerCase().includes(q) &&
            !log.where.ip.includes(q)
         )
            return false;
         if (moduleFilter && log.module !== moduleFilter) return false;
         if (statusFilter && log.status !== statusFilter) return false;
         if (severityFilter && log.severity !== severityFilter) return false;
         return true;
      });
   }, [search, moduleFilter, statusFilter, severityFilter]);

   const criticalCount = filtered.filter(
      (l) => l.severity === "critical",
   ).length;
   const warningCount = filtered.filter((l) => l.severity === "warning").length;
   const failCount = filtered.filter((l) => l.status === "fail").length;

   const handleRefresh = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 800));
      setLoading(false);
   };

   return (
      <div className="space-y-6">
         {/* ── Summary stats ── */}
         <div className="grid grid-cols-3 gap-4">
            {[
               {
                  label: "Nghiêm trọng",
                  count: criticalCount,
                  color: "text-red-600",
                  bg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30",
               },
               {
                  label: "Cảnh báo",
                  count: warningCount,
                  color: "text-amber-600",
                  bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30",
               },
               {
                  label: "Thất bại",
                  count: failCount,
                  color: "text-primary",
                  bg: "bg-neutral-light-active border-neutral",
               },
            ].map((s) => (
               <div
                  key={s.label}
                  className={`rounded-xl border ${s.bg} px-4 py-3`}
               >
                  <p className="text-xs font-medium text-neutral-dark">
                     {s.label}
                  </p>
                  <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>
                     {s.count}
                  </p>
               </div>
            ))}
         </div>

         {/* ── Log Board ── */}
         <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm overflow-hidden">
            <div className="border-b border-neutral px-5 py-4 bg-neutral-light-active/40 flex items-center justify-between gap-3 flex-wrap">
               <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                     <ClipboardList className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                     <h2 className="text-sm font-bold text-primary">
                        Nhật ký hoạt động
                     </h2>
                     <p className="text-xs text-neutral-dark mt-0.5">
                        Truy vết toàn bộ hành động —{" "}
                        <span className="font-medium">
                           Who · When · Where · What
                        </span>
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button
                     type="button"
                     onClick={handleRefresh}
                     disabled={loading}
                     className="inline-flex items-center gap-1.5 rounded-xl border border-neutral bg-neutral-light-active px-3 py-2 text-xs font-medium text-primary hover:bg-neutral-light transition-colors disabled:opacity-60"
                  >
                     <RefreshCw
                        className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                     />
                     Làm mới
                  </button>
                  <button
                     type="button"
                     className="inline-flex items-center gap-1.5 rounded-xl border border-neutral bg-neutral-light-active px-3 py-2 text-xs font-medium text-primary hover:bg-neutral-light transition-colors"
                  >
                     <Download className="h-3.5 w-3.5" />
                     Xuất CSV
                  </button>
               </div>
            </div>

            {/* Filters */}
            <div className="border-b border-neutral px-5 py-3 flex flex-wrap gap-2 bg-neutral-light">
               <div className="relative flex-1 min-w-[200px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-dark" />
                  <input
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     placeholder="Tìm theo tên, hành động, IP..."
                     className="w-full rounded-xl border border-neutral bg-neutral-light-active pl-9 pr-3 py-2 text-[12px] text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
               </div>

               {/* Module filter */}
               <div className="relative">
                  <select
                     value={moduleFilter}
                     onChange={(e) =>
                        setModuleFilter(e.target.value as LogModule | "")
                     }
                     className="appearance-none rounded-xl border border-neutral bg-neutral-light-active pl-3 pr-8 py-2 text-[12px] text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
                  >
                     <option value="">Tất cả module</option>
                     {ALL_MODULES.map((m) => (
                        <option key={m} value={m}>
                           {m}
                        </option>
                     ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-dark" />
               </div>

               {/* Severity filter */}
               <div className="relative">
                  <select
                     value={severityFilter}
                     onChange={(e) =>
                        setSeverityFilter(e.target.value as LogSeverity | "")
                     }
                     className="appearance-none rounded-xl border border-neutral bg-neutral-light-active pl-3 pr-8 py-2 text-[12px] text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
                  >
                     <option value="">Tất cả mức độ</option>
                     {ALL_SEVERITIES.map((s) => (
                        <option key={s} value={s}>
                           {SEVERITY_META[s].label}
                        </option>
                     ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-dark" />
               </div>

               {/* Status filter */}
               <div className="relative">
                  <select
                     value={statusFilter}
                     onChange={(e) =>
                        setStatusFilter(e.target.value as LogStatus | "")
                     }
                     className="appearance-none rounded-xl border border-neutral bg-neutral-light-active pl-3 pr-8 py-2 text-[12px] text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
                  >
                     <option value="">Tất cả trạng thái</option>
                     <option value="success">Thành công</option>
                     <option value="fail">Thất bại</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-dark" />
               </div>

               {(search || moduleFilter || statusFilter || severityFilter) && (
                  <button
                     type="button"
                     onClick={() => {
                        setSearch("");
                        setModuleFilter("");
                        setStatusFilter("");
                        setSeverityFilter("");
                     }}
                     className="inline-flex items-center gap-1 rounded-xl border border-neutral bg-neutral-light-active px-3 py-2 text-[12px] font-medium text-neutral-dark hover:bg-neutral-light transition-colors"
                  >
                     <X className="h-3.5 w-3.5" />
                     Xóa bộ lọc
                  </button>
               )}
            </div>

            {/* Log list */}
            <div className="divide-y divide-neutral">
               {filtered.length === 0 ? (
                  <div className="py-12 text-center px-6">
                     <Filter className="h-8 w-8 text-neutral-dark/40 mx-auto mb-3" />
                     <p className="text-sm font-medium text-primary">
                        Không tìm thấy kết quả
                     </p>
                     <p className="text-xs text-neutral-dark mt-1">
                        Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm
                     </p>
                  </div>
               ) : (
                  filtered.map((log) => {
                     const ModuleIcon = MODULE_ICON[log.module];
                     const severity = SEVERITY_META[log.severity];
                     const isExpanded = expanded === log.id;

                     return (
                        <div key={log.id} className="transition-colors">
                           <button
                              type="button"
                              onClick={() =>
                                 setExpanded(isExpanded ? null : log.id)
                              }
                              className={[
                                 "w-full text-left px-5 py-4 flex gap-3 items-start hover:bg-neutral-light-active transition-colors",
                                 log.severity === "critical"
                                    ? "bg-red-50/50 dark:bg-red-950/10"
                                    : "",
                              ].join(" ")}
                           >
                              {/* Status icon */}
                              <span
                                 className={[
                                    "inline-flex items-center justify-center h-8 w-8 rounded-lg shrink-0 mt-0.5",
                                    log.status === "success"
                                       ? "bg-green-500/10 text-green-600"
                                       : "bg-red-500/10 text-red-500",
                                 ].join(" ")}
                              >
                                 {log.status === "success" ? (
                                    <Check className="h-3.5 w-3.5" />
                                 ) : (
                                    <X className="h-3.5 w-3.5" />
                                 )}
                              </span>

                              <div className="flex-1 min-w-0">
                                 {/* Header row */}
                                 <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                    {/* Module badge */}
                                    <span
                                       className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${MODULE_COLOR[log.module]}`}
                                    >
                                       <ModuleIcon className="h-3 w-3" />
                                       {log.module}
                                    </span>
                                    {/* Severity badge */}
                                    <span
                                       className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${severity.color}`}
                                    >
                                       <span
                                          className={`h-1.5 w-1.5 rounded-full ${severity.dot}`}
                                       />
                                       {severity.label}
                                    </span>
                                    {log.severity === "critical" && (
                                       <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white">
                                          <AlertTriangle className="h-3 w-3" />
                                          Xem xét ngay
                                       </span>
                                    )}
                                 </div>

                                 {/* What */}
                                 <p className="text-[13px] font-semibold text-primary leading-snug">
                                    {log.what}
                                 </p>

                                 {/* Who + Where */}
                                 <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-neutral-dark">
                                    <span className="flex items-center gap-1">
                                       <Shield className="h-3 w-3" />
                                       <span className="font-medium text-primary">
                                          {log.who.name}
                                       </span>
                                       <span className="text-neutral-dark/60">
                                          ({log.who.role})
                                       </span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                       <Monitor className="h-3 w-3" />
                                       {log.where.browser} · {log.where.device}
                                    </span>
                                    <span className="flex items-center gap-1">
                                       <MapPin className="h-3 w-3" />
                                       {log.where.location} ·{" "}
                                       <span className="font-mono">
                                          {log.where.ip}
                                       </span>
                                    </span>
                                 </div>
                              </div>

                              {/* When */}
                              <div className="text-[11px] text-neutral-dark whitespace-nowrap shrink-0 text-right">
                                 {formatRelativeDate(log.when)}
                              </div>
                           </button>

                           {/* Expanded detail */}
                           {isExpanded && log.detail && (
                              <div className="px-5 pb-4 pl-16 bg-neutral-light-active/30 border-t border-neutral">
                                 <div className="flex items-start gap-2 rounded-xl border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 mt-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[12px] text-amber-700 dark:text-amber-400">
                                       {log.detail}
                                    </p>
                                 </div>
                              </div>
                           )}
                        </div>
                     );
                  })
               )}
            </div>

            {/* Footer */}
            <div className="border-t border-neutral px-5 py-3 flex items-center justify-between bg-neutral-light-active/30">
               <p className="text-[11px] text-neutral-dark">
                  Hiển thị{" "}
                  <span className="font-semibold text-primary">
                     {filtered.length}
                  </span>{" "}
                  / {MOCK_LOGS.length} bản ghi
               </p>
               <button
                  type="button"
                  className="text-[11px] text-accent hover:underline"
               >
                  Xem thêm bản ghi cũ hơn
               </button>
            </div>
         </section>
      </div>
   );
}
