import { accessories } from "@/data/categories";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

export default function AccessoriesSection() {
  return (
    <section className="py-8 mb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-5">
          Phụ kiện công nghệ
        </h2>

        {/* SCROLL HORIZONTAL */}
        <div
          className="
            flex
            gap-5
            overflow-x-auto
            snap-x snap-mandatory
            pb-3

            sm:gap-6
            md:grid
            md:grid-cols-6
            md:gap-8
            md:overflow-visible
          "
        >
          {accessories.map((category: Category) => (
            <a
              key={category.id}
              href={`#${category.slug}`}
              className="
                snap-start
                shrink-0
                w-[88px]
                sm:w-[100px]

                md:w-auto
                text-center
                group
              "
            >
              <div
                className="
                  w-full
                  aspect-square
                  bg-gradient-to-br
                  from-gray-50
                  to-gray-100
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  mb-2

                  transition-all
                  group-hover:shadow-md
                  group-hover:scale-105
                "
              >
                <span className="text-3xl sm:text-4xl">
                  {category.icon}
                </span>
              </div>

              <p
                className="
                  text-xs
                  sm:text-sm
                  font-medium
                  leading-tight
                  group-hover:text-blue-600
                  transition-colors
                "
              >
                {category.name}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
