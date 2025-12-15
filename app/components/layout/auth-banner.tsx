import Link from "next/link";

export default function AuthBanner() {
  return (
    <div className="mb-12 rounded-xl border bg-gray-50 px-6 py-10 text-center">
      <h1 className="mb-2 text-2xl font-semibold">Xin chào 👋</h1>
      <p className="mx-auto max-w-md text-gray-600">Đăng nhập hoặc tạo tài khoản để tiếp tục</p>

      <div className="auth-actions flex gap-4 justify-center">
        <Link href="/login">Đăng nhập</Link>
        <Link href="/register">Đăng ký</Link>
        <Link href="/forgot-password">Quên mật khẩu</Link>
      </div>
    </div>
  );
}
