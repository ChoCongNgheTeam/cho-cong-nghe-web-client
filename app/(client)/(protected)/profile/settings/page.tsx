import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cài đặt tài khoản",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Cài đặt</h1>

      <form className="max-w-md space-y-4">
        <input
          type="text"
          placeholder="Tên hiển thị"
          className="w-full rounded-md border px-4 py-3"
        />
        <button className="rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800">
          Lưu thay đổi
        </button>
      </form>
    </>
  );
}
