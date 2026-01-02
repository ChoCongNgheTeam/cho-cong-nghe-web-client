import Header from "@/components/layout/Header/header";
import Footer from "@/components/layout/Footer/footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <Header /> */}
      <main className="min-h-screen">{children}</main>
      {/* <Footer /> */}
    </>
  );
}
