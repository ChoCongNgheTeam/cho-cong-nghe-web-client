import { SidebarShell } from "./sidebar";
import { adminNavGroups, allAdminHrefs } from "./sidebar/adminNavGroups";

export default function AdminSidebar() {
  return <SidebarShell navGroups={adminNavGroups} allHrefs={allAdminHrefs} homeHref="/admin/dashboard" storeHref="/" />;
}
