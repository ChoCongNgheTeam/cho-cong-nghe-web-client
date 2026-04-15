"use client";

import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import {
   Search,
   Plus,
   Pencil,
   Trash2,
   RefreshCw,
   Loader2,
   User as UserIcon,
   ArrowUpDown,
   Calendar,
   ChevronDown,
   LogIn,
   ShoppingCart,
   RotateCcw,
   AlertTriangle,
   X,
   Package,
   ChevronRight,
   ExternalLink,
   Clock,
   CheckCircle2,
   Truck,
   XCircle,
   CircleDashed,
   Ban,
   TrendingUp,
   DollarSign,
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
import apiRequest from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type FilterTab = "ALL" | "ACTIVE" | "BLOCKED" | "ADMIN";
type SortField =
   | "createdAt"
   | "fullName"
   | "email"
   | "role"
   | "orderCount"
   | "totalSpent";
type SortDir = "asc" | "desc";
type StatsMap = Record<FilterTab, number>;

interface OrderSummary {
   id: string;
   orderCode: string;
   orderDate: string;
   totalAmount: number;
   orderStatus: string;
   paymentStatus: string;
   itemCount?: number;
}

interface UserWithStats extends User {
   orderCount?: number;
   totalSpent?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

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

const SORT_OPTIONS: {
   value: SortField;
   label: string;
   icon?: React.ReactNode;
}[] = [
   { value: "createdAt", label: "Ngày tạo" },
   { value: "fullName", label: "Họ tên" },
   { value: "email", label: "Email" },
   { value: "role", label: "Vai trò" },
   {
      value: "orderCount",
      label: "Nhiều đơn nhất",
      icon: <ShoppingCart size={11} />,
   },
   {
      value: "totalSpent",
      label: "Chi tiêu cao nhất",
      icon: <DollarSign size={11} />,
   },
];

const CLIENT_SIDE_SORT_FIELDS: SortField[] = ["orderCount", "totalSpent"];

const ORDER_STATUS_CONFIG: Record<
   string,
   { label: string; icon: React.ReactNode; className: string }
> = {
   PENDING: {
      label: "Chờ xác nhận",
      icon: <CircleDashed size={12} />,
      className: "bg-amber-50 text-amber-600 border-amber-200",
   },
   PROCESSING: {
      label: "Đang xử lý",
      icon: <Clock size={12} />,
      className: "bg-blue-50 text-blue-600 border-blue-200",
   },
   SHIPPED: {
      label: "Đang giao",
      icon: <Truck size={12} />,
      className: "bg-violet-50 text-violet-600 border-violet-200",
   },
   DELIVERED: {
      label: "Đã giao",
      icon: <CheckCircle2 size={12} />,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
   },
   CANCELLED: {
      label: "Đã hủy",
      icon: <XCircle size={12} />,
      className: "bg-red-50 text-red-500 border-red-200",
   },
};

const PAYMENT_STATUS_CONFIG: Record<
   string,
   { label: string; className: string }
> = {
   UNPAID: { label: "Chưa thanh toán", className: "text-orange-500" },
   PAID: { label: "Đã thanh toán", className: "text-emerald-600" },
   REFUNDED: { label: "Hoàn tiền", className: "text-violet-600" },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function normalizeRole(role?: string): string {
   return (role ?? "").toUpperCase();
}

function formatDateTime(iso?: string) {
   if (!iso) return "—";
   const d = new Date(iso);
   const date = d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
   });
   const time = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
   });
   return { date, time };
}

function formatCurrency(amount: number) {
   return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
   }).format(amount);
}

function formatOrderDate(iso: string) {
   const d = new Date(iso);
   return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
   });
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────

