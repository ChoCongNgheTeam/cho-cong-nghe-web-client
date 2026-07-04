import Link from "next/link";
import { LogOut, Store } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";

interface UserFooterUser {
  avatarImage?: string | null;
  fullName: string;
  email: string;
}

interface UserFooterProps {
  user: UserFooterUser;
  storeHref?: string;
  onLogout: () => void;
  dark?: boolean;
}

export function UserFooter({ user, storeHref, onLogout, dark = false }: UserFooterProps) {
  return (
    <div className={`border-t px-3 py-3 space-y-0.5 shrink-0 ${dark ? "border-white/10" : "border-neutral"}`}>
      <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
        <UserAvatar avatarImage={user.avatarImage ?? undefined} fullName={user.fullName} size={32} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <div className={`text-[13px] font-semibold truncate ${dark ? "text-white" : "text-primary"}`}>{user.fullName}</div>
          <div className={`text-[11px] truncate ${dark ? "text-white/50" : "text-neutral-dark"}`}>{user.email}</div>
        </div>
        <button onClick={onLogout} title="Đăng xuất" className={`transition-colors shrink-0 cursor-pointer ${dark ? "text-white/60 hover:text-white" : "text-primary hover:text-promotion"}`}>
          <LogOut size={15} />
        </button>
      </div>
      {storeHref && (
        <Link
          href={storeHref}
          className={`flex items-center gap-2.5 px-2 py-2 text-[13px] rounded-lg transition-all duration-150 ${
            dark ? "text-white/70 hover:text-white hover:bg-white/10" : "text-primary hover:bg-neutral-light-active"
          }`}
        >
          <Store size={15} className={dark ? "text-white/50" : "text-primary"} />
          <span>Cửa hàng của tôi</span>
        </Link>
      )}
    </div>
  );
}
