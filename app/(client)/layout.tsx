import Header from "@/components/layout/Header/header";
import Footer from "@/components/layout/Footer";
import ToggleSwitch from "@/components/ui/ThemeToggle";
import ChatButton from "@/components/ui/ChatButton";
import ScrollBarTop from "@/components/ui/ScrollBarTop";
import BackToTopButton from "@/components/ui/BackToTopButton";
import ZaloButton from "@/components/ui/ZaloButton";
import FloatingDock from "@/components/ui/FloatingDock";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollBarTop />
      <Header />
      <ToggleSwitch />
      <main className="flex-1">{children}</main>
      <Footer />

      <FloatingDock>
        <ZaloButton />
        <ChatButton />
        <BackToTopButton />
      </FloatingDock>
    </div>
  );
}
