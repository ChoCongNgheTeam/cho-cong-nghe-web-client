export default function Hero() {
  return (
    <div className="bg-primary-dark text-neutral-light relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-dark/20 via-transparent to-primary-dark/80" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="relative max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 border border-accent/30 text-accent text-xs tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
          <span>✦</span> Trung tâm hỗ trợ
        </div>

        <h1 className="font-serif text-4xl md:text-5xl font-black leading-tight mb-4">
          Hướng dẫn{" "}
          <span className="italic text-accent">Mua hàng</span>
          <br />& Thanh toán Online
        </h1>

        <p className="text-neutral-dark text-sm max-w-md mx-auto leading-relaxed">
          Mua sắm dễ dàng, an toàn và tiện lợi. Chúng tôi hỗ trợ bạn từng bước từ khi chọn sản phẩm đến khi nhận hàng.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-10 pt-10 border-t border-neutral-dark">
          {[
            { val: "4 bước", label: "Đặt hàng đơn giản" },
            { val: "4 hình thức", label: "Thanh toán linh hoạt" },
            { val: "24/7", label: "Hỗ trợ khách hàng" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-serif text-2xl font-black text-accent">
                {s.val}
              </div>
              <div className="text-xs text-neutral-dark mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
