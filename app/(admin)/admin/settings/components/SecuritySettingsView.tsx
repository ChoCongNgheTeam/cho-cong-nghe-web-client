import { ShieldCheck, KeyRound, Lock, Smartphone } from "lucide-react";

export default function SecuritySettingsView() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Lock className="h-5 w-5" />
            <h2 className="text-base font-semibold text-gray-900">
              Đổi mật khẩu
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Cập nhật mật khẩu định kỳ để tăng bảo mật
          </p>
        </div>
        <div className="px-6 py-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-gray-600">
            Mật khẩu hiện tại
            <input className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700" />
          </label>
          <label className="space-y-2 text-sm text-gray-600">
            Mật khẩu mới
            <input className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700" />
          </label>
          <label className="space-y-2 text-sm text-gray-600 sm:col-span-2">
            Xác nhận mật khẩu mới
            <input className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700" />
          </label>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="text-base font-semibold text-gray-900">
                Xác thực hai lớp
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Bảo vệ tài khoản với mã xác thực
            </p>
          </div>
          <div className="px-6 py-5 space-y-3">
            <label className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
              <span className="text-gray-700">Bật 2FA qua SMS</span>
              <input type="checkbox" className="h-4 w-4" defaultChecked />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
              <span className="text-gray-700">Bật 2FA qua Email</span>
              <input type="checkbox" className="h-4 w-4" />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <Smartphone className="h-5 w-5" />
              <h2 className="text-base font-semibold text-gray-900">
                Thiết bị đăng nhập
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý các thiết bị đã đăng nhập
            </p>
          </div>
          <div className="px-6 py-5 space-y-3 text-sm">
            {[
              { device: "MacBook Pro • Chrome", time: "Hôm nay, 09:12" },
              { device: "iPhone 15 • Safari", time: "Hôm qua, 21:45" },
              { device: "Windows PC • Edge", time: "26/03/2026, 08:15" },
            ].map((row) => (
              <div
                key={row.device}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <span className="text-gray-700">{row.device}</span>
                <span className="text-gray-400">{row.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
