import {
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Settings,
  Home,
  Heart,
  Utensils,
  Wifi,
  Apple,
  Zap,
  Sparkles,
  Monitor,
  Gift,
  Clock,
  Tag,
  Megaphone,
  UserX,
  Package,
  MessageSquare,
  Star,
  Bell,
} from "lucide-react";

export const BRAND_ICONS: Record<string, React.ElementType> = {
  "apple-iphone": Apple,
  samsung: Zap,
  xiaomi: Sparkles,
  oppo: Smartphone,
  honor: Monitor,
};

export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "dien-thoai": Smartphone,
  laptop: Laptop,
  "dien-may": Tv,
  "phu-kien": Headphones,
  "cong-nghe-thiet-bi-so": Settings,
  "cham-soc-nha-cua-suc-khoe": Heart,
  "thiet-bi-gia-dinh-dien-gia-dung": Home,
  "thiet-bi-nha-bep": Utensils,
  "ket-noi-tien-ich-giai-tri": Wifi,
};

export const NOTIFICATION_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  WELCOME_VOUCHER: { icon: Gift, color: "text-accent", bg: "bg-accent/10" },
  VOUCHER_EXPIRING: {
    icon: Clock,
    color: "text-star",
    bg: "bg-neutral-light-active",
  },
  VOUCHER_ASSIGNED: {
    icon: Tag,
    color: "text-accent-dark",
    bg: "bg-accent/10",
  },
  CAMPAIGN_PROMOTION: {
    icon: Megaphone,
    color: "text-promotion",
    bg: "bg-promotion/10",
  },
  ORDER_STATUS: { icon: Package, color: "text-accent", bg: "bg-accent/10" },
  USER_INACTIVE: {
    icon: UserX,
    color: "text-neutral-dark",
    bg: "bg-neutral-light-active",
  },
  COMMENT_NEW: {
    icon: MessageSquare,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  REVIEW_NEW: {
    icon: Star,
    color: "text-star",
    bg: "bg-neutral-light-active",
  },
};

export const DEFAULT_NOTIFICATION_ICON = {
  icon: Bell,
  color: "text-neutral-dark",
  bg: "bg-neutral-light-active",
};
