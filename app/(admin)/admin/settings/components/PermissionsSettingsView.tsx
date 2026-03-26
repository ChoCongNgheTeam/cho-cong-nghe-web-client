import { KeyRound, Users } from "lucide-react";

const roles = [
  {
    name: "Admin",
    desc: "Toàn quyền hệ thống",
    badge: "Toàn quyền",
  },
  {
    name: "Editor",
    desc: "Quản lý nội dung và bài viết",
    badge: "Biên tập",
  },
  {
    name: "Viewer",
    desc: "Chỉ xem dữ liệu",
    badge: "Giới hạn",
  },
];

export default function PermissionsSettingsView() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <KeyRound className="h-5 w-5" />
            <h2 className="text-base font-semibold text-gray-900">
              Vai trò & phân quyền
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Thiết lập quyền truy cập theo vai trò
          </p>
        </div>
        <div className="px-6 py-5 grid gap-3">
          {roles.map((role) => (
            <div
              key={role.name}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-semibold text-gray-900">{role.name}</p>
                <p className="text-gray-500">{role.desc}</p>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600">
                {role.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Users className="h-5 w-5" />
            <h2 className="text-base font-semibold text-gray-900">
              Nhóm người dùng
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Gán quyền theo nhóm để quản lý nhanh hơn
          </p>
        </div>
        <div className="px-6 py-5 grid gap-3 text-sm">
          {[
            "Quản trị hệ thống",
            "Quản lý nội dung",
            "Chăm sóc khách hàng",
          ].map((group) => (
            <label
              key={group}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <span className="text-gray-700">{group}</span>
              <input type="checkbox" className="h-4 w-4" defaultChecked />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
