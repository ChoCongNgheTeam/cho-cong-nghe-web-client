"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, Pencil, Trash2, RefreshCw, Loader2,
  User as UserIcon, ArrowUpDown, Calendar, ChevronDown,
  LogIn, ShoppingCart,
} from "lucide-react";
import { getAllUsers} from "./_libs/getAllUsers";
import { updateActiveUser } from "./_libs/updateActiveUser";
import { deleteUser } from "./_libs/deleteUser";
import { User, UserRole } from "./user.types";
import AdminPagination from "@/components/admin/PaginationAdmin";
import { StatsCard } from "@/components/admin/StatsCard";
import AdminTable, { AdminColumn } from "@/components/admin/AdminTables";

// ── Types ────────────────────────────────────────────────────────────────────
type FilterTab = "ALL" | "ACTIVE" | "BLOCKED" | "ADMIN";
type SortField = "createdAt" | "fullName" | "email" | "role";
type SortDir = "asc" | "desc";

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

// ── TODO: thay bằng giá trị thực từ auth context ─────────────────────────────
const MOCK_CURRENT_USER_ID = "current-admin-id";
const MOCK_ONLINE_IDS = new Set<string>([]);
const MOCK_ORDERING_IDS = new Set<string>([]);

// ── Toast ─────────────────────────────────────────────────────────────────────
interface ToastMsg { id: number; type: "error" | "warn" | "info"; text: string }

function useToast() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const push = useCallback((type: ToastMsg["type"], text: string) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, type, text }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  return { toasts, push };
}

function ToastContainer({ toasts }: { toasts: ToastMsg[] }) {
  if (!toasts.length) return null;
  const bg: Record<ToastMsg["type"], string> = {
    error: "bg-promotion text-white",
    warn: "bg-amber-500 text-white",
    info: "bg-accent text-white",
  };
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-xs ${bg[t.type]}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}

// ── Stats type ────────────────────────────────────────────────────────────────
type StatsMap = Record<FilterTab, number>;

// ── Page ──────────────────────────────────────────────────────────────────────
export default function UserPage() {
  const router = useRouter();
  const { toasts, push: pushToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

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

  // ── Build query ───────────────────────────────────────────────────────────
  const buildQuery = useCallback((): GetUsersQuery => {
    const q: GetUsersQuery = {
      page,
      limit: pageSize,
      sortBy: sortField,
      sortOrder: sortDir,
    };
    if (search) q.search = search;
    if (activeTab === "ACTIVE") q.isActive = true;
    if (activeTab === "BLOCKED") q.isActive = false;
    if (activeTab === "ADMIN") q.role = "ADMIN";
    return q;
  }, [page, pageSize, sortField, sortDir, search, activeTab]);

  // ── Fetch users ───────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllUsers(buildQuery());

      const normalized: User[] = res.data.map((u) => ({
        ...u,
        role: (["ADMIN", "STAFF"] as UserRole[]).includes(u.role) ? u.role : "CUSTOMER",
      }));

      // date filter client-side (backend chưa có param ngày cụ thể)
      const filtered = dateFilter
        ? normalized.filter((u) => u.createdAt?.slice(0, 10) === dateFilter)
        : normalized;

      setUsers(filtered);
      setTotal(dateFilter ? filtered.length : res.pagination.total);
      setTotalPages(
        dateFilter
          ? Math.max(Math.ceil(filtered.length / pageSize), 1)
          : res.pagination.totalPages
      );
    } catch {
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [buildQuery, dateFilter, pageSize]);

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const [all, active, blocked, admin] = await Promise.all([
        getAllUsers({ limit: 1 }),
        getAllUsers({ limit: 1, isActive: true }),
        getAllUsers({ limit: 1, isActive: false }),
        getAllUsers({ limit: 1, role: "ADMIN" }),
      ]);
      setStats({
        ALL: all.pagination.total,
        ACTIVE: active.pagination.total,
        BLOCKED: blocked.pagination.total,
        ADMIN: admin.pagination.total,
      });
    } catch { /* stats không critical */ }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSortChange = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
    setShowSortMenu(false);
    setPage(1);
  };

  const handleToggleActive = async (user: User) => {
    if (user.id === MOCK_CURRENT_USER_ID) {
      pushToast("warn", "Bạn không thể tự khóa tài khoản của mình.");
      return;
    }
    if (user.role === "ADMIN") {
      pushToast("warn", "Không thể khóa/mở khóa tài khoản Admin khác.");
      return;
    }
    if (MOCK_ONLINE_IDS.has(user.id) && user.isActive) {
      pushToast("warn", `"${user.fullName || user.email}" đang đăng nhập, không thể khóa.`);
      return;
    }

    const oldValue = user.isActive;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: !oldValue } : u)));
    setLoadingId(user.id);
    try {
      await updateActiveUser(user.id, { isActive: !oldValue });
      fetchStats();
    } catch {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: oldValue } : u)));
      pushToast("error", "Cập nhật trạng thái thất bại.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === MOCK_CURRENT_USER_ID) { pushToast("warn", "Bạn không thể tự xóa tài khoản của mình."); return; }
    if (user.role === "ADMIN") { pushToast("warn", "Không thể xóa tài khoản Admin khác."); return; }
    if (MOCK_ONLINE_IDS.has(user.id)) { pushToast("error", `"${user.fullName || user.email}" đang đăng nhập, không thể xóa.`); return; }
    if (MOCK_ORDERING_IDS.has(user.id)) { pushToast("error", `"${user.fullName || user.email}" đang có đơn hàng đang xử lý, không thể xóa.`); return; }
    if (!confirm(`Xoá người dùng "${user.fullName || user.email}"? Hành động này có thể hoàn tác.`)) return;

    const oldUsers = [...users];
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setLoadingId(user.id);
    try {
      await deleteUser(user.id);
      setTotal((t) => t - 1);
      fetchStats();
    } catch {
      setUsers(oldUsers);
      pushToast("error", "Xóa người dùng thất bại.");
    } finally {
      setLoadingId(null);
    }
  };

  // ── Predicates ────────────────────────────────────────────────────────────
  const isSelf = (u: User) => u.id === MOCK_CURRENT_USER_ID;
  const isOtherAdmin = (u: User) => u.role === "ADMIN" && !isSelf(u);

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns: AdminColumn<User>[] = [
    {
      key: "stt",
      label: "STT",
      width: "w-12",
      align: "center",
      render: (_, idx) => (
        <span className="text-neutral-dark">{(page - 1) * pageSize + idx + 1}</span>
      ),
    },
    {
      key: "fullName",
      label: "Người dùng",
      render: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center shrink-0 overflow-hidden">
            {row.avatarImage
              ? <img src={row.avatarImage} alt={row.fullName} className="w-full h-full object-cover" />
              : <UserIcon size={14} className="text-accent" />}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[13px] font-medium text-primary truncate">{row.fullName || "—"}</span>
            <span className="text-[11px] text-neutral-dark truncate">{row.userName || "—"}</span>
          </div>
          {MOCK_ONLINE_IDS.has(row.id) && (
            <span className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-medium">
              <LogIn size={9} /> Online
            </span>
          )}
          {MOCK_ORDERING_IDS.has(row.id) && (
            <span className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-medium">
              <ShoppingCart size={9} /> Đặt hàng
            </span>
          )}
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] text-primary">{row.email}</span>
          {row.phone && <span className="text-[11px] text-neutral-dark">{row.phone}</span>}
        </div>
      ),
    },
    {
      key: "role",
      label: "Vai trò",
      align: "center",
      render: (row) => (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${roleColor[row.role] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}>
          {row.role === "ADMIN" ? "Admin" : row.role === "STAFF" ? "Nhân viên" : "Khách hàng"}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Trạng thái",
      align: "center",
      render: (row) => {
        const isLoadingRow = loadingId === row.id;
        const locked = isSelf(row) || isOtherAdmin(row) || (MOCK_ONLINE_IDS.has(row.id) && row.isActive);
        return (
          <div className="flex items-center justify-center">
            <div
              onClick={() => !isLoadingRow && !locked && handleToggleActive(row)}
              title={
                isSelf(row) ? "Không thể tự khóa" :
                isOtherAdmin(row) ? "Không thể khóa admin khác" :
                MOCK_ONLINE_IDS.has(row.id) && row.isActive ? "Đang đăng nhập, không thể khóa" :
                row.isActive ? "Đang hoạt động – nhấn để khóa" : "Đã khóa – nhấn để mở"
              }
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
      key: "actions",
      label: "Hành động",
      align: "center",
      render: (row) => {
        if (isSelf(row) || isOtherAdmin(row)) {
          return <span className="text-[11px] text-neutral-dark italic">—</span>;
        }
        const isLoadingRow = loadingId === row.id;
        const cantDelete = MOCK_ONLINE_IDS.has(row.id) || MOCK_ORDERING_IDS.has(row.id);
        return (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => router.push(`/admin/users/${row.id}/edit`)}
              title="Chỉnh sửa"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-primary hover:bg-accent-light hover:text-accent transition-all cursor-pointer"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => !isLoadingRow && !cantDelete && handleDeleteUser(row)}
              disabled={isLoadingRow || cantDelete}
              title={
                MOCK_ONLINE_IDS.has(row.id) ? "Đang đăng nhập, không thể xóa" :
                MOCK_ORDERING_IDS.has(row.id) ? "Đang đặt hàng, không thể xóa" : "Xóa người dùng"
              }
              className={[
                "w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                isLoadingRow || cantDelete
                  ? "text-neutral-active cursor-not-allowed opacity-50"
                  : "text-primary hover:bg-promotion-light hover:text-promotion cursor-pointer",
              ].join(" ")}
            >
              {isLoadingRow ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
        );
      },
    },
  ];

  const hasFilter = activeTab !== "ALL" || !!search || !!dateFilter;

  return (
    <div className="space-y-5 p-5 bg-neutral-light h-full">
      <ToastContainer toasts={toasts} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Tổng người dùng" value={stats.ALL} sub="Tất cả tài khoản" icon={<UserIcon size={18} />} valueClassName="text-accent" />
        <StatsCard label="Hoạt động" value={stats.ACTIVE} sub="Đang hoạt động bình thường" icon={<UserIcon size={18} />} valueClassName="text-emerald-600" />
        <StatsCard label="Bị khóa" value={stats.BLOCKED} sub="Tài khoản bị khóa" icon={<UserIcon size={18} />} valueClassName="text-promotion" />
        <StatsCard label="Admin" value={stats.ADMIN} sub="Quyền quản trị viên" icon={<UserIcon size={18} />} valueClassName="text-purple-600" />
      </div>

      <div className="bg-neutral-light border border-neutral rounded-xl">
        {/* Filter bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral gap-3 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button key={tab.value} onClick={() => handleTabChange(tab.value)}
                className={[
                  "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap cursor-pointer",
                  activeTab === tab.value ? "bg-accent text-white shadow-sm" : "text-primary hover:bg-neutral-light-active",
                ].join(" ")}>
                {tab.label}
                <span className={[
                  "ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold",
                  activeTab === tab.value ? "bg-white/20 text-white" : "bg-neutral-light-active text-primary",
                ].join(" ")}>
                  {stats[tab.value] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <form onSubmit={handleSearch} className="relative">
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm tên, email, username..."
                className="w-52 pl-9 pr-3 py-2 text-[12px] border border-neutral rounded-lg bg-neutral-light-active text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark" />
            </form>

            <div className="relative">
              <button onClick={() => setShowSortMenu((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral bg-neutral-light text-primary text-[12px] font-medium hover:bg-neutral-light-active transition-all cursor-pointer">
                <ArrowUpDown size={13} /> Sắp xếp
                <ChevronDown size={12} className={`transition-transform ${showSortMenu ? "rotate-180" : ""}`} />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-neutral-light border border-neutral rounded-xl shadow-lg z-20 overflow-hidden">
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => handleSortChange(opt.value)}
                      className={[
                        "w-full flex items-center justify-between px-3 py-2 text-[12px] transition-colors cursor-pointer",
                        sortField === opt.value ? "bg-accent-light text-accent font-medium" : "text-primary hover:bg-neutral-light-active",
                      ].join(" ")}>
                      {opt.label}
                      {sortField === opt.value && <span className="text-[10px]">{sortDir === "asc" ? "↑" : "↓"}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date filter — client-side; backend cần bổ sung createdFrom/createdTo để server-side */}
            <div className="relative">
              <input type="date" value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                className="pl-9 pr-3 py-2 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer" />
              <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
            </div>

            <button onClick={() => router.push("/admin/users/create")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent-hover transition-all shadow-sm cursor-pointer">
              <Plus size={14} /> Thêm người dùng
            </button>
          </div>
        </div>

        {/* Result info */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral bg-neutral-light-active/40">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-dark">{total} người dùng</span>
            {hasFilter && (
              <button
                onClick={() => { setSearch(""); setSearchInput(""); setDateFilter(""); setActiveTab("ALL"); setPage(1); }}
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

        {error && (
          <div className="flex items-center justify-between px-5 py-3 bg-promotion-light border-b border-promotion-light-active">
            <span className="text-[12px] text-promotion">{error}</span>
            <button onClick={fetchUsers} className="flex items-center gap-1 text-[12px] text-promotion hover:underline cursor-pointer">
              <RefreshCw size={12} /> Thử lại
            </button>
          </div>
        )}

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

        <div className="px-5 py-3 border-t border-neutral">
          <AdminPagination
            currentPage={page} totalPages={totalPages} total={total} pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            pageSizeOptions={[10, 20, 50]} siblingCount={1}
          />
        </div>
      </div>

      {showSortMenu && <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />}
    </div>
  );
}