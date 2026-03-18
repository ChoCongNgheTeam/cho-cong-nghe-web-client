"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Eye, Pencil, Trash2, RefreshCw, Loader2, User as UserIcon } from "lucide-react";
import { getAllUsers } from "./_libs/getAllUsers";
import { updateActiveUser } from "./_libs/updateActiveUser";
import { deleteUser } from "./_libs/deleteUser";
import { User, UserRole } from "./user.types";
import AdminPagination from "@/components/admin/PaginationAdmin";
import { StatsCard } from "@/components/admin/StatsCard";

const roleColor: Record<UserRole, string> = {
  ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  STAFF: "bg-blue-100 text-blue-800 border-blue-200",
  CUSTOMER: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const STATUS_TABS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Hoạt động", value: "ACTIVE" },
  { label: "Bị khóa", value: "BLOCKED" },
  { label: "Admin", value: "ADMIN" },
];

export default function UserPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "BLOCKED" | "ADMIN">("ALL");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Fetch users ──────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllUsers();
      // Normalize role nếu cần
      const normalized = res.data.map((u: any) => ({
        ...u,
        role: ["ADMIN", "STAFF"].includes(u.role) ? u.role : "CUSTOMER",
      }));
      setUsers(normalized);
    } catch (err: any) {
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Computed filtered & paginated ───────────────────────────────────────────
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(search.toLowerCase()) || user.email?.toLowerCase().includes(search.toLowerCase()) || user.userName?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "ACTIVE") return user.isActive;
    if (activeTab === "BLOCKED") return !user.isActive;
    if (activeTab === "ADMIN") return user.role === "ADMIN";
    return true;
  });

  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const counts = {
    ALL: users.length,
    ACTIVE: users.filter((u) => u.isActive).length,
    BLOCKED: users.filter((u) => !u.isActive).length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleTabChange = (tab: "ALL" | "ACTIVE" | "BLOCKED" | "ADMIN") => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleToggleActive = async (user: User) => {
    const oldValue = user.isActive;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: !oldValue } : u)));
    setLoadingId(user.id);
    try {
      await updateActiveUser(user.id, { isActive: !oldValue });
    } catch {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: oldValue } : u)));
      setError("Cập nhật trạng thái thất bại");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá người dùng này?")) return;
    const oldUsers = [...users];
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setLoadingId(id);
    try {
      await deleteUser(id);
    } catch {
      setUsers(oldUsers);
      setError("Xóa người dùng thất bại");
    } finally {
      setLoadingId(null);
    }
  };

  const hasFilter = activeTab !== "ALL";

  return (
    <div className="space-y-5 p-5 bg-neutral-light h-full">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Tổng người dùng" value={counts.ALL} sub="Tất cả tài khoản trong hệ thống" icon={<UserIcon size={18} />} valueClassName="text-blue-600" />
        <StatsCard label="Hoạt động" value={counts.ACTIVE} sub="Đang hoạt động bình thường" icon={<UserIcon size={18} />} valueClassName="text-emerald-600" />
        <StatsCard label="Bị khóa" value={counts.BLOCKED} sub="Tài khoản bị khóa" icon={<UserIcon size={18} />} valueClassName="text-red-600" />
        <StatsCard label="Admin" value={counts.ADMIN} sub="Quyền quản trị viên" icon={<UserIcon size={18} />} valueClassName="text-purple-600" />
      </div>

      <div className="bg-neutral-light border border-neutral rounded-xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral gap-4 flex-wrap">
          {/* Tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value as any)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.value ? "bg-accent text-white shadow-sm" : "text-primary hover:bg-neutral-light-active"
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${activeTab === tab.value ? "bg-white/20 text-white" : "bg-neutral-light-active text-primary"}`}>
                  {counts[tab.value] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm tên, email, username..."
                className="w-52 pl-9 pr-3 py-2 text-[12px] border border-neutral rounded-lg bg-neutral-light-active text-primary placeholder:text-primary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" />
            </form>

            <button
              onClick={() => router.push("/admin/users/create")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent-hover transition-all shadow-sm cursor-pointer"
            >
              <Plus size={14} /> Thêm người dùng
            </button>
          </div>
        </div>

        {/* Filter chip */}
        {hasFilter && (
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-neutral bg-neutral-light-active/50 flex-wrap">
            <span className="text-[11px] text-neutral-dark">Đang lọc:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-light border border-accent text-[11px] text-accent font-medium">
              {activeTab === "ACTIVE" ? "Hoạt động" : activeTab === "BLOCKED" ? "Bị khóa" : "Admin"}
              <Trash2
                size={10}
                className="cursor-pointer hover:text-promotion"
                onClick={() => {
                  setActiveTab("ALL");
                  setPage(1);
                }}
              />
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between px-5 py-3 bg-promotion-light border-b border-promotion-light-active">
            <span className="text-[12px] text-promotion">{error}</span>
            <button onClick={fetchUsers} className="flex items-center gap-1 text-[12px] text-promotion hover:underline cursor-pointer">
              <RefreshCw size={12} /> Thử lại
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-light-active border-b border-neutral">
                {["STT", "Họ tên", "Email / Username", "Vai trò", "Trạng thái", "Hành động"].map((col, i) => (
                  <th key={i} className="px-4 py-3 text-left text-[12px] font-semibold text-primary uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-primary">
                      <Loader2 size={36} className="animate-spin opacity-40" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-primary">
                      <UserIcon size={36} className="opacity-40" />
                      <span className="text-sm">Không có người dùng nào</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, idx) => {
                  const rowNum = (page - 1) * pageSize + idx + 1;
                  const isLoading = loadingId === user.id;

                  return (
                    <tr key={user.id} className="border-b border-neutral hover:bg-neutral-light-active/60 transition-colors duration-100">
                      <td className="px-4 py-3.5 text-[12px] text-primary">{rowNum}</td>

                      <td className="px-4 py-3.5 text-[12px] font-medium text-primary">{user.fullName || "—"}</td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5 text-[12px]">
                          <span className="text-primary">{user.email}</span>
                          <span className="text-primary/60">{user.userName || "—"}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${roleColor[user.role] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                          {user.role === "ADMIN" ? "Admin" : user.role === "STAFF" ? "Nhân viên" : "Khách hàng"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => !isLoading && handleToggleActive(user)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                              user.isActive ? "bg-blue-500" : "bg-gray-300"
                            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${user.isActive ? "translate-x-5" : "translate-x-0"}`} />
                          </div>
                          {isLoading && <Loader2 size={14} className="animate-spin text-accent" />}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-primary hover:bg-accent-light hover:text-accent transition-all"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isLoading}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-primary hover:bg-promotion-light hover:text-promotion transition-all disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-neutral">
          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            pageSizeOptions={[10, 20, 50]}
            siblingCount={1}
          />
        </div>
      </div>
    </div>
  );
}
