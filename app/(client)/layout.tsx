import Header from "@/components/layout/Header/header";
import Footer from "@/components/layout/Footer/footer";
import ToggleSwitch from "@/components/ui/ThemeToggle";
import { CartProvider } from "@/contexts/CartContext";

export default function ClientLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <CartProvider>
         <Header />
         <ToggleSwitch />
         <main>{children}</main>
         <Footer />
      </CartProvider>
   );
}
