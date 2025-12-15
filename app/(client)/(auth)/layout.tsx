import AuthBanner from "@/components/layout/auth-banner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="auth-layout">
      <AuthBanner /> {/* Xin chào bạn, mời đăng nhập */}
      {children}
    </section>
  );
}
