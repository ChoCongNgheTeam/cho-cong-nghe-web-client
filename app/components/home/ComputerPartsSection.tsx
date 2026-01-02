import { computerParts } from "@/data/categories";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export default function ComputerPartsSection() {
  return (
    <div className="py-8 mb-6 rounded-lg shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Linh kiện máy tính</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
          {computerParts.map((category: Category) => (
            <a key={category.id} href={`#${category.slug}`} className="text-center group cursor-pointer">
              <div className="w-full aspect-square bg-linear-to-br from-gray-50 to-gray-100 rounded-lg mb-2 flex items-center justify-center group-hover:shadow-md transition-all group-hover:scale-105">
                <span className="text-4xl">{category.icon}</span>
              </div>
              <p className="text-xs font-medium group-hover:text-blue-600 transition-colors">{category.name}</p>
            </a>
          ))}
          {[...Array(6)].map((_, i) => (
            <div key={`extra-${i}`} className="text-center group cursor-pointer">
              <div className="w-full aspect-square bg-linear-to-br from-gray-50 to-gray-100 rounded-lg mb-2 flex items-center justify-center group-hover:shadow-md transition-all">
                <span className="text-4xl">🔧</span>
              </div>
              <p className="text-xs font-medium">Linh kiện khác</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