function OrderStatusBadge({ status }: { status: string }) {
   const cfg = ORDER_STATUS_CONFIG[status] ?? {
      label: status,
      icon: null,
      className: "bg-gray-50 text-gray-600 border-gray-200",
   };
   return (
      <span
         className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.className}`}
      >
         {cfg.icon}
         {cfg.label}
      </span>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// USER ORDER SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

function UserOrderSidebarInner({
   user,
   onClose,
}: {
   user: User;
   onClose: () => void;
}) {
   const router = useRouter();
   const [orders, setOrders] = useState<OrderSummary[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const sidebarRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      setOrders([]);
      setError(null);
      setLoading(true);
      const controller = new AbortController();
      const fetchOrders = async () => {
         try {
            const res = await apiRequest.get<any>("/orders/admin/all", {
               params: { userId: user.id, limit: 100, page: 1 },
               signal: controller.signal,
            });
            const rawData: any[] = res.data ?? [];
            const filtered = rawData.filter(
               (o: any) => !o.userId || o.userId === user.id,
            );
            const data: OrderSummary[] = filtered.map((o: any) => ({
               id: o.id,
               orderCode: o.orderCode,
               orderDate: o.orderDate,
               totalAmount: Number(o.totalAmount),
               orderStatus: o.orderStatus,
               paymentStatus: o.paymentStatus,
               itemCount: o.orderItems?.length,
            }));
            setOrders(data);
         } catch (err: any) {
            if (err?.name === "CanceledError" || err?.name === "AbortError")
               return;
            setError("Không thể tải đơn hàng");
         } finally {
            setLoading(false);
         }
      };
      fetchOrders();
      return () => controller.abort();
   }, [user.id]);

   useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
         if (
            sidebarRef.current &&
            !sidebarRef.current.contains(e.target as Node)
         ) {
            onClose();
         }
      };
      setTimeout(
         () => document.addEventListener("mousedown", handleClickOutside),
         100,
      );
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, [onClose]);

   useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
         if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
   }, [onClose]);

   const totalSpent = orders.reduce((s, o) => s + o.totalAmount, 0);

   return (
      <>
         <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 opacity-100 pointer-events-auto"
            onClick={onClose}
         />
         <div
            ref={sidebarRef}
            className="fixed top-0 right-0 z-50 h-full w-[420px] max-w-[95vw] bg-neutral-light border-l border-neutral shadow-2xl flex flex-col transition-transform duration-300 ease-out translate-x-0"
         >
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral bg-neutral-light shrink-0">
               <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-accent-light flex items-center justify-center shrink-0 overflow-hidden">
                     {user.avatarImage ? (
                        <img
                           src={user.avatarImage}
                           alt={user.fullName}
                           className="w-full h-full object-cover"
                        />
                     ) : (
                        <UserIcon size={16} className="text-accent" />
                     )}
                  </div>
                  <div className="min-w-0">
                     <p className="text-[13px] font-semibold text-primary truncate">
                        {user.fullName || user.userName || "—"}
                     </p>
                     <p className="text-[11px] text-primary/50 truncate">
                        {user.email}
                     </p>
                  </div>
               </div>
               <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-primary/50 hover:bg-neutral-light-active hover:text-primary transition-all cursor-pointer shrink-0"
               >
                  <X size={16} />
               </button>
            </div>

            <div className="px-5 py-3 border-b border-neutral bg-neutral-light-active/40 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-2">
                  <Package size={14} className="text-primary/60" />
                  <span className="text-[12px] font-semibold text-primary">
                     Lịch sử đơn hàng
                  </span>
               </div>
               {!loading && !error && (
                  <div className="flex items-center gap-2">
                     <span className="text-[11px] text-primary/50 bg-neutral-light-active px-2 py-0.5 rounded-full border border-neutral">
                        {orders.length} đơn
                     </span>
                     {orders.length > 0 && (
                        <span className="text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                           {formatCurrency(totalSpent)}
                        </span>
                     )}
                  </div>
               )}
            </div>

            <div className="flex-1 overflow-y-auto">
               {loading ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3">
                     <Loader2
                        size={24}
                        className="animate-spin text-accent/50"
                     />
                     <span className="text-[12px] text-primary/50">
                        Đang tải đơn hàng...
                     </span>
                  </div>
               ) : error ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-2 px-6 text-center">
                     <Ban size={28} className="text-primary/20" />
                     <p className="text-[13px] text-primary/60">{error}</p>
                  </div>
               ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-2 px-6 text-center">
                     <ShoppingCart size={32} className="text-primary/20" />
                     <p className="text-[13px] text-primary/60">
                        Người dùng chưa có đơn hàng nào
                     </p>
                  </div>
               ) : (
                  <div className="divide-y divide-neutral">
                     {orders.map((order) => {
                        const paymentCfg =
                           PAYMENT_STATUS_CONFIG[order.paymentStatus];
                        return (
                           <div
                              key={order.id}
                              className="px-5 py-4 hover:bg-neutral-light-active/50 transition-colors group"
                           >
                              <div className="flex items-start justify-between gap-2">
                                 <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                       <span className="text-[12px] font-semibold text-primary font-mono">
                                          #{order.orderCode}
                                       </span>
                                       <button
                                          onClick={() =>
                                             router.push(
                                                `/admin/orders/${order.id}`,
                                             )
                                          }
                                          className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded text-primary/40 hover:text-accent cursor-pointer"
                                          title="Xem chi tiết đơn hàng"
                                       >
                                          <ExternalLink size={11} />
                                       </button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                       <span className="text-[11px] text-primary/50">
                                          {formatOrderDate(order.orderDate)}
                                       </span>
                                       {order.itemCount !== undefined && (
                                          <>
                                             <span className="text-primary/30">
                                                ·
                                             </span>
                                             <span className="text-[11px] text-primary/50">
                                                {order.itemCount} sản phẩm
                                             </span>
                                          </>
                                       )}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                       <OrderStatusBadge
                                          status={order.orderStatus}
                                       />
                                       {paymentCfg && (
                                          <span
                                             className={`text-[10px] font-medium ${paymentCfg.className}`}
                                          >
                                             {paymentCfg.label}
                                          </span>
                                       )}
                                    </div>
                                 </div>
                                 <div className="flex flex-col items-end gap-1 shrink-0">
                                    <span className="text-[13px] font-semibold text-primary">
                                       {formatCurrency(order.totalAmount)}
                                    </span>
                                    <button
                                       onClick={() =>
                                          router.push(
                                             `/admin/orders/${order.id}`,
                                          )
                                       }
                                       className="w-6 h-6 flex items-center justify-center rounded-lg text-primary/30 hover:text-accent hover:bg-accent/10 transition-all cursor-pointer"
                                    >
                                       <ChevronRight size={13} />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>

            {!loading && orders.length > 0 && (
               <div className="px-5 py-3 border-t border-neutral shrink-0 bg-neutral-light">
                  <div className="flex items-center justify-between text-[11px] text-primary/50">
                     <span>Tổng {orders.length} đơn hàng</span>
                     <span className="font-semibold text-primary">
                        {formatCurrency(totalSpent)}
                     </span>
                  </div>
               </div>
            )}
         </div>
      </>
   );
}

function UserOrderSidebar({
   user,
   onClose,
}: {
   user: User | null;
   onClose: () => void;
}) {
   if (!user) return null;
   return <UserOrderSidebarInner key={user.id} user={user} onClose={onClose} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE MODAL
// ─────────────────────────────────────────────────────────────────────────────

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
         <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
         />
         <div className="relative bg-neutral-light rounded-2xl border border-neutral shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex flex-col items-center gap-4 text-center">
               <div className="w-12 h-12 rounded-full bg-promotion-light flex items-center justify-center">
                  <AlertTriangle size={22} className="text-promotion" />
               </div>
               <div>
                  <p className="text-base font-semibold text-primary">
                     Xóa nhân viên?
                  </p>
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function UserPage() {
   const router = useRouter();
   const { success, error: toastError } = useToasty();
   const auth = useContext(AuthContext);
   const currentUserId = auth?.user?.id;
   const currentUserRole = normalizeRole(auth?.user?.role);

   const ONLINE_IDS = new Set<string>([]);
   const ORDERING_IDS = new Set<string>([]);

   const [users, setUsers] = useState<UserWithStats[]>([]);
   const [total, setTotal] = useState(0);
   const [totalPages, setTotalPages] = useState(1);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [loadingId, setLoadingId] = useState<string | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
   const [statsLoading, setStatsLoading] = useState(false);
   const [selectedUser, setSelectedUser] = useState<User | null>(null);

   const [searchInput, setSearchInput] = useState("");
   const [search, setSearch] = useState("");
   const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
   const [sortField, setSortField] = useState<SortField>("createdAt");
   const [sortDir, setSortDir] = useState<SortDir>("desc");
   const [showSortMenu, setShowSortMenu] = useState(false);
   const [dateFilter, setDateFilter] = useState("");
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(10);
   const [stats, setStats] = useState<StatsMap>({
      ALL: 0,
      ACTIVE: 0,
      BLOCKED: 0,
      ADMIN: 0,
   });

   // ── Sort dropdown: fixed positioning ──
   const sortBtnRef = useRef<HTMLButtonElement>(null);
   const [sortMenuPos, setSortMenuPos] = useState({
      top: 0,
      left: 0,
      width: 0,
   });

   const handleSortToggle = () => {
      if (!showSortMenu && sortBtnRef.current) {
         const rect = sortBtnRef.current.getBoundingClientRect();
         setSortMenuPos({
            top: rect.bottom + 6,
            left: rect.left,
            width: rect.width,
         });
      }
      setShowSortMenu((v) => !v);
   };

   const isClientSort = CLIENT_SIDE_SORT_FIELDS.includes(sortField);

   const buildQuery = useCallback((): GetUsersQuery => {
      const q: GetUsersQuery = {
         page,
         limit: isClientSort ? 100 : pageSize,
         sortBy: (isClientSort
            ? "createdAt"
            : sortField) as GetUsersQuery["sortBy"],
         sortOrder: isClientSort ? "desc" : sortDir,
      };
      if (search) q.search = search;
      if (activeTab === "ACTIVE") q.isActive = true;
      if (activeTab === "BLOCKED") q.isActive = false;
      if (activeTab === "ADMIN") q.role = "ADMIN";
      return q;
   }, [page, pageSize, sortField, sortDir, search, activeTab, isClientSort]);

   const fetchUserOrderStats = async (
      userId: string,
   ): Promise<{ orderCount: number; totalSpent: number }> => {
      try {
         const res = await apiRequest.get<any>("/orders/admin/all", {
            params: { userId, limit: 100, page: 1 },
         });
         const rawData: any[] = res.data ?? [];
         const userOrders = rawData.filter(
            (o: any) => !o.userId || o.userId === userId,
         );
         return {
            orderCount: userOrders.length,
            totalSpent: userOrders.reduce(
               (sum: number, o: any) => sum + Number(o.totalAmount || 0),
               0,
            ),
         };
      } catch {
         return { orderCount: 0, totalSpent: 0 };
      }
   };

   const fetchUsers = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         const res = await getAllUsers(buildQuery());
         let normalized: UserWithStats[] = res.data.map((u) => ({
            ...u,
            role: (["ADMIN", "STAFF"] as UserRole[]).includes(u.role)
               ? u.role
               : "CUSTOMER",
         }));

         const filtered = dateFilter
            ? normalized.filter((u) => u.createdAt?.slice(0, 10) === dateFilter)
            : normalized;

         if (isClientSort) {
            setStatsLoading(true);
            const statsResults = await Promise.all(
               filtered.map((u) => fetchUserOrderStats(u.id)),
            );
            filtered.forEach((u, i) => {
               u.orderCount = statsResults[i].orderCount;
               u.totalSpent = statsResults[i].totalSpent;
            });
            filtered.sort((a, b) => {
               const fieldA =
                  sortField === "orderCount"
                     ? (a.orderCount ?? 0)
                     : (a.totalSpent ?? 0);
               const fieldB =
                  sortField === "orderCount"
                     ? (b.orderCount ?? 0)
                     : (b.totalSpent ?? 0);
               return sortDir === "desc" ? fieldB - fieldA : fieldA - fieldB;
            });
            const start = (page - 1) * pageSize;
            const paginated = filtered.slice(start, start + pageSize);
            setUsers(paginated);
            setTotal(filtered.length);
            setTotalPages(Math.max(Math.ceil(filtered.length / pageSize), 1));
            setStatsLoading(false);
         } else {
            setUsers(filtered);
            setTotal(dateFilter ? filtered.length : res.pagination.total);
            setTotalPages(
               dateFilter
                  ? Math.max(Math.ceil(filtered.length / pageSize), 1)
                  : res.pagination.totalPages,
            );
         }
      } catch {
         setError("Không thể tải danh sách người dùng");
      } finally {
         setLoading(false);
      }
   }, [
      buildQuery,
      dateFilter,
      pageSize,
      isClientSort,
      sortField,
      sortDir,
      page,
   ]);

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
            BLOCKED: Math.max(
               0,
               all.pagination.total - active.pagination.total,
            ),
            ADMIN: admin.pagination.total,
         });
      } catch (e) {
         console.error("fetchStats error:", e);
      }
   }, []);

   useEffect(() => {
      fetchUsers();
   }, [fetchUsers]);
   useEffect(() => {
      fetchStats();
   }, [fetchStats]);

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
      if (sortField === field)
         setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
         setSortField(field);
         setSortDir(CLIENT_SIDE_SORT_FIELDS.includes(field) ? "desc" : "asc");
      }
      setShowSortMenu(false);
      setPage(1);
   };
   const handleClearFilters = () => {
      setSearch("");
      setSearchInput("");
      setDateFilter("");
      setActiveTab("ALL");
      setSortField("createdAt");
      setSortDir("desc");
      setPage(1);
   };

   function isBlockAllowed(u: User): boolean {
      if (u.id === currentUserId) return false;
      if (normalizeRole(u.role) === "ADMIN") return false;
      return currentUserRole === "ADMIN";
   }
   function getBlockTitle(u: User): string {
      if (u.id === currentUserId)
         return "Không thể thay đổi trạng thái của chính mình";
      if (normalizeRole(u.role) === "ADMIN")
         return "Không thể khóa tài khoản Admin khác";
      if (currentUserRole !== "ADMIN")
         return "Chỉ Admin mới có thể khóa/mở tài khoản";
      if (ONLINE_IDS.has(u.id) && u.isActive)
         return "Không thể khóa khi đang online";
      return u.isActive
         ? "Đang hoạt động – nhấn để khóa"
         : "Đã khóa – nhấn để mở";
   }
   function isEditAllowed(u: User): boolean {
      if (normalizeRole(u.role) === "ADMIN") return false;
      return currentUserRole === "ADMIN";
   }
   function isDeleteAllowed(u: User): boolean {
      if (normalizeRole(u.role) !== "STAFF") return false;
      return currentUserRole === "ADMIN";
   }

   const handleToggleActive = async (user: User) => {
      if (!isBlockAllowed(user)) return;
      const oldValue = user.isActive;
      setUsers((prev) =>
         prev.map((u) =>
            u.id === user.id ? { ...u, isActive: !oldValue } : u,
         ),
      );
      setLoadingId(user.id);
      try {
         await updateActiveUser(user.id, { isActive: !oldValue });
         fetchStats();
      } catch {
         setUsers((prev) =>
            prev.map((u) =>
               u.id === user.id ? { ...u, isActive: oldValue } : u,
            ),
         );
         toastError("Cập nhật trạng thái thất bại.");
      } finally {
         setLoadingId(null);
      }
   };

   const handleDeleteConfirm = async () => {
      if (!deleteTarget) return;
      if (!isDeleteAllowed(deleteTarget)) {
         toastError("Không có quyền xóa người dùng này.");
         setDeleteTarget(null);
         return;
      }
      const user = deleteTarget;
      setDeleteTarget(null);
      const oldUsers = [...users];
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setLoadingId(user.id);
      try {
         await deleteUser(user.id);
         setTotal((t) => t - 1);
         fetchStats();
         success("Xóa nhân viên thành công!");
      } catch {
         setUsers(oldUsers);
         toastError("Xóa nhân viên thất bại.");
      } finally {
         setLoadingId(null);
      }
   };

   const hasFilter =
      activeTab !== "ALL" || !!search || !!dateFilter || isClientSort;

   const columns: AdminColumn<UserWithStats>[] = [
      {
         key: "stt",
         label: "STT",
         width: "w-14",
         align: "center",
         render: (_, idx) => (
            <span className="text-neutral-dark">
               {(page - 1) * pageSize + idx + 1}
            </span>
         ),
      },
      {
         key: "fullName",
         label: "Người dùng",
         render: (row) => (
            <div
               className="flex items-center gap-3 min-w-0 cursor-pointer group/name"
               onClick={() => setSelectedUser(row)}
               title="Xem đơn hàng"
            >
               <div className="w-9 h-9 rounded-full bg-accent-light flex items-center justify-center shrink-0 overflow-hidden">
                  {row.avatarImage ? (
                     <img
                        src={row.avatarImage}
                        alt={row.fullName}
                        className="w-full h-full object-cover"
                     />
                  ) : (
                     <UserIcon size={15} className="text-accent" />
                  )}
               </div>
               <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[13px] font-medium text-primary truncate group-hover/name:text-accent transition-colors">
                     {row.fullName || "—"}
                  </span>
                  <span className="text-[11px] text-neutral-dark truncate">
                     {row.userName || "—"}
                  </span>
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
         key: "email",
         label: "Email",
         render: (row) => (
            <div className="flex flex-col gap-0.5">
               <span className="text-[13px] text-primary">{row.email}</span>
               {row.phone && (
                  <span className="text-[11px] text-neutral-dark">
                     {row.phone}
                  </span>
               )}
            </div>
         ),
      },
      {
         key: "role",
         label: "Vai trò",
         align: "center",
         render: (row) => (
            <span
               className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${roleColor[row.role] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}
            >
               {normalizeRole(row.role) === "ADMIN"
                  ? "Admin"
                  : normalizeRole(row.role) === "STAFF"
                    ? "Nhân viên"
                    : "Khách hàng"}
            </span>
         ),
      },
      ...(isClientSort
         ? [
              {
                 key: "orderCount" as any,
                 label: "Đơn hàng",
                 align: "center" as const,
                 render: (row: UserWithStats) => (
                    <div className="flex flex-col items-center gap-0.5">
                       <span className="text-[13px] font-semibold text-primary">
                          {row.orderCount ?? "—"}
                       </span>
                       {row.totalSpent !== undefined && (
                          <span className="text-[10px] text-neutral-dark">
                             {formatCurrency(row.totalSpent)}
                          </span>
                       )}
                    </div>
                 ),
              },
           ]
         : []),
      {
         key: "isActive",
         label: "Trạng thái",
         align: "center",
         render: (row) => {
            const isLoadingRow = loadingId === row.id;
            const allowed = isBlockAllowed(row);
            const isOnlineLocked = ONLINE_IDS.has(row.id) && row.isActive;
            const interactive = allowed && !isOnlineLocked && !isLoadingRow;
            return (
               <div className="flex items-center justify-center">
                  <div
                     onClick={() => interactive && handleToggleActive(row)}
                     title={getBlockTitle(row)}
                     className={[
                        "w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200",
                        row.isActive ? "bg-accent" : "bg-neutral-active",
                        interactive
                           ? "cursor-pointer"
                           : "opacity-50 cursor-not-allowed",
                     ].join(" ")}
                  >
                     <div
                        className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${row.isActive ? "translate-x-5" : "translate-x-0"}`}
                     />
                  </div>
                  {isLoadingRow && (
                     <Loader2
                        size={13}
                        className="animate-spin text-accent ml-2"
                     />
                  )}
               </div>
            );
         },
      },
      {
         key: "createdAt",
         label: "Ngày tạo",
         align: "center",
         render: (row) => {
            const dt = formatDateTime(row.createdAt);
            if (typeof dt === "string")
               return <span className="text-[12px] text-neutral-dark">—</span>;
            return (
               <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[12px] text-primary font-medium">
                     {dt.date}
                  </span>
                  <span className="text-[11px] text-neutral-dark">
                     {dt.time}
                  </span>
               </div>
            );
         },
      },
      {
         key: "actions",
         label: "Hành động",
         align: "center",
         render: (row) => {
            const isLoadingRow = loadingId === row.id;
            const canEdit = isEditAllowed(row);
            const canDelete = isDeleteAllowed(row);
            const rowRole = normalizeRole(row.role);
            if (rowRole === "ADMIN")
               return (
                  <span className="text-[11px] text-neutral-dark italic">
                     —
                  </span>
               );
            return (
               <div className="flex items-center justify-center gap-1.5">
                  <button
                     onClick={() => {
                        if (canEdit) router.push(`/admin/users/${row.id}/edit`);
                     }}
                     disabled={!canEdit}
                     title={canEdit ? "Chỉnh sửa" : "Không có quyền chỉnh sửa"}
                     className={[
                        "w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                        canEdit
                           ? "text-primary hover:bg-accent-light hover:text-accent cursor-pointer"
                           : "text-neutral-active opacity-40 cursor-not-allowed",
                     ].join(" ")}
                  >
                     <Pencil size={14} />
                  </button>
                  {rowRole === "STAFF" && (
                     <button
                        onClick={() => {
                           if (canDelete && !isLoadingRow) setDeleteTarget(row);
                        }}
                        disabled={!canDelete || isLoadingRow}
                        title={
                           canDelete ? "Xóa nhân viên" : "Không có quyền xóa"
                        }
                        className={[
                           "w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                           canDelete && !isLoadingRow
                              ? "text-primary hover:bg-promotion-light hover:text-promotion cursor-pointer"
                              : "text-neutral-active opacity-40 cursor-not-allowed",
                        ].join(" ")}
                     >
                        {isLoadingRow ? (
                           <Loader2 size={14} className="animate-spin" />
                        ) : (
                           <Trash2 size={14} />
                        )}
                     </button>
                  )}
               </div>
            );
         },
      },
   ];

   return (
      <div className="space-y-5 p-3 sm:p-5 bg-neutral-light h-full">
         {/* ── Modals & Sidebar ── */}
         {deleteTarget && (
            <DeleteModal
               user={deleteTarget}
               onConfirm={handleDeleteConfirm}
               onCancel={() => setDeleteTarget(null)}
            />
         )}
         <UserOrderSidebar
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
         />

         {/* ── Sort menu portal — fixed, thoát khỏi mọi overflow ── */}
         {showSortMenu && (
            <>
               {/* Backdrop để đóng menu */}
               <div
                  className="fixed inset-0 z-[998]"
                  onClick={() => setShowSortMenu(false)}
               />

               {/* Menu — hiện phía TRÊN button bằng translateY(-100%) */}
               <div
                  style={{
                     position: "fixed",
                     top: sortMenuPos.top,
                     left: sortMenuPos.left,
                     width: "208px",
                     zIndex: 999,
                  }}
                  className="bg-neutral-light border border-neutral rounded-xl shadow-xl overflow-hidden"
               >
                  {/* Note (để trên cùng vì menu mở ngược) */}
                  <div className="px-3 py-2 border-b border-neutral bg-amber-50/60">
                     <p className="text-[10px] text-amber-600 leading-relaxed">
                        ⚠ Xếp hạng theo hoạt động sẽ tải dữ liệu đơn hàng của
                        toàn bộ người dùng — có thể mất vài giây.
                     </p>
                  </div>

                  {/* Nhóm sort nâng cao */}
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-dark uppercase tracking-wider border-b border-neutral bg-neutral-light-active/60 flex items-center gap-1.5">
                     <TrendingUp size={10} />
                     Xếp hạng theo hoạt động
                  </div>
                  {SORT_OPTIONS.filter((o) =>
                     CLIENT_SIDE_SORT_FIELDS.includes(o.value),
                  ).map((opt) => (
                     <button
                        key={opt.value}
                        onClick={() => handleSortChange(opt.value)}
                        className={[
                           "w-full flex items-center justify-between px-3 py-2 text-[12px] transition-colors cursor-pointer",
                           sortField === opt.value
                              ? "bg-accent-light text-accent font-medium"
                              : "text-primary hover:bg-neutral-light-active",
                        ].join(" ")}
                     >
                        <span className="flex items-center gap-1.5">
                           {opt.icon}
                           {opt.label}
                        </span>
                        {sortField === opt.value && (
                           <span className="text-[10px]">
                              {sortDir === "asc" ? "↑" : "↓"}
                           </span>
                        )}
                     </button>
                  ))}

                  {/* Nhóm sort thường */}
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-dark uppercase tracking-wider border-t border-b border-neutral">
                     Sắp xếp thông thường
                  </div>
                  {SORT_OPTIONS.filter(
                     (o) => !CLIENT_SIDE_SORT_FIELDS.includes(o.value),
                  ).map((opt) => (
                     <button
                        key={opt.value}
                        onClick={() => handleSortChange(opt.value)}
                        className={[
                           "w-full flex items-center justify-between px-3 py-2 text-[12px] transition-colors cursor-pointer",
                           sortField === opt.value
                              ? "bg-accent-light text-accent font-medium"
                              : "text-primary hover:bg-neutral-light-active",
                        ].join(" ")}
                     >
                        {opt.label}
                        {sortField === opt.value && (
                           <span className="text-[10px]">
                              {sortDir === "asc" ? "↑" : "↓"}
                           </span>
                        )}
                     </button>
                  ))}
               </div>
            </>
         )}

         {/* ── Header ── */}
         <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
                  <UserIcon size={18} className="text-accent" />
               </div>
               <div>
                  <h1 className="text-[15px] font-semibold text-primary">
                     Người dùng
                  </h1>
                  <p className="text-[11px] text-neutral-dark">
                     Quản lý toàn bộ tài khoản trong hệ thống
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <button
                  onClick={fetchUsers}
                  title="Làm mới"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral bg-neutral-light text-neutral-dark hover:bg-neutral-light-active hover:text-primary transition-all cursor-pointer"
               >
                  <RotateCcw size={14} />
               </button>
               <button
                  onClick={() => router.push("/admin/users/create")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent-hover transition-all shadow-sm cursor-pointer"
               >
                  <Plus size={14} /> Thêm người dùng
               </button>
            </div>
         </div>

         {/* ── Stats ── */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatsCard
               label="Tổng người dùng"
               value={stats.ALL}
               sub="Tất cả tài khoản"
               icon={<UserIcon size={18} />}
               valueClassName="text-accent"
            />
            <StatsCard
               label="Hoạt động"
               value={stats.ACTIVE}
               sub="Đang hoạt động bình thường"
               icon={<UserIcon size={18} />}
               valueClassName="text-emerald-600"
            />
            <StatsCard
               label="Bị khóa"
               value={stats.BLOCKED}
               sub="Tài khoản bị khóa"
               icon={<UserIcon size={18} />}
               valueClassName="text-promotion"
            />
            <StatsCard
               label="Admin"
               value={stats.ADMIN}
               sub="Quyền quản trị viên"
               icon={<UserIcon size={18} />}
               valueClassName="text-purple-600"
            />
         </div>

         {/* ── Main card ── */}
         <div className="bg-neutral-light border border-neutral rounded-xl">
            {/* ── Toolbar ── */}
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-neutral overflow-x-auto scrollbar-thin">
               <div className="flex items-center gap-1 shrink-0">
                  {STATUS_TABS.map((tab) => (
                     <button
                        key={tab.value}
                        onClick={() => handleTabChange(tab.value)}
                        className={[
                           "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap cursor-pointer",
                           activeTab === tab.value
                              ? "bg-accent text-white shadow-sm"
                              : "text-primary hover:bg-neutral-light-active",
                        ].join(" ")}
                     >
                        {tab.label}
                        <span
                           className={[
                              "ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold",
                              activeTab === tab.value
                                 ? "bg-white/20 text-white"
                                 : "bg-neutral-light-active text-primary",
                           ].join(" ")}
                        >
                           {stats[tab.value] ?? 0}
                        </span>
                     </button>
                  ))}
               </div>

               <div className="w-px h-5 bg-neutral shrink-0" />

               <form onSubmit={handleSearch} className="relative shrink-0">
                  <input
                     value={searchInput}
                     onChange={(e) => setSearchInput(e.target.value)}
                     placeholder="Tìm tên, email, username..."
                     className="w-52 pl-9 pr-3 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light-active text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  />
                  <Search
                     size={13}
                     className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark"
                  />
               </form>

               {/* ── Sort button — ref để tính vị trí fixed menu ── */}
               <div className="shrink-0">
                  <button
                     ref={sortBtnRef}
                     onClick={handleSortToggle}
                     className={[
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap",
                        isClientSort
                           ? "border-accent bg-accent-light text-accent"
                           : "border-neutral bg-neutral-light text-primary hover:bg-neutral-light-active",
                     ].join(" ")}
                  >
                     {isClientSort ? (
                        sortField === "orderCount" ? (
                           <ShoppingCart size={13} />
                        ) : (
                           <DollarSign size={13} />
                        )
                     ) : (
                        <ArrowUpDown size={13} />
                     )}
                     {SORT_OPTIONS.find((o) => o.value === sortField)?.label ??
                        "Sắp xếp"}
                     <ChevronDown
                        size={11}
                        className={`transition-transform ${showSortMenu ? "rotate-180" : ""}`}
                     />
                  </button>
               </div>

               <div className="relative shrink-0">
                  <input
                     type="date"
                     value={dateFilter}
                     onChange={(e) => {
                        setDateFilter(e.target.value);
                        setPage(1);
                     }}
                     className="pl-8 pr-3 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer"
                  />
                  <Calendar
                     size={13}
                     className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none"
                  />
               </div>

               <div className="flex-1" />

               {statsLoading && (
                  <div className="flex items-center gap-1.5 text-[11px] text-accent shrink-0">
                     <Loader2 size={12} className="animate-spin" />
                     Đang tính toán...
                  </div>
               )}

               <span className="text-[12px] text-neutral-dark whitespace-nowrap shrink-0">
                  {total} người dùng
               </span>
            </div>

            {/* ── Sub-toolbar ── */}
            {hasFilter && (
               <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 border-b border-neutral bg-neutral-light-active/40 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                     <button
                        onClick={handleClearFilters}
                        className="text-[11px] text-accent hover:underline cursor-pointer font-medium"
                     >
                        Xóa bộ lọc
                     </button>
                     {isClientSort && (
                        <span className="text-[11px] text-amber-600 flex items-center gap-1">
                           <TrendingUp size={11} />
                           {sortField === "orderCount"
                              ? "Đang xếp theo số đơn hàng"
                              : "Đang xếp theo tổng chi tiêu"}
                        </span>
                     )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-neutral-dark">
                     <span className="flex items-center gap-1">
                        <LogIn size={10} className="text-emerald-600" /> Đang
                        online
                     </span>
                     <span className="flex items-center gap-1">
                        <ShoppingCart size={10} className="text-amber-500" />{" "}
                        Đang đặt hàng
                     </span>
                  </div>
               </div>
            )}

            {/* ── Error banner ── */}
            {error && (
               <div className="flex items-center justify-between px-5 py-3 bg-promotion-light border-b border-promotion-light-active">
                  <span className="text-[12px] text-promotion">{error}</span>
                  <button
                     onClick={fetchUsers}
                     className="flex items-center gap-1 text-[12px] text-promotion hover:underline cursor-pointer"
                  >
                     <RefreshCw size={12} /> Thử lại
                  </button>
               </div>
            )}

            {/* ── Hint ── */}
            <div className="px-4 py-2 border-b border-neutral bg-accent/5 flex items-center gap-1.5">
               <Package size={11} className="text-accent/70" />
               <span className="text-[11px] text-accent/80">
                  Click vào tên người dùng để xem lịch sử đơn hàng
               </span>
            </div>

            {/* ── Table ── */}
            <div className="overflow-x-auto">
               <AdminTable<UserWithStats>
                  columns={columns}
                  data={users}
                  loading={loading || statsLoading}
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
