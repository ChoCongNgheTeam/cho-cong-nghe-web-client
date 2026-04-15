export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-neutral-light-active animate-pulse-skeleton">
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .sk { animation: skeleton-pulse 1.6s ease-in-out infinite; }
      `}</style>

      {/* ── Hero Slider ── */}
      <div className="sk w-full h-[420px] bg-[#1a2744]" />

      <div className="container px-4 mx-auto">
        {/* ── Featured Categories ── */}
        <section className="py-6">
          <div className="sk h-6 w-40 bg-neutral rounded mb-4" />
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="sk w-full aspect-square rounded-2xl bg-neutral" style={{ animationDelay: `${i * 0.05}s` }} />
                <div className="sk h-3 w-3/4 rounded bg-neutral" style={{ animationDelay: `${i * 0.05 + 0.1}s` }} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Flash Sale ── */}
        <section className="py-6">
          <div className="sk h-6 w-48 bg-neutral rounded mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="sk h-64 rounded-xl bg-neutral" style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        </section>

        {/* ── Banners Top ── */}
        <section className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="sk h-28 rounded-2xl bg-neutral" />
            <div className="sk h-28 rounded-2xl bg-neutral" style={{ animationDelay: "0.1s" }} />
          </div>
        </section>

        {/* ── Featured Products ── */}
        <section className="py-6">
          <div className="sk h-6 w-52 bg-neutral rounded mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="sk h-72 rounded-xl bg-neutral" style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        </section>

        {/* ── Best Sellers ── */}
        <section className="py-6">
          <div className="sk h-6 w-44 bg-neutral rounded mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="sk h-72 rounded-xl bg-neutral" style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
