"use client";

import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/helpers";
import { Package, Bell, Heart, MapPin, Shield, Pencil, ChevronRight, Phone, AlertCircle, Navigation, Settings } from "lucide-react";
import Link from "next/link";

const quickMenus = [
  { icon: Package, label: "Lịch sử\nmua hàng", href: "/profile/orders" },
  { icon: Bell, label: "Tra cứu\nđơn hàng", href: "/profile/notifications" },
  { icon: Heart, label: "Sản phẩm\nyêu thích", href: "/profile/wishlist" },
  { icon: MapPin, label: "Địa chỉ\nnhận hàng", href: "/profile/addresses" },
  { icon: Settings, label: "Cài đặt", href: "/profile/settings" },
];

const contactItems = [
  { icon: Phone, label: "", value: "1800.2097", sub: "(7h30 – 22h00)" },
  { icon: AlertCircle, label: "Khiếu nại", value: "1800.2063", sub: "(8h00 – 21h30)" },
  { icon: Navigation, label: "Cửa hàng", href: "/stores" },
];

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4 text-primary">Đang tải...</div>;
  if (!user) return <div className="p-4 text-primary">Bạn chưa đăng nhập</div>;

  const genderLabel = user.gender === "MALE" ? "Nam" : user.gender === "FEMALE" ? "Nữ" : user.gender === "OTHER" ? "Khác" : "Chưa cập nhật";

  const dobLabel = user.dateOfBirth ? formatDate(user.dateOfBirth) : "Chưa có";

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* ── Mobile only ──────────────────────────────────── */}
      <div className="lg:hidden space-y-3">
        {/* 1. User card */}
        <div className=" rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-neutral-light p-0.5 shadow ring-2 ring-neutral shrink-0">
            <img src={user.avatarImage || "/images/avatar.png"} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-primary truncate">{user.fullName || "Người dùng"}</p>
            <p className="text-sm text-primary opacity-60">{user.phone}</p>
          </div>
          <Link href="/profile/editProfile" className="flex items-center gap-1 text-xs text-accent font-medium shrink-0 border border-accent rounded-lg px-2 py-1">
            <Pencil className="w-3 h-3" />
            Sửa
          </Link>
        </div>

        {/* 2. Tra cứu thông tin — grid 3 cột (CellphoneS style) */}
        <div className=" ">
          <p className="text-sm font-semibold text-primary mb-3">Tra cứu thông tin</p>
          <div className="grid grid-cols-3 gap-2">
            {quickMenus.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-2 p-3 bg-neutral-light rounded-xl hover:bg-neutral-light-hover active:scale-95 transition-all text-center rounded-xl p-4 shadow-sm"
                >
                  <Icon className="w-6 h-6 text-accent" />
                  <span className="text-xs text-primary font-medium leading-tight whitespace-pre-line">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. Thông tin liên hệ */}
        <div className="">
          <p className="text-sm font-semibold text-primary mb-3">Thông tin liên hệ</p>
          <div className="grid grid-cols-3 gap-2">
            {contactItems.map((item, i) => {
              const Icon = item.icon;
              const inner = (
                <div className="flex flex-col items-center justify-center gap-1 p-3 bg-neutral-light rounded-xl text-center h-full">
                  <Icon className="w-5 h-5 text-accent mb-0.5" />
                  <span className="text-xs text-primary opacity-60 leading-tight whitespace-pre-line">{item.label}</span>
                  {item.value && <span className="text-sm font-bold text-accent leading-tight">{item.value}</span>}
                  {item.sub && <span className="text-[10px] text-primary opacity-50">{item.sub}</span>}
                </div>
              );
              return item.href ? (
                <Link key={i} href={item.href} className="active:scale-95 transition-all rounded-xl p-4 shadow-sm">
                  {inner}
                </Link>
              ) : (
                <div className="rounded-xl p-4 shadow-sm" key={i}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Thông tin cá nhân */}
        <div className=" rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral">
            <p className="text-sm font-semibold text-primary">Thông tin cá nhân</p>
            <Link href="/profile/editProfile" className="text-xs text-accent font-medium flex items-center gap-1">
              Chỉnh sửa <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-neutral">
            <InfoRow label="Họ và tên" value={user.fullName || "Chưa có"} />
            <InfoRow label="Số điện thoại" value={user.phone || "Chưa có"} />
            <InfoRow label="Giới tính" value={genderLabel} />
            <InfoRow label="Ngày sinh" value={dobLabel} />
            <InfoRow label="Email" value={user.email || "Chưa có"} />
          </div>
        </div>
      </div>

      {/* ── Desktop: giữ nguyên layout cũ ────────────────── */}
      <div className="hidden lg:block">
        <h1 className="text-xl font-bold text-primary mb-4 mt-2">Thông tin cá nhân</h1>
        <div className="px-6 py-10 bg-neutral-light rounded-2xl">
          <div className="w-full max-w-md mx-auto">
            <div className="flex justify-center pt-8 pb-8">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-accent/30 to-primary/20 blur-sm" />
                <div className="relative w-28 h-28 rounded-full bg-neutral-light p-1 shadow-lg ring-2 ring-neutral">
                  <img src={user.avatarImage || "/images/avatar.png"} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                </div>
              </div>
            </div>
            <div className="space-y-0 divide-y divide-neutral">
              <InfoRow label="Họ và tên" value={user.fullName || "Chưa có"} />
              <InfoRow label="Số điện thoại" value={user.phone || "Chưa có"} />
              <InfoRow label="Giới tính" value={genderLabel} />
              <InfoRow label="Ngày sinh" value={dobLabel} />
              <InfoRow label="Email" value={user.email || "Chưa có"} />
            </div>
            <div className="pt-8">
              <Link href="/profile/editProfile" className="block">
                <button
                  className="w-full flex items-center justify-center gap-2
    bg-primary text-neutral-light hover:bg-primary-hover
    font-semibold px-6 py-3 text-base rounded-xl
    shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <Pencil size={18} />
                  Chỉnh sửa thông tin
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 flex justify-between items-center gap-4">
      <span className="text-xs sm:text-sm text-primary opacity-60 shrink-0">{label}</span>
      <span className="text-sm text-primary font-medium text-right break-all">{value}</span>
    </div>
  );
}
