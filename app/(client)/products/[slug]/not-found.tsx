import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[480px] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md w-full">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-2xl bg-neutral-light-active flex items-center justify-center">
            <svg className="w-12 h-12 text-neutral-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <p className="text-xs font-medium text-neutral-dark uppercase tracking-widest mb-3">Lỗi 404</p>
        <h1 className="text-2xl font-semibold text-primary mb-3">Sản phẩm không tồn tại</h1>
        <p className="text-neutral-darker mb-8 leading-relaxed">Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không còn hợp lệ.</p>

        <div className="flex flex-col items-center gap-3">
          <Link
            href="/"
            className="w-full max-w-[240px] flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-neutral-light rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Về trang chủ
          </Link>
          {/* TODO: đang tạm trỏ cứng vào 1 danh mục — cần xác nhận lại đích đến phù hợp hơn */}
          <Link
            href="/category/dien-thoai"
            className="w-full max-w-[240px] flex items-center justify-center gap-2 px-6 py-2.5 border border-neutral rounded-lg text-sm font-medium text-primary hover:bg-neutral-light-active transition-colors"
          >
            Xem sản phẩm khác
          </Link>
        </div>
      </div>
    </div>
  );
}
