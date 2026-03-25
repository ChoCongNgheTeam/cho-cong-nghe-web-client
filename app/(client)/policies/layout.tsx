import { headers } from "next/headers";
import Sidebar from "./components/Sidebar";
import { menuItems } from "./components/menuItems";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";
import FontSizeToggle from "./components/FontSizeToggle";
import PolicyContent from "./components/PolicyContent";
import { FontSizeProvider } from "./components/FontSizeContext";

function getBreadcrumbItems(pathname: string) {
   const match = menuItems.find((item) => item.href === pathname);
   return [
      { label: "Trang chủ", href: "/" },
      { label: "Chính sách", href: "/policies" },
      ...(match ? [{ label: match.label }] : []),
   ];
}

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
   return (
      <FontSizeProvider>
         <div className="min-h-screen bg-neutral-light">
            <div className="container mt-6 mb-10">

               {/* Breadcrumb — ẩn trên mobile, hiện từ md */}
               <div className="hidden md:block mb-6">
                  <BreadcrumbServer />
               </div>

               {/* Body */}
               <div className="flex flex-col lg:flex-row lg:gap-0 mx-auto">

                  {/* ── Sidebar + FontSizeToggle: desktop only ── */}
                  <div className="hidden lg:flex flex-col">
                     <FontSizeToggle />
                     <Sidebar />
                  </div>

                  {/* ── Mobile: Sidebar dropdown (sticky top) ── */}
                  <div className="lg:hidden">
                     <Sidebar />
                  </div>

                  {/* ── Content ── */}
                  <main className="flex-1 min-w-0 lg:pl-8 pt-4 lg:pt-0">
                     {/* FontSizeToggle trên mobile nằm trong content */}
                     <div className="lg:hidden mb-4">
                        <FontSizeToggle />
                     </div>
                     <PolicyContent>{children}</PolicyContent>
                  </main>

               </div>
            </div>
         </div>
      </FontSizeProvider>
   );
}

async function BreadcrumbServer() {
   const headersList = await headers();
   const pathname = headersList.get("x-invoke-path") ?? "";
   const items = getBreadcrumbItems(pathname);
   return <Breadcrumb items={items} />;
}