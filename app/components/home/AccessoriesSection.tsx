import { accessories } from "../../data/categories";

export default function AccessoriesSection() {
  return (
    <div className=" py-8 mb-6 rounded-lg shadow-sm">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6">Phụ kiện</h2>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
          {accessories.map((category) => (
            <a key={category.id} href={`#${category.slug}`} className="text-center group cursor-pointer">
              <div className="w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-2 flex items-center justify-center group-hover:shadow-md transition-all group-hover:scale-105">
                <span className="text-4xl">{category.icon}</span>
              </div>
              <p className="text-xs font-medium group-hover:text-blue-600 transition-colors">{category.name}</p>
            </a>
          ))}
          {[...Array(6)].map((_, i) => (
            <div key={`extra-${i}`} className="text-center group cursor-pointer">
              <div className="w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-2 flex items-center justify-center group-hover:shadow-md transition-all">
                <span className="text-4xl">📦</span>
              </div>
              <p className="text-xs font-medium">Phụ kiện khác</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
