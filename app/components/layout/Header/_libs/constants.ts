import {
  MdPhoneAndroid,
  MdLaptop,
  MdTv,
  MdHeadphones,
  MdMemory,
  MdFavorite,
  MdKitchen,
  MdBlender,
  MdSportsEsports,
  MdCardGiftcard,
  MdAccessTime,
  MdLocalOffer,
  MdCampaign,
  MdInventory2,
  MdPersonOff,
  MdChat,
  MdStar,
  MdNotifications,
} from "react-icons/md";

export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "dien-thoai": MdPhoneAndroid,
  laptop: MdLaptop,
  "dien-may": MdTv,
  "phu-kien": MdHeadphones,
  "cong-nghe-thiet-bi-so": MdMemory,
  "cham-soc-nha-cua-suc-khoe": MdFavorite,
  "thiet-bi-gia-dinh-dien-gia-dung": MdKitchen,
  "thiet-bi-nha-bep": MdBlender,
  "ket-noi-tien-ich-giai-tri": MdSportsEsports,
};

export const NOTIFICATION_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  WELCOME_VOUCHER: { icon: MdCardGiftcard, color: "text-accent", bg: "bg-accent/10" },
  VOUCHER_EXPIRING: { icon: MdAccessTime, color: "text-star", bg: "bg-neutral-light-active" },
  VOUCHER_ASSIGNED: { icon: MdLocalOffer, color: "text-accent-dark", bg: "bg-accent/10" },
  CAMPAIGN_PROMOTION: { icon: MdCampaign, color: "text-promotion", bg: "bg-promotion/10" },
  ORDER_STATUS: { icon: MdInventory2, color: "text-accent", bg: "bg-accent/10" },
  USER_INACTIVE: { icon: MdPersonOff, color: "text-neutral-dark", bg: "bg-neutral-light-active" },
  COMMENT_NEW: { icon: MdChat, color: "text-accent", bg: "bg-accent/10" },
  REVIEW_NEW: { icon: MdStar, color: "text-star", bg: "bg-neutral-light-active" },
};

export const DEFAULT_NOTIFICATION_ICON = {
  icon: MdNotifications,
  color: "text-neutral-dark",
  bg: "bg-neutral-light-active",
};
