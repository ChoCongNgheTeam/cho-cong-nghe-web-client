import Link from "next/link";
import { Home, ShoppingBag, Package } from "lucide-react";

export default function ThanksPage() {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-neutral-light">
      <div className="w-full max-w-xl flex flex-col items-center text-center gap-6">
        {/* Icon */}
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white shadow-md">
            <Package className="w-16 h-16 text-neutral-700" strokeWidth={1.5} />
          </div>
          {/* Yellow check badge */}
          <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 shadow">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold tracking-widest text-neutral-800 uppercase">Đặt hàng thành công!</h1>

        {/* Info Box */}
        <div className="w-full rounded-lg border-2 border-yellow-400 bg-yellow-50 px-6 py-5 text-sm text-neutral-700 leading-relaxed">
          Cảm ơn bạn đã mua hàng! Đơn hàng của bạn đã được ghi nhận và đang được xử lý. Chúc bạn có trải nghiệm mua sắm thật vui vẻ.
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 rounded-full border-2 border-neutral-700 py-3 px-6 font-semibold text-sm text-neutral-800 bg-white hover:bg-neutral-100 transition"
          >
            <Home className="w-4 h-4" />
            Quay lại trang chủ
          </Link>

          <Link
            href="/category/dien-thoai"
            className="flex-1 flex items-center justify-center gap-2 rounded-full border-2 border-neutral-700 py-3 px-6 font-semibold text-sm text-neutral-800 bg-white hover:bg-neutral-100 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Xem sản phẩm khác
          </Link>
        </div>

        {/* Social Media */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-neutral-500">Theo dõi chúng tôi trên:</p>
          <div className="flex items-center gap-4">
            {/* Facebook */}
            <a href="#" aria-label="Facebook">
              <svg className="w-9 h-9" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="#1877F2" />
                <path d="M22.5 21h3l.5-3.5H22.5V15.5c0-1 .5-2 2-2H26V10.5s-1.5-.25-3-.25c-3.1 0-5 1.9-5 5.25V17.5H15V21h3v9h4.5V21z" fill="white" />
              </svg>
            </a>
            {/* Zalo */}
            <a href="#" aria-label="Zalo">
              <svg className="w-9 h-9" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="white" stroke="#d1d5db" strokeWidth="1.5" />
                <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0068FF" fontFamily="sans-serif">
                  Zalo
                </text>
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" aria-label="Instagram">
              <svg className="w-9 h-9" viewBox="0 0 40 40" fill="none">
                <defs>
                  <radialGradient id="ig" cx="30%" cy="107%" r="130%">
                    <stop offset="0%" stopColor="#fdf497" />
                    <stop offset="25%" stopColor="#fd5949" />
                    <stop offset="50%" stopColor="#d6249f" />
                    <stop offset="100%" stopColor="#285AEB" />
                  </radialGradient>
                </defs>
                <rect width="40" height="40" rx="10" fill="url(#ig)" />
                <rect x="11" y="11" width="18" height="18" rx="5" stroke="white" strokeWidth="2" />
                <circle cx="20" cy="20" r="4.5" stroke="white" strokeWidth="2" />
                <circle cx="26" cy="14" r="1.2" fill="white" />
              </svg>
            </a>
            {/* TikTok */}
            <a href="#" aria-label="TikTok">
              <svg className="w-9 h-9" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="#010101" />
                <path
                  d="M25 11c.5 2.5 2.5 4 5 4v4c-1.8 0-3.5-.6-5-1.5V26c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8c.3 0 .7 0 1 .05V22c-.3-.05-.7-.08-1-.08-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4V11h4z"
                  fill="white"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
