import { computerParts } from "@/data/categories";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export default function ComputerPartsSection() {
  return (
    <section className="py-8 mb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          Linh kiện máy tính
        </h2>

        {/* SCROLL HORIZONTAL */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
          {computerParts.map((category: Category) => (
            <a
              key={category.id}
              href={`#${category.slug}`}
              className="flex-shrink-0 w-20 sm:w-24 md:w-28 text-center snap-start group"
            >
              <div className="w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center mb-2 group-hover:shadow-md transition-all group-hover:scale-105">
                <span className="text-3xl sm:text-4xl">
                  {category.icon}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-tight group-hover:text-blue-600 transition-colors">
                {category.name}
              </p>
            </a>
          ))}

          {/* ITEM GIẢ */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`extra-${i}`}
              className="flex-shrink-0 w-20 sm:w-24 md:w-28 text-center snap-start"
            >
              <div className="w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-3xl sm:text-4xl">🔧</span>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-tight">
                Linh kiện khác
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
