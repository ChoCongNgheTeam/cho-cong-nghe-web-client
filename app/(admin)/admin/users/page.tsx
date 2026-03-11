"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, Loader2, Pencil } from "lucide-react";
import { getAllUsers } from "./_libs/getAllUsers";
import { updateActiveUser } from "./_libs/updateActiveUser";
import { deleteUser } from "./_libs/deleteUser";
import { User, UserRole } from "./user.types";
import AdminPagination from "@/components/admin/PaginationAdmin";

const ToggleSwitch = ({ checked, onChange, disabled }: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) => (
  <button onClick={onChange} disabled={disabled}
    className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
      checked ? "bg-blue-500" : "bg-gray-300"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${
      checked ? "translate-x-5" : "translate-x-0"
    }`} />
  </button>
);

const roleColor: Record<UserRole, string> = {
  ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  STAFF: "bg-blue-100 text-blue-800 border-blue-200",
  CUSTOMER: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const normalizeUser = (u: any): User => ({
  id: u.id,
  userName: u.userName ?? "",
  email: u.email ?? "",
  fullName: u.fullName ?? "",
  phone: u.phone ?? "",
  gender: u.gender ?? "OTHER",
  role: u.role,
  isActive: u.isActive ?? true,
  avatarImage: u.avatarImage ?? null,
  createdAt: u.createdAt ?? new Date().toISOString(),
  updatedAt: u.updatedAt ?? new Date().toISOString(),
});

export default function UserPage() {
  const router = useRouter();

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Fetch ──
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllUsers();
        const normalizeRole = (role: string): UserRole => {
          if (role === "ADMIN" || role === "STAFF") return role;
          return "CUSTOMER";
        };
        setUsers(response.data.map((u) => ({ ...u, role: normalizeRole(u.role) })));
      } catch (err) {
        setError("Không thể tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ── Toggle active ──
  const handleToggleActive = async (user: User) => {
    const oldValue = user.isActive;
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: !oldValue } : u));
    setLoadingId(user.id);
    try {
      await updateActiveUser(user.id, { isActive: !oldValue });
    } catch {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: oldValue } : u));
    } finally {
      setLoadingId(null);
    }
  };

  // ── Change role ──
  const handleChangeRole = async (user: User, newRole: UserRole) => {
    const oldRole = user.role;
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
    setLoadingId(user.id);
    try {
      await updateActiveUser(user.id, { isActive: user.isActive });
    } catch {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: oldRole } : u));
    } finally {
      setLoadingId(null);
    }
  };

  // ── Delete ──
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá user này?")) return;
    const oldUsers = [...users];
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setLoadingId(id);
    try {
      await deleteUser(id);
    } catch {
      setUsers(oldUsers);
    } finally {
      setLoadingId(null);
    }
  };

  // ── Filter ──
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    if (filter === "active") return matchesSearch && user.isActive;
    if (filter === "blocked") return matchesSearch && !user.isActive;
    if (filter === "admin") return matchesSearch && user.role === "ADMIN";
    return matchesSearch;
  });

  // ── Pagination ──
  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [search, filter]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1);
  }, [totalPages]);

  return (
    <div className="bg-gray-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push("/admin/users/create")}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-indigo-800 transition-colors cursor-pointer"
            >
              <span>+ Thêm người dùng mới</span>
            </button>

            <div className="flex items-center gap-3">
              <select
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 hover:border-gray-400 transition"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Tất cả ({users.length})</option>
                <option value="active">Đang hoạt động</option>
                <option value="blocked">Bị khóa</option>
                <option value="admin">Admin</option>
              </select>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm theo tên, email..."
                  className="block w-full box-border rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 hover:border-gray-400 transition shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <div className="flex min-h-[400px] items-center justify-center text-lg text-red-600">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-gray-500">
              <p className="text-lg font-medium">Không tìm thấy người dùng nào</p>
              <p className="mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["ID", "Họ tên", "Email", "Vai trò", "Trạng thái", "Hành động"].map((h, i) => (
                      <th key={i} scope="col"
                        className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 ${
                          i === 5 ? "text-center" : "text-left"
                        }`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-indigo-50/40 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {user.id.slice(0, 8)}...
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{user.fullName}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{user.email}</td>

                      {/* Role */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex items-center gap-3 group/role relative">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full shadow-sm border ${
                            roleColor[user.role] || "bg-gray-100 text-gray-800 border-gray-200"
                          }`}>
                            {user.role === "ADMIN" ? "Admin" : user.role === "STAFF" ? "Nhân viên" : "Khách hàng"}
                          </span>
                          <div className="relative opacity-0 group-hover/role:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                            <select disabled={loadingId === user.id} value={user.role}
                              onChange={(e) => handleChangeRole(user, e.target.value as UserRole)}
                              className="absolute inset-0 w-28 opacity-0 cursor-pointer"
                              title="Thay đổi vai trò">
                              <option value="CUSTOMER">Khách hàng</option>
                              <option value="STAFF">Nhân viên</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                            <button type="button" disabled={loadingId === user.id}
                              className="ml-1 text-gray-400 hover:text-indigo-600 disabled:opacity-50">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                          <div className="w-4 h-4 ml-2">
                            {loadingId === user.id && <Loader2 size={14} className="animate-spin text-indigo-600" />}
                          </div>
                        </div>
                      </td>

                      {/* Active */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ToggleSwitch checked={user.isActive} disabled={loadingId === user.id}
                            onChange={() => handleToggleActive(user)} />
                          <div className="w-4 h-4">
                            {loadingId === user.id && <Loader2 size={16} className="animate-spin text-indigo-600" />}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                        <div className="flex items-center justify-center gap-4">
                          <button title="Chỉnh sửa"
                            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                            className="text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer">
                            <Pencil size={18} />
                          </button>
                          <button title="Xóa người dùng"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-gray-500 hover:text-red-600 transition-colors cursor-pointer">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-4 py-3">
                <AdminPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  total={total}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}