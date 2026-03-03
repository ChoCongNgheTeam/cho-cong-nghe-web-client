export interface MenuItem {
   id: string;
   label: string;
   href: string;
}

export const menuItems: MenuItem[] = [
   {
      id: "faq",
      label: "Câu hỏi thường gặp",
      href: "/policies/cau-hoi-thuong-gap",
   },
   { id: "about-shop", label: "Giới thiệu về Shop", href: "/policies/about" },
   {
      id: "apple-authorized",
      label: "Đại lý ủy quyền và TTBH ủy quyền của Apple",
      href: "/policies/dai-ly-uy-quyen-apple",
   },
   {
      id: "mobile-network-policy",
      label: "Chính sách mạng di động",
      href: "/policies/mang-di-dong",
   },
   {
      id: "mobile-plan-policy",
      label: "Chính sách gói cước di động",
      href: "/policies/goi-cuoc-di-dong",
   },
   {
      id: "telecom-points",
      label: "Quy chế hoạt động",
      href: "/policies/regulations",
   },
   {
      id: "delivery-policy",
      label: "Chính sách giao hàng & lắp đặt",
      href: "/policies/giao-hang-lap-dat",
   },
   {
      id: "electronics-delivery",
      label: "Chính sách giao hàng & lắp đặt Điện máy",
      href: "/policies/giao-hang-dien-may",
   },
   {
      id: "electronics-delivery-only",
      label: "Chính sách giao hàng & lắp đặt Điện máy chỉ bán",
      href: "/policies/giao-hang-dien-may-chi-ban",
   },
   {
      id: "loyalty-policy",
      label: "Chính sách khách hàng thân thiết tại Shop",
      href: "/policies/khach-hang-than-thiet",
   },
   {
      id: "unbox-policy",
      label: "Chính sách khui hộp sản phẩm",
      href: "/policies/khui-hop-san-pham",
   },
   {
      id: "exchange-intro",
      label: "Giới thiệu máy đổi trả",
      href: "/policies/may-doi-tra",
   },
   {
      id: "tech-support",
      label: "Quy định hỗ trợ kỹ thuật và sao lưu dữ liệu",
      href: "/policies/ho-tro-ky-thuat",
   },
   {
      id: "privacy-policy",
      label: "Chính sách bảo mật",
      href: "/policies/bao-mat",
   },
   {
      id: "warranty-policy",
      label: "Chính sách bảo hành",
      href: "/policies/bao-hanh",
   },
   {
      id: "data-privacy",
      label: "Chính sách bảo mật dữ liệu cá nhân khách hàng",
      href: "/policies/bao-mat-du-lieu-ca-nhan",
   },
   {
      id: "online-purchase",
      label: "Hướng dẫn mua hàng và thanh toán online",
      href: "/policies/mua-hang-thanh-toan-online",
   },
   {
      id: "return-policy",
      label: "Chính sách đổi trả",
      href: "/policies/doi-tra",
   },
];
