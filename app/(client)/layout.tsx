import Header from "@/components/layout/Header/header";
import Footer from "@/components/layout/Footer/footer";
// import ToggleSwitch from "@/components/ui/ThemeToggle";
import ChatButton from "@/components/ui/ChatButton";
import ScrollBarTop from "@/components/ui/ScrollBarTop";

export default function ClientLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <div className="flex min-h-screen flex-col">
         <ScrollBarTop />
         <ChatButton />
         <Header />
         {/* <ToggleSwitch /> */}
         <main className="flex-1">{children}</main>
         <Footer />
      </div>
   );
}
