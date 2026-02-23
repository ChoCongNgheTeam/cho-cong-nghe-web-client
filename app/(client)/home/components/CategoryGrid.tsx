"use client";

import Image from "next/image";
import Link from "next/link";
import { CategoryDTO } from "@/lib/api-demo";
import { Slidezy } from "@/components/Slider";

interface CategoryGridProps {
   categories: CategoryDTO[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
   return (
      <section className="py-4 md:py-6 bg-linear-to-b">
         <div className="container">
            {/* Outer Container with Border */}
            <div className="bg-white rounded-3xl border-2 border-neutral-hover p-6 md:p-8">
               {/* Header */}
               <div className="mb-6">
                  <h2 className="text-xl md:text-3xl font-bold text-primary tracking-tight">
                     Danh mục nổi bật
                  </h2>
               </div>

               {/* Slidezy Carousel */}
               <Slidezy
                  items={{ mobile: 4, tablet: 6, desktop: 8 }}
                  gap={12}
                  speed={300}
                  loop={false}
                  nav={false}
                  controls={true}
                  slideBy={2}
                  draggable={true}
                  className=""
               >
                  {categories.map((category) => (
                     <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        className="group/item block"
                     >
                        <div className="flex flex-col items-center">
                           {/* Category Card */}
                           <div className="relative w-full bg-white rounded-2xl p-3 md:p-4 transition-all duration-300 group-hover/item:scale-105">
                              {/* Category Image */}
                              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-neutral-light">
                                 <Image
                                    src={category.image_path}
                                    alt={category.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-contain p-2 transition-transform duration-500 group-hover/item:scale-110"
                                 />
                              </div>
                           </div>

                           {/* Category Name */}
                           <p className="mt-3 text-center text-xs md:text-sm font-semibold text-primary transition-colors duration-300 line-clamp-2 px-1">
                              {category.name}
                           </p>
                        </div>
                     </Link>
                  ))}
               </Slidezy>
            </div>
         </div>
      </section>
   );
}
