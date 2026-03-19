import { headers } from "next/headers";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";

function getBreadcrumbItems(pathname: string) {
  const pathParts = pathname.split('/').filter(Boolean);
  
  const items = [{ label: "Trang chủ", href: "/" }];
  
  let currentPath = '';
  
  for (const part of pathParts) {
    currentPath += `/${part}`;
    if (part === 'blog') {
      items.push({ label: "Tin tức", href: "/blog" });
    } else if (currentPath.includes('[slug]') || pathParts[pathParts.length - 1] === part) {
      // For blog detail, don't add href for last item, use title from props if available
      items.push({ label: "Bài viết" });
    }
  }
  
  return items;
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      
      <div className="container mt-0 mb-10 mx-auto px-4 pt-4 pb-8 sm:px-6 lg:px-0">
        <BreadcrumbServer />
        {children}

      </div>
    </>
  );
}

async function BreadcrumbServer() {
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") ?? "/blog";
  const items = getBreadcrumbItems(pathname);
  return <Breadcrumb items={items} />;
}
