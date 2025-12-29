import { brands } from "../../data/brands";

export default function BrandsSection() {
  return (
    <div className="py-8 mb-6 rounded-lg shadow-sm">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6">Thương hiệu nổi bật</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {brands.map((brand) => (
            <a key={brand.id} href={`#${brand.slug}`} className="text-center group cursor-pointer">
              <div className="w-full aspect-square bg-gradient-to-br rounded-lg mb-2 flex items-center justify-center group-hover:shadow-xl transition-all group-hover:scale-105">
                <span className="text-5xl">{brand.logo}</span>
              </div>
              <p className="text-xs font-medium group-hover:text-blue-600 transition-colors">{brand.name}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
