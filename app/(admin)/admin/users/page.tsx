"use client";

import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, Pencil, Trash2, RefreshCw, Loader2,
  User as UserIcon, ArrowUpDown, Calendar, ChevronDown,
  LogIn, ShoppingCart, AlertTriangle, RotateCcw,
} from "lucide-react";
import { getAllUsers, type GetUsersQuery } from "./_libs/getAllUsers";
import { updateActiveUser } from "./_libs/updateActiveUser";
import { deleteUser } from "./_libs/deleteUser";
import type { User, UserRole } from "./user.types";
import AdminPagination from "@/components/admin/PaginationAdmin";
import { StatsCard } from "@/components/admin/StatsCard";
import AdminTable, { type AdminColumn } from "@/components/admin/AdminTables";
import { useToasty } from "@/components/Toast";
import { AuthContext } from "@/contexts/AuthContext";

type FilterTab = "ALL" | "ACTIVE" | "BLOCKED" | "ADMIN";
type SortField = "createdAt" | "fullName" | "email" | "role";
type SortDir = "asc" | "desc";
type StatsMap = Record<FilterTab, number>;

const roleColor: Record<UserRole, string> = {
  ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  STAFF: "bg-blue-100 text-blue-800 border-blue-200",
  CUSTOMER: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const STATUS_TABS: { value: FilterTab; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "BLOCKED", label: "Bị khóa" },
  { value: "ADMIN", label: "Admin" },
];

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "createdAt", label: "Ngày tạo" },
  { value: "fullName", label: "Họ tên" },
  { value: "email", label: "Email" },
  { value: "role", label: "Vai trò" },
];

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteModal({
  user,
  onConfirm,
  onCancel,
}: {
  user: User;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-neutral-light rounded-2xl border border-neutral shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-promotion-light flex items-center justify-center">
            <AlertTriangle size={22} className="text-promotion" />
          </div>
          <div>
            <p className="text-base font-semibold text-primary">Xóa người dùng?</p>
            <p className="text-[13px] text-neutral-dark mt-1">
              Bạn có chắc muốn xóa{" "}
              <span className="font-medium text-primary">
                {user.fullName || user.userName}
              </span>
              ? Hành động này không thể hoàn tác.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-primary bg-neutral-light border border-neutral rounded-xl hover:bg-neutral-light-active transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-promotion rounded-xl hover:bg-promotion-hover transition-all cursor-pointer"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Delete many modal ─────────────────────────────────────────────────────────
function DeleteManyModal({
  count,
  onConfirm,
  onCancel,
}: {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-neutral-light rounded-2xl border border-neutral shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-promotion-light flex items-center justify-center">
            <AlertTriangle size={22} className="text-promotion" />
          </div>
          <div>
            <p className="text-base font-semibold text-primary">Xóa {count} người dùng?</p>
            <p className="text-[13px] text-neutral-dark mt-1">
              Hành động này sẽ xóa {count} tài khoản đã chọn và không thể hoàn tác.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-primary bg-neutral-light border border-neutral rounded-xl hover:bg-neutral-light-active transition-all cursor-pointer">
              Hủy
            </button>
            <button onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-promotion rounded-xl hover:bg-promotion-hover transition-all cursor-pointer">
              Xóa tất cả
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Format datetime ───────────────────────────────────────────────────────────
function formatDateTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function UserPage() {
  const router = useRouter();
  const { success, error: toastError } = useToasty();
  const auth = useContext(AuthContext);
  const currentUserId = auth?.user?.id;
  const ONLINE_IDS = new Set<string>([]);
  const ORDERING_IDS = new Set<string>([]);

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [showDeleteMany, setShowDeleteMany] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [stats, setStats] = useState<StatsMap>({ ALL: 0, ACTIVE: 0, BLOCKED: 0, ADMIN: 0 });

  const buildQuery = useCallback((): GetUsersQuery => {
    const q: GetUsersQuery = { page, limit: pageSize, sortBy: sortField, sortOrder: sortDir };
    if (search) q.search = search;
    if (activeTab === "ACTIVE") q.isActive = true;
    if (activeTab === "BLOCKED") q.isActive = false;
    if (activeTab === "ADMIN") q.role = "ADMIN";
    return q;
  }, [page, pageSize, sortField, sortDir, search, activeTab]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllUsers(buildQuery());
      const normalized: User[] = res.data.map((u) => ({
        ...u,
        role: (["ADMIN", "STAFF"] as UserRole[]).includes(u.role) ? u.role : "CUSTOMER",
      }));
      const filtered = dateFilter
        ? normalized.filter((u) => u.createdAt?.slice(0, 10) === dateFilter)
        : normalized;
      setUsers(filtered);
      setTotal(dateFilter ? filtered.length : res.pagination.total);
      setTotalPages(dateFilter ? Math.max(Math.ceil(filtered.length / pageSize), 1) : res.pagination.totalPages);
      setSelectedIds(new Set());
    } catch {
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [buildQuery, dateFilter, pageSize]);

  const fetchStats = useCallback(async () => {
    try {
      const [all, active, admin] = await Promise.all([
        getAllUsers({ limit: 1 }),
        getAllUsers({ limit: 1, isActive: true }),
        getAllUsers({ limit: 1, role: "ADMIN" }),
      ]);
      setStats({
        ALL: all.pagination.total,
        ACTIVE: active.pagination.total,
        BLOCKED: Math.max(0, all.pagination.total - active.pagination.total),
        ADMIN: admin.pagination.total,
      });
    } catch (e) {
      console.error("fetchStats error:", e);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); setPage(1); };
  const handleTabChange = (tab: FilterTab) => { setActiveTab(tab); setPage(1); setSelectedIds(new Set()); };
  const handleSortChange = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
    setShowSortMenu(false); setPage(1);
  };
  const handleClearFilters = () => {
    setSearch(""); setSearchInput(""); setDateFilter(""); setActiveTab("ALL"); setPage(1);
  };

  // Checkbox helpers
  const selectableUsers = users.filter((u) => !isHiddenUser(u, currentUserId));
  const allSelected = selectableUsers.length > 0 && selectableUsers.every((u) => selectedIds.has(u.id));
  const someSelected = selectableUsers.some((u) => selectedIds.has(u.id));

  function isHiddenUser(u: User, cid?: string) {
    return u.id === cid || (u.role === "ADMIN" && u.id !== cid);
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableUsers.map((u) => u.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleActive = async (user: User) => {
    const oldValue = user.isActive;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: !oldValue } : u)));
    setLoadingId(user.id);
    try {
      await updateActiveUser(user.id, { isActive: !oldValue });
      fetchStats();
    } catch {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: oldValue } : u)));
      toastError("Cập nhật trạng thái thất bại.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const user = deleteTarget;
    setDeleteTarget(null);
    const oldUsers = [...users];
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setLoadingId(user.id);
    try {
      await deleteUser(user.id);
      setTotal((t) => t - 1);
      fetchStats();
      success("Xóa người dùng thành công!");
    } catch {
      setUsers(oldUsers);
      toastError("Xóa người dùng thất bại.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteMany = async () => {
    setShowDeleteMany(false);
    const ids = Array.from(selectedIds);
    const oldUsers = [...users];
    setUsers((prev) => prev.filter((u) => !ids.includes(u.id)));
    try {
      await Promise.all(ids.map((id) => deleteUser(id)));
      setTotal((t) => Math.max(0, t - ids.length));
      setSelectedIds(new Set());
      fetchStats();
      success(`Đã xóa ${ids.length} người dùng!`);
    } catch {
      setUsers(oldUsers);
      toastError("Xóa nhiều người dùng thất bại.");
    }
  };

  const isHidden = (u: User) => u.id === currentUserId || (u.role === "ADMIN" && u.id !== currentUserId);
  const toggleLocked = (u: User) =>
    u.id === currentUserId ||
    (u.role === "ADMIN" && u.id !== currentUserId) ||
    (ONLINE_IDS.has(u.id) && u.isActive);

  const hasFilter = activeTab !== "ALL" || !!search || !!dateFilter;

  // Ref để set indeterminate state cho checkbox "chọn tất cả" trong header
  const checkboxAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (checkboxAllRef.current) {
      checkboxAllRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  const columns: AdminColumn<User>[] = [
    {
      key: "checkbox",
      label: "",
      width: "w-10",
      align: "center",
      render: (row) => {
        if (isHidden(row)) return null;
        return (
          <input
            type="checkbox"
            checked={selectedIds.has(row.id)}
            onChange={() => toggleSelectOne(row.id)}
            className="w-4 h-4 rounded border-neutral accent-accent cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        );
      },
    },
    {
      key: "stt", label: "STT", width: "w-14", align: "center",
      render: (_, idx) => <span className="text-neutral-dark">{(page - 1) * pageSize + idx + 1}</span>,
    },
    {
      key: "fullName", label: "Người dùng",
      render: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-accent-light flex items-center justify-center shrink-0 overflow-hidden">
            {row.avatarImage
              ? <img src={row.avatarImage} alt={row.fullName} className="w-full h-full object-cover" />
              : <UserIcon size={15} className="text-accent" />}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[13px] font-medium text-primary truncate">{row.fullName || "—"}</span>
            <span className="text-[11px] text-neutral-dark truncate">{row.userName || "—"}</span>
          </div>
          {ONLINE_IDS.has(row.id) && (
            <span className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-medium">
              <LogIn size={9} /> Online
            </span>
          )}
          {ORDERING_IDS.has(row.id) && (
            <span className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-medium">
              <ShoppingCart size={9} /> Đặt hàng
            </span>
          )}
        </div>
      ),
    },
    {
      key: "email", label: "Email",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] text-primary">{row.email}</span>
          {row.phone && <span className="text-[11px] text-neutral-dark">{row.phone}</span>}
        </div>
      ),
    },
    {
      key: "role", label: "Vai trò", align: "center",
      render: (row) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${roleColor[row.role] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}>
          {row.role === "ADMIN" ? "Admin" : row.role === "STAFF" ? "Nhân viên" : "Khách hàng"}
        </span>
      ),
    },
    {
      key: "isActive", label: "Trạng thái", align: "center",
      render: (row) => {
        const isLoadingRow = loadingId === row.id;
        const locked = toggleLocked(row);
        return (
          <div className="flex items-center justify-center">
            <div
              onClick={() => !isLoadingRow && !locked && handleToggleActive(row)}
              title={locked ? "Không thể thay đổi" : row.isActive ? "Đang hoạt động – nhấn để khóa" : "Đã khóa – nhấn để mở"}
              className={[
                "w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200",
                row.isActive ? "bg-accent" : "bg-neutral-active",
                isLoadingRow || locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${row.isActive ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            {isLoadingRow && <Loader2 size={13} className="animate-spin text-accent ml-2" />}
          </div>
        );
      },
    },
    {
      key: "createdAt", label: "Ngày tạo", align: "center",
      render: (row) => {
        const dt = formatDateTime(row.createdAt);
        if (typeof dt === "string") return <span className="text-[12px] text-neutral-dark">—</span>;
        return (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[12px] text-primary font-medium">{dt.date}</span>
            <span className="text-[11px] text-neutral-dark">{dt.time}</span>
          </div>
        );
      },
    },
    {
      key: "actions", label: "Hành động", align: "center",
      render: (row) => {
        if (isHidden(row)) return <span className="text-[11px] text-neutral-dark italic">—</span>;
        const isLoadingRow = loadingId === row.id;
        const cantDelete = ONLINE_IDS.has(row.id) || ORDERING_IDS.has(row.id);
        return (
          <div className="flex items-center justify-center gap-1.5">
            <button onClick={() => router.push(`/admin/users/${row.id}/edit`)} title="Chỉnh sửa"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-primary hover:bg-accent-light hover:text-accent transition-all cursor-pointer">
              <Pencil size={14} />
            </button>
            <button
              onClick={() => { if (!isLoadingRow && !cantDelete) setDeleteTarget(row); }}
              disabled={isLoadingRow || cantDelete}
              title={ONLINE_IDS.has(row.id) ? "Đang đăng nhập, không thể xóa" : ORDERING_IDS.has(row.id) ? "Đang đặt hàng, không thể xóa" : "Xóa người dùng"}
              className={[
                "w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                isLoadingRow || cantDelete ? "text-neutral-active cursor-not-allowed opacity-50" : "text-primary hover:bg-promotion-light hover:text-promotion cursor-pointer",
              ].join(" ")}
            >
              {isLoadingRow ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5 p-3 sm:p-5 bg-neutral-light h-full">
      {deleteTarget && (
        <DeleteModal user={deleteTarget} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
      )}
      {showDeleteMany && (
        <DeleteManyModal count={selectedIds.size} onConfirm={handleDeleteMany} onCancel={() => setShowDeleteMany(false)} />
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
            <UserIcon size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-primary">Người dùng</h1>
            <p className="text-[11px] text-neutral-dark">Quản lý toàn bộ tài khoản trong hệ thống</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchUsers} title="Làm mới"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral bg-neutral-light text-neutral-dark hover:bg-neutral-light-active hover:text-primary transition-all cursor-pointer">
            <RotateCcw size={14} />
          </button>
          <button onClick={() => router.push("/admin/users/create")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent-hover transition-all shadow-sm cursor-pointer">
            <Plus size={14} /> Thêm người dùng
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard label="Tổng người dùng" value={stats.ALL} sub="Tất cả tài khoản" icon={<UserIcon size={18} />} valueClassName="text-accent" />
        <StatsCard label="Hoạt động" value={stats.ACTIVE} sub="Đang hoạt động bình thường" icon={<UserIcon size={18} />} valueClassName="text-emerald-600" />
        <StatsCard label="Bị khóa" value={stats.BLOCKED} sub="Tài khoản bị khóa" icon={<UserIcon size={18} />} valueClassName="text-promotion" />
        <StatsCard label="Admin" value={stats.ADMIN} sub="Quyền quản trị viên" icon={<UserIcon size={18} />} valueClassName="text-purple-600" />
      </div>

      {/* ── Main card ── */}
      <div className="bg-neutral-light border border-neutral rounded-xl">

        {/* ── Toolbar: single row like product page ── */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-neutral overflow-x-auto scrollbar-thin">
          {/* Tabs */}
          <div className="flex items-center gap-1 shrink-0">
            {STATUS_TABS.map((tab) => (
              <button key={tab.value} onClick={() => handleTabChange(tab.value)}
                className={["px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap cursor-pointer",
                  activeTab === tab.value ? "bg-accent text-white shadow-sm" : "text-primary hover:bg-neutral-light-active"].join(" ")}>
                {tab.label}
                <span className={["ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold",
                  activeTab === tab.value ? "bg-white/20 text-white" : "bg-neutral-light-active text-primary"].join(" ")}>
                  {stats[tab.value] ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-neutral shrink-0" />

          {/* Search */}
          <form onSubmit={handleSearch} className="relative shrink-0">
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm tên, email, username..."
              className="w-52 pl-9 pr-3 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light-active text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" />
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark" />
          </form>

          {/* Sort */}
          <div className="relative shrink-0">
            <button onClick={() => setShowSortMenu((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral bg-neutral-light text-primary text-[12px] font-medium hover:bg-neutral-light-active transition-all cursor-pointer whitespace-nowrap">
              <ArrowUpDown size={13} /> Sắp xếp
              <ChevronDown size={11} className={`transition-transform ${showSortMenu ? "rotate-180" : ""}`} />
            </button>
            {showSortMenu && (
              <div className="absolute left-0 top-full mt-1 w-44 bg-neutral-light border border-neutral rounded-xl shadow-lg z-20 overflow-hidden">
                {SORT_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => handleSortChange(opt.value)}
                    className={["w-full flex items-center justify-between px-3 py-2 text-[12px] transition-colors cursor-pointer",
                      sortField === opt.value ? "bg-accent-light text-accent font-medium" : "text-primary hover:bg-neutral-light-active"].join(" ")}>
                    {opt.label}
                    {sortField === opt.value && <span className="text-[10px]">{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date filter */}
          <div className="relative shrink-0">
            <input type="date" value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="pl-8 pr-3 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer" />
            <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Count */}
          <span className="text-[12px] text-neutral-dark whitespace-nowrap shrink-0">{total} người dùng</span>
        </div>

        {/* ── Sub-toolbar: bulk + legend (chỉ hiện khi cần) ── */}
        {(selectedIds.size > 0 || hasFilter) && (
          <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 border-b border-neutral bg-neutral-light-active/40 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {selectedIds.size > 0 && (
                <>
                  <span className="text-[11px] text-accent font-medium">{selectedIds.size} đã chọn</span>
                  <button onClick={() => setShowDeleteMany(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-promotion-light text-promotion text-[11px] font-medium hover:bg-promotion-light-active transition-all cursor-pointer">
                    <Trash2 size={11} /> Xóa đã chọn
                  </button>
                </>
              )}
              {hasFilter && (
                <button onClick={handleClearFilters}
                  className="text-[11px] text-accent hover:underline cursor-pointer font-medium">
                  Xóa bộ lọc
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-neutral-dark">
              <span className="flex items-center gap-1"><LogIn size={10} className="text-emerald-600" /> Đang online</span>
              <span className="flex items-center gap-1"><ShoppingCart size={10} className="text-amber-500" /> Đang đặt hàng</span>
            </div>
          </div>
        )}

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center justify-between px-5 py-3 bg-promotion-light border-b border-promotion-light-active">
            <span className="text-[12px] text-promotion">{error}</span>
            <button onClick={fetchUsers} className="flex items-center gap-1 text-[12px] text-promotion hover:underline cursor-pointer">
              <RefreshCw size={12} /> Thử lại
            </button>
          </div>
        )}

        {/* ── Table ── */}
        <div className="overflow-x-auto relative">
          {/* Checkbox "chọn tất cả" đặt overlay vào ô header đầu tiên */}
          <div className="absolute top-0 left-0 w-10 h-[44px] z-10 flex items-center justify-center pointer-events-none">
            <input
              ref={checkboxAllRef}
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-neutral accent-accent cursor-pointer pointer-events-auto"
            />
          </div>
          <AdminTable<User>
            columns={columns}
            data={users}
            loading={loading}
            skeletonRows={pageSize}
            rowKey="id"
            emptyText={
              <div className="flex flex-col items-center gap-3 text-primary">
                <UserIcon size={36} className="opacity-30" />
                <span className="text-sm">Không có người dùng nào</span>
              </div>
            }
            className="border-0 rounded-none"
          />
        </div>

        {/* ── Pagination ── */}
        <div className="px-3 sm:px-5 py-3 border-t border-neutral">
          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            pageSizeOptions={[10, 20, 50]}
            siblingCount={1}
          />
        </div>
      </div>

      {showSortMenu && <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />}
    </div>
  );
}