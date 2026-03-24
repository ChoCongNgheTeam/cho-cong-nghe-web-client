import { headers } from "next/headers";
import Sidebar from "./components/Sidebar";
import { menuItems } from "./components/menuItems";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";
import FontSizeToggle from "./components/FontSizeToggle";
import PolicyContent from "./components/PolicyContent";
import { FontSizeProvider } from "./components/FontSizeContext";

function getBreadcrumbItems(pathname: string) {
  const match = menuItems.find((item) => item.href === pathname);
  return [{ label: "Trang chủ", href: "/" }, { label: "Chính sách", href: "/policies" }, ...(match ? [{ label: match.label }] : [])];
}

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <FontSizeProvider>
      <div className="min-h-screen bg-neutral-light text-primary">
        <div className="container mt-6 mb-10 lg:mt-10">
          <div className="mb-6 lg:mb-10">
            <BreadcrumbServer />
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 mx-auto">
            <div className="lg:w-64 lg:min-w-70">
              <FontSizeToggle />
              <Sidebar />
            </div>
            <main className="flex-1 min-w-0 lg:pl-2">
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
  // console.log("pathname:", pathname); // kiểm tra trong terminal
  const items = getBreadcrumbItems(pathname);
  return <Breadcrumb items={items} />;
}
