export interface MenuItem {
   id: string;
   label: string;
   href: string;
}

export const menuItems: MenuItem[] = [
   {
      id: "faq",
      label: "Câu hỏi thường gặp",
      href: "/policies/faq",
   },
   { id: "about-shop", label: "Giới thiệu về Shop", href: "/policies/about" },
   {
      id: "apple-authorized",
      label: "Tin tức khuyến mãi",
      href: "/policies/news",
   },
   {
      id: "enterprise-projects",
      label: "Dự án Doanh nghiệp",
      href: "/policies/enterprise-projects",
   },
   {
      id: "telecom-points",
      label: "Quy chế hoạt động",
      href: "/policies/regulations",
   },
   {
      id: "apple-authorized-centers",
      label: "Đại lý ủy quyền và TTBH ủy quyền của Apple",
      href: "/policies/apple-authorized-centers",
   },
   {
      id: "warranty-lookup",
      label: "Tra cứu bảo hành",
      href: "/policies/warranty-lookup",
   },
   {
      id: "delivery-policy",
      label: "Chính sách giao hàng & lắp đặt",
      href: "/policies/Delivery",
   },
   {
      id: "Delivery-Installation",
      label: "Chính sách giao hàng & lắp đặt Điện máy, Gia dụng",
      href: "/policies/DeliveryInstallation",
   },
   {
      id: "unbox-policy",
      label: "Chính sách khui hộp sản phẩm",
      href: "/policies/unboxing",
   },
   {
      id: "exchange-intro",
      label: "Giới thiệu máy đổi trả",
      href: "/policies/exchangeIntro",
   },
   {
      id: "Technical-Support",
      label: "Quy định hỗ trợ kỹ thuật và sao lưu dữ liệu",
      href: "/policies/Technical-support",
   },
   {
      id: "privacy-policy",
      label: "Chính sách bảo mật",
      href: "/policies/Privacy",
   },
   {
      id: "Warranty-policy",
      label: "Chính sách bảo hành",
      href: "/policies/warranty-policy",
   },
   {
      id: "data-privacy",
      label: "Chính sách bảo mật dữ liệu cá nhân khách hàng",
      href: "/policies/DataPrivacy",
   },
   {
      id: "online-purchase",
      label: "Hướng dẫn mua hàng và thanh toán online",
      href: "/policies/shoppingGuide",
   },
   {
      id: "return-policy",
      label: "Chính sách đổi trả",
      href: "/policies/Return",
   },
   {
      id: "installment-policy",
      label: "Chính sách trả góp",
      href: "/policies/Installment",
   },
   {
      id: "Loyalty-policy",
      label: "Chính sách Chương trình Khách hàng thân thiết tại ChoCongNghe",
      href: "/policies/Loyalty",
   },
  
   {
      id: "Mobile-Network-Policy",
      label: "Chính sách mạng di động ChoCongNghe",
      href: "/policies/MobileNetwork",
   }

];
