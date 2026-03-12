import Link from "next/link";

/* ============================================================================
 * LOADING STATE
 * ========================================================================== */
export function LoadingState() {
  return (
    <div className="flex flex-col gap-4 p-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-neutral overflow-hidden animate-pulse"
        >
          <div className="h-10 bg-neutral-light-active" />
          <div className="flex gap-4 px-6 py-4">
            <div className="w-16 h-16 rounded bg-neutral shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 bg-neutral rounded w-2/3" />
              <div className="h-3 bg-neutral-light-active rounded w-1/3" />
            </div>
          </div>
          <div className="h-10 bg-neutral-light-active" />
        </div>
      ))}
    </div>
  );
}

/* ============================================================================
 * ERROR STATE
 * ========================================================================== */
export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-3">
      <span className="text-4xl">⚠️</span>
      <p className="text-primary-dark text-sm text-center">{message}</p>
    </div>
  );
}

/* ============================================================================
 * EMPTY STATE
 * ========================================================================== */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <img
        src="https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/estore-v2/img/empty_state.png"
        alt="Không có đơn hàng"
        className="object-contain w-60 h-60 mx-auto"
      />
      <h3 className="text-lg font-semibold text-primary mb-2">
        Bạn chưa có đơn hàng nào
      </h3>
      <p className="text-primary-dark mb-8 text-center text-sm">
        Cùng khám phá hàng ngàn sản phẩm tại ChoCongNghe Shop nhé!
      </p>
      <Link
        href="/products"
        className="bg-promotion hover:bg-promotion-hover text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-md hover:shadow-lg"
      >
        Khám phá ngay
      </Link>
    </div>
  );
}