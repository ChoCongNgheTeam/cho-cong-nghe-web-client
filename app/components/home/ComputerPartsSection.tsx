import { homeCategories } from "@/data/categories";

export default function YearEndDealSection() {
  return (
    <section className="py-8">
      <div className="container grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT – BANNER */}
        <div className="lg:col-span-1 bg-linear-to-br from-promotion to-promotion-dark rounded-2xl p-6 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold leading-tight mb-2">
              Bắt mood săn deal
            </h2>
            <p className="text-lg font-medium mb-4">
              Hàng hiệu giảm tắt
            </p>
            <button className="bg-white text-promotion font-semibold px-5 py-2 rounded-full hover:bg-neutral-light transition">
              Săn ngay →
            </button>
          </div>

          <div className="mt-6 text-sm opacity-80">
            Tiệc lễ cuối năm, vạn ưu đãi
          </div>
        </div>

        {/* RIGHT – CATEGORY CARDS */}
        <div className="lg:col-span-2 bg-neutral-light rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <a
              href="#"
              className="text-sm text-primary hover:underline"
            >
              Xem gợi ý khác ↻
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {homeCategories.map((group) => (
              <div
                key={group.title}
                className="bg-neutral rounded-xl p-4"
              >
                <h4 className="font-semibold mb-4">
                  {group.title}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col items-center text-center cursor-pointer group"
                    >
                      <div className="w-16 h-16 rounded-xl bg-neutral-light flex items-center justify-center text-3xl group-hover:scale-105 transition">
                        {item.icon}
                      </div>
                      <span className="mt-2 text-sm font-medium group-hover:text-primary transition">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
