import type { ReactNode } from "react";


type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <main className="p-4 md:p-6">{children}</main>;
}
