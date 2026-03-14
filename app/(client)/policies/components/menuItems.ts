export interface MenuItem {
   id: string;
   label: string;
   href: string;
}

export const menuItems: MenuItem[] = [
   {
      id: "about",
      label: "Giới thiệu về công ty",
      href: "/policies/about",
   },
   {
      id: "regulations",
      label: "Quy chế hoạt động",
      href: "/policies/regulations",
   },
   {
      id: "enterprise-projects",
      label: "Dự án Doanh nghiệp",
      href: "/policies/du-an-doanh-nghiep",
   },
   {
      id: "news",
      label: "Tin tức khuyến mãi",
      href: "/policies/news",
   },
   {
      id: "exchange-intro",
      label: "Giới thiệu máy đổi trả",
      href: "/policies/exchange-intro",
   },
   {
      id: "online-purchase",
      label: "Hướng dẫn mua hàng & thanh toán online",
      href: "/policies/online-purchase",
   },
   {
      id: "apple-authorized",
      label: "Đại lý ủy quyền và TTBH ủy quyền của Apple",
      href: "/policies/apple-authorized",
   },
   {
      id: "invoice-lookup",
      label: "Tra cứu hoá đơn điện tử",
      href: "/Invoicelookup",
   },
   {
      id: "warranty-lookup",
      label: "Tra cứu bảo hành",
      href: "/warranty-policy",
   },
   {
      id: "faq",
      label: "Câu hỏi thường gặp",
      href: "/policies/cau-hoi-thuong-gap",
   },
];
