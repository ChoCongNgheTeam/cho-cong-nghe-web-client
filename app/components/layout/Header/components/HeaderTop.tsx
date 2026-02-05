import { ShoppingBag, Truck, User } from "lucide-react";
import LinkWithIcon from "./LinkWithIcon";
import { HeaderTopProps } from "../types";

const HeaderTop: React.FC<HeaderTopProps> = ({ isAuthenticated }) => {
   return (
      <div className="hidden md:block bg-neutral/40 border-b border-neutral-dark/50">
         <div className="container py-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-darker gap-2">
               <span className="shrink-0">
                  Chào mừng đến với Cửa hàng điện tử toàn cầu
               </span>
               <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <LinkWithIcon
                     href="#"
                     icon={<Truck strokeWidth={1} className="h-4 w-4" />}
                     text="Theo dõi đơn hàng của bạn"
                     mobileText="Đơn hàng"
                  />
                  <span className="hidden sm:inline text-neutral-dark">|</span>
                  <LinkWithIcon
                     href="#"
                     icon={<ShoppingBag strokeWidth={1} className="h-4 w-4" />}
                     text="Cửa hàng"
                     mobileText="Shop"
                  />
                  <span className="hidden sm:inline text-neutral-dark">|</span>
                  <LinkWithIcon
                     href={isAuthenticated ? "/profile" : "/account"}
                     icon={<User strokeWidth={1} className="h-4 w-4" />}
                     text="Tài khoản của tôi"
                     mobileText="Tài khoản"
                  />
               </div>
            </div>
         </div>
      </div>
   );
};

export default HeaderTop;
