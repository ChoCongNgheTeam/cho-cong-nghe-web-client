import type { Metadata } from "next";
import { Monitor, History, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Cài đặt quyền riêng tư",
  robots: { index: false, follow: false },
};

// TODO: thay bằng dữ liệu thật từ GET /users/me/sessions khi BE có endpoint
const recentDevices = [
  { device: "iPhone 15 Pro - iOS 17", time: "Hôm nay 09:12", ip: "113.190.12.8" },
  { device: "MacBook Pro - Chrome", time: "Hôm qua 21:40", ip: "113.190.12.8" },
  { device: "Windows PC - Edge", time: "02/04/2026 18:05", ip: "14.161.55.22" },
];

function ToggleSwitch({ id, defaultChecked }: { id: string; defaultChecked?: boolean }) {
  return (
    <div className="relative inline-flex items-center">
      <input id={id} type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
      <label
        htmlFor={id}
        className="relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-neutral/70 shadow-inner ring-1 ring-neutral/40 transition-colors peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 after:content-[''] after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5"
      />
    </div>
  );
}

function Row({ icon: Icon, title, desc, id, defaultChecked }: { icon: React.ElementType; title: string; desc: string; id: string; defaultChecked?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral bg-white/70 p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent-light shrink-0">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="text-sm sm:text-base font-medium text-primary">{title}</p>
          <p className="text-xs sm:text-sm text-neutral-dark">{desc}</p>
        </div>
      </div>
      <ToggleSwitch id={id} defaultChecked={defaultChecked} />
    </div>
  );
}

export default function PrivacySettingsPage() {
  return (
    <div className="w-full pb-24">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary">Quyền riêng tư</h1>
        <p className="text-sm text-neutral-dark mt-2">Kiểm soát dữ liệu cá nhân và cách hệ thống sử dụng.</p>
      </div>

      {/* TODO: kết nối PATCH /users/me/privacy khi BE có endpoint */}
      <section className="bg-neutral-light border border-neutral rounded-2xl p-4 sm:p-6 space-y-4">
        <Row icon={History} title="Lưu lịch sử xem sản phẩm" desc="Giúp bạn xem lại và gợi ý nhanh hơn." id="view-history" defaultChecked />
        <Row icon={Sparkles} title="Cá nhân hóa gợi ý" desc="Đề xuất sản phẩm phù hợp theo thói quen mua sắm." id="personalization" defaultChecked />
      </section>

      {/* TODO: kết nối GET /auth/sessions + DELETE /auth/sessions/:id khi BE có endpoint */}
      <section className="bg-neutral-light border border-neutral rounded-2xl p-4 sm:p-6 space-y-3 mt-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Monitor className="h-4 w-4 text-accent" />
          Thiết bị đăng nhập gần đây
        </div>
        <div className="overflow-x-auto rounded-xl border border-neutral bg-white/70">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="text-neutral-dark">
              <tr>
                <th className="py-2 px-3 font-semibold">Thiết bị</th>
                <th className="py-2 px-3 font-semibold">Thời gian</th>
                <th className="py-2 px-3 font-semibold">IP</th>
                <th className="py-2 px-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-primary">
              {recentDevices.map((session) => (
                <tr key={session.device} className="border-t border-neutral">
                  <td className="py-2 px-3 whitespace-nowrap">{session.device}</td>
                  <td className="py-2 px-3 whitespace-nowrap">{session.time}</td>
                  <td className="py-2 px-3 whitespace-nowrap">{session.ip}</td>
                  <td className="py-2 px-3">
                    <button className="rounded-full border border-neutral px-3 py-1 text-xs text-primary hover:bg-neutral-light">Đăng xuất</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-neutral-dark">Kiểm tra thiết bị lạ và đăng xuất khi cần thiết.</p>
      </section>

      <div className="sticky bottom-0 mt-8">
        <div className="bg-neutral-light/95 backdrop-blur border border-neutral rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-neutral-dark">Lưu thay đổi để áp dụng cài đặt quyền riêng tư.</p>
          <button className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition">Lưu cài đặt</button>
        </div>
      </div>
    </div>
  );
}
