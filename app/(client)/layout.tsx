import Header from "@/components/layout/Header/header";
import Footer from "@/components/layout/Footer/footer";
import ToggleSwitch from "@/components/ui/ThemeToggle";
import DynamicProductForm from "./test";

export default function ClientLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <>
         <Header />
         <ToggleSwitch />
         <main>{children}</main>
         <Footer />
         {/* <DynamicProductForm /> */}
      </>
   );
}
