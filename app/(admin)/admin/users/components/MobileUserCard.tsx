"use client";

// components/admin/MobileUserCard.tsx
// Dùng trong users/page.tsx — hiển thị trên mobile thay cho table
// Usage: <MobileUserCard users={users} ... />

import { Loader2, User as UserIcon, Pencil, Trash2 } from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, STAFF_ROLES } from "@/(admin)/admin/users/user.types";
import type { User } from "@/(admin)/admin/users/user.types";

// Extend User với stats tùy chọn — khớp với UserWithStats trong page.tsx
type UserWithStats = User & {
  orderCount?: number;
  totalSpent?: number;
};

interface Props {
  users: UserWithStats[];
  loading: boolean;
  loadingId: string | null;
  isClientSort?: boolean;
  onToggleActive: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onViewOrders: (user: User) => void;
  isBlockAllowed: (u: User) => boolean;
  isEditAllowed: (u: User) => boolean;
  isDeleteAllowed: (u: User) => boolean;
  getBlockTitle: (u: User) => string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export default function MobileUserCard({ users, loading, loadingId, onToggleActive, onEdit, onDelete, onViewOrders, isBlockAllowed, isEditAllowed, isDeleteAllowed, getBlockTitle }: Props) {
  if (loading) {
    return (
      <div className="space-y-3 p-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-neutral-light-active animate-pulse" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-primary">
        <UserIcon size={36} className="opacity-30" />
        <span className="text-sm">Không có người dùng nào</span>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral">
      {users.map((user) => {
        const isLoadingRow = loadingId === user.id;
        const canEdit = isEditAllowed(user);
        const canDelete = isDeleteAllowed(user);
        const allowed = isBlockAllowed(user);
        const roleColor = ROLE_COLORS[user.role] ?? "bg-gray-100 text-gray-800 border-gray-200";
        const isAdmin = user.role === "ADMIN";

        return (
          <div key={user.id} className="flex items-start gap-3 px-3 py-3.5 hover:bg-neutral-light-active/40 transition-colors">
            {/* Avatar */}
            <button onClick={() => onViewOrders(user)} className="shrink-0 w-10 h-10 rounded-full bg-accent-light flex items-center justify-center overflow-hidden">
              {user.avatarImage ? <img src={user.avatarImage} alt={user.fullName} className="w-full h-full object-cover" /> : <UserIcon size={16} className="text-accent" />}
            </button>

            {/* Info */}
            <div className="flex-1 min-w-0" onClick={() => onViewOrders(user)}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-semibold text-primary truncate">{user.fullName || user.userName || "—"}</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${roleColor}`}>{ROLE_LABELS[user.role] ?? user.role}</span>
              </div>
              <p className="text-[11px] text-neutral-dark truncate mt-0.5">{user.email}</p>
              {user.orderCount !== undefined && (
                <p className="text-[10px] text-neutral-dark mt-0.5">
                  {user.orderCount} đơn · {formatCurrency(user.totalSpent ?? 0)}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Toggle active */}
              {!isAdmin && (
                <div
                  onClick={() => allowed && !isLoadingRow && onToggleActive(user)}
                  title={getBlockTitle(user)}
                  className={[
                    "w-10 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 shrink-0",
                    user.isActive ? "bg-accent" : "bg-neutral-active",
                    allowed && !isLoadingRow ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
                  ].join(" ")}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${user.isActive ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              )}

              {isLoadingRow && <Loader2 size={13} className="animate-spin text-accent" />}

              {/* Edit */}
              {!isAdmin && (
                <button
                  onClick={() => canEdit && onEdit(user)}
                  disabled={!canEdit}
                  className={[
                    "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                    canEdit ? "text-primary hover:bg-accent-light hover:text-accent cursor-pointer" : "text-neutral-active opacity-40 cursor-not-allowed",
                  ].join(" ")}
                >
                  <Pencil size={14} />
                </button>
              )}

              {/* Delete — only staff roles */}
              {STAFF_ROLES.includes(user.role) && (
                <button
                  onClick={() => canDelete && !isLoadingRow && onDelete(user)}
                  disabled={!canDelete || isLoadingRow}
                  className={[
                    "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                    canDelete && !isLoadingRow ? "text-primary hover:bg-promotion-light hover:text-promotion cursor-pointer" : "text-neutral-active opacity-40 cursor-not-allowed",
                  ].join(" ")}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
