import { ShoppingBag, Truck, User } from "lucide-react";
import LinkWithIcon from "./LinkWithIcon";
import { HeaderTopProps } from "../types";

// HeaderTop dùng nền trong suốt (overlay rgba(0,0,0,0.25) được set ở header.tsx)
// Text/icon giảm opacity thêm để tạo cảm giác "phụ" so với main bar bên dưới
const HeaderTop: React.FC<HeaderTopProps> = ({ isAuthenticated }) => {
  return (
    <div className="hidden md:block">
      <div className="container py-1.5">
        <div className="flex items-center justify-between gap-2" style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px" }}>
          <span className="shrink-0">Chào mừng đến với Cửa hàng điện tử toàn cầu</span>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <LinkWithIcon href="/profile/orders" icon={<Truck strokeWidth={1} className="h-4 w-4" />} text="Theo dõi đơn hàng của bạn" mobileText="Đơn hàng" />
            <span className="hidden sm:inline" style={{ color: "rgba(255,255,255,0.2)" }}>
              |
            </span>
            <LinkWithIcon href="#" icon={<ShoppingBag strokeWidth={1} className="h-4 w-4" />} text="Cửa hàng" mobileText="Shop" />
            <span className="hidden sm:inline" style={{ color: "rgba(255,255,255,0.2)" }}>
              |
            </span>
            <LinkWithIcon href={isAuthenticated ? "/profile" : "/account"} icon={<User strokeWidth={1} className="h-4 w-4" />} text="Tài khoản của tôi" mobileText="Tài khoản" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderTop;
