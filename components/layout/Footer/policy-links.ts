import type { MenuItem } from "@/app/(client)/policies/components/menuItems";

const menuItemsData: MenuItem[] = [
  { id: "faq", label: "Câu hỏi thường gặp", href: "/policies/faq" },
  { id: "about-shop", label: "Giới thiệu về Shop", href: "/policies/about-shop" },
  { id: "apple-authorized", label: "Tin tức khuyến mãi", href: "/policies/apple-authorized" },
  { id: "mobile-network-policy", label: "Chính sách mạng di động", href: "/policies/mobile-network-policy" },
  { id: "mobile-plan-policy", label: "Chính sách gói cước di động", href: "/policies/mobile-plan-policy" },
  { id: "telecom-points", label: "Quy chế hoạt động", href: "/policies/telecom-points" },
  { id: "delivery-policy", label: "Chính sách giao hàng & lắp đặt", href: "/policies/delivery-policy" },
  { id: "electronics-delivery", label: "Chính sách giao hàng & lắp đặt Điện máy", href: "/policies/electronics-delivery" },
  { id: "electronics-delivery-only", label: "Chính sách giao hàng & lắp đặt Điện máy chỉ bán", href: "/policies/electronics-delivery-only" },
  { id: "loyalty-policy", label: "Chính sách khách hàng thân thiết tại Shop", href: "/policies/loyalty-policy" },
  { id: "unbox-policy", label: "Chính sách khui hộp sản phẩm", href: "/policies/unbox-policy" },
  { id: "exchange-intro", label: "Giới thiệu máy đổi trả", href: "/policies/exchange-intro" },
  { id: "tech-support", label: "Quy định hỗ trợ kỹ thuật và sao lưu dữ liệu", href: "/policies/tech-support" },
  { id: "privacy-policy", label: "Chính sách bảo mật", href: "/policies/privacy-policy" },
  { id: "warranty-policy", label: "Chính sách bảo hành", href: "/policies/warranty-policy" },
  { id: "data-privacy", label: "Chính sách bảo mật dữ liệu cá nhân khách hàng", href: "/policies/data-privacy" },
  { id: "online-purchase", label: "Hướng dẫn mua hàng và thanh toán online", href: "/policies/online-purchase" },
  { id: "return-policy", label: "Chính sách đổi trả", href: "/policies/return-policy" },
];

export const policyLinks = menuItemsData.map(item => ({
  label: item.label,
  href: item.href
})); 
  label: item.label,
  href: item.href
}));

export const aboutLinks = [
  { label: "Giới thiệu về Shop", href: "/policies/about-shop" },
  { label: "Quy chế hoạt động", href: "/policies/telecom-points" },
  { label: "Tin tức khuyến mãi", href: "/policies/apple-authorized" },
  { label: "Giới thiệu máy đổi trả", href: "/policies/exchange-intro" },
];

export const paymentPartners = [
  "VISA", "MasterCard", "JCB", "AMEX", "COD", "Trả góp", "MoMo", 
  "ZaloPay", "VNPAY", "Home Credit", "Apple Pay", "Samsung Pay"
];

