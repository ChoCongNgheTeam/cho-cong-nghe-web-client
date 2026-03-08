export default function Hero() {
  return (
    <div className="bg-stone-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-stone-900/80" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="relative max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 border border-amber-500/30 text-amber-400 text-xs tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
          <span>✦</span> Trung tâm hỗ trợ
        </div>

        <h1 className="font-serif text-4xl md:text-5xl font-black leading-tight mb-4">
          Hướng dẫn{" "}
          <span className="italic text-amber-400">Mua hàng</span>
          <br />& Thanh toán Online
        </h1>

        <p className="text-stone-400 text-sm max-w-md mx-auto leading-relaxed">
          Mua sắm dễ dàng, an toàn và tiện lợi. Chúng tôi hỗ trợ bạn từng bước từ khi chọn sản phẩm đến khi nhận hàng.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-10 pt-10 border-t border-stone-700">
          {[
            { val: "4 bước", label: "Đặt hàng đơn giản" },
            { val: "4 hình thức", label: "Thanh toán linh hoạt" },
            { val: "24/7", label: "Hỗ trợ khách hàng" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-serif text-2xl font-black text-amber-400">
                {s.val}
              </div>
              <div className="text-xs text-stone-500 mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}