import { Bell, Mail, MessageSquare } from "lucide-react";

export default function NotificationSettingsView() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Bell className="h-5 w-5" />
            <h2 className="text-base font-semibold text-gray-900">
              Thông báo hệ thống
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý kênh nhận thông báo và báo cáo
          </p>
        </div>
        <div className="px-6 py-5 space-y-3 text-sm">
          {[
            { label: "Nhận thông báo qua Email", icon: Mail },
            { label: "Nhận thông báo qua Push", icon: Bell },
            { label: "Nhận báo cáo tuần", icon: MessageSquare },
          ].map((row) => {
            const Icon = row.icon;
            return (
              <label
                key={row.label}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <span className="flex items-center gap-2 text-gray-700">
                  <Icon className="h-4 w-4 text-indigo-500" />
                  {row.label}
                </span>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}
