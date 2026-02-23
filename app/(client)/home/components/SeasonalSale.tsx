"use client";

import Image from "next/image";
import Link from "next/link";

// Mock data for promotional banners
const SEASONAL_BANNERS = [
   {
      id: 1,
      title: 'MacBook Pro 14" SIÊU MẠNH MẼ với M5',
      subtitle: "Đặc quyền Phòng Vũ Edu",
      discount: "Giảm thêm 300K",
      features: ["Trả góp 3 Không", "0% Lãi Suất", "0đ Trả Trước", "0 Phí"],
      cta: "Lên Đời Ngay",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop",
      bgColor: "from-slate-900 to-slate-800",
      productId: "macbook-pro-14-m5",
   },
   {
      id: 2,
      title: "iPhone 15 Pro max",
      subtitle: "PRO CAMERA. PRO DISPLAY. PRO PERFORMANCE.",
      image: "https://images.unsplash.com/photo-1592286927505-4135ce646e5d?w=800&h=600&fit=crop",
      bgColor: "from-primary to-blue-900",
      productId: "iphone-15-pro-max",
   },
   {
      id: 3,
      title: "iPhone 16 Mockup 10 scenes",
      subtitle: "4K Display • 300 FPS Gaming",
      features: ["4K", "300 DPI"],
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
      bgColor: "from-blue-900 to-indigo-900",
      productId: "iphone-16-mockup",
   },
   {
      id: 4,
      title: "iPhone 17 PRO MAX",
      subtitle: "Pro Camera System",
      image: "https://images.unsplash.com/photo-1585790050230-5dd28404f41a?w=800&h=600&fit=crop",
      bgColor: "from-orange-800 to-red-900",
      productId: "iphone-17-pro-max",
   },
];

const LARGE_BANNER = {
   id: 5,
   title: "MacBook Pro",
   subtitle: "Supercharged for Pros",
   features: ["Up to 128GB RAM", "8TB Storage", "96W USB-C"],
   image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&h=800&fit=crop",
   bgColor: "from-purple-900 to-pink-900",
   productId: "macbook-pro-m3-max",
};

export default function SeasonalSale() {
   return (
      <section className="py-6 md:py-8">
         <div className="container">
            {/* Section Header */}
            <div className="mb-6">
               <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                  Xu hướng mua sắm 2026
               </h2>
            </div>

            {/* Main Grid Layout - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
               {/* Left Column - 4 small boxes in 2x2 grid */}
               <div className="grid grid-cols-2 gap-4">
                  {SEASONAL_BANNERS.map((banner) => (
                     <Link
                        key={banner.id}
                        href={`/products/${banner.productId}`}
                        className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
                     >
                        <div
                           className={`relative aspect-square bg-linear-to-br ${banner.bgColor}`}
                        >
                           {/* Background Image */}
                           <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity">
                              <Image
                                 src={banner.image}
                                 alt={banner.title}
                                 fill
                                 sizes="(max-width: 768px) 100vw, 50vw"
                                 className="object-cover"
                              />
                           </div>

                           {/* Content */}
                           <div className="relative h-full p-4 md:p-5 flex flex-col justify-between">
                              <div>
                                 {banner.subtitle && (
                                    <p className="text-neutral-light/90 text-[10px] md:text-xs font-semibold mb-1">
                                       {banner.subtitle}
                                    </p>
                                 )}
                                 <h3 className="text-sm md:text-base lg:text-lg font-black text-neutral-light mb-2 leading-tight drop-shadow-lg">
                                    {banner.title}
                                 </h3>

                                 {/* Discount Badge */}
                                 {banner.discount && (
                                    <div className="inline-block bg-neutral-light text-primary text-[10px] font-bold px-2 py-1 rounded-md mb-2">
                                       {banner.discount}
                                    </div>
                                 )}

                                 {/* Features */}
                                 {banner.features && (
                                    <div className="space-y-1">
                                       {banner.features
                                          .slice(0, 3)
                                          .map((feature, i) => (
                                             <div
                                                key={i}
                                                className="flex items-center gap-1.5"
                                             >
                                                <div className="w-1 h-1 bg-neutral-light rounded-full shrink-0" />
                                                <span className="text-neutral-light text-[10px] md:text-xs font-semibold">
                                                   {feature}
                                                </span>
                                             </div>
                                          ))}
                                    </div>
                                 )}
                              </div>

                              {/* CTA */}
                              {banner.cta && (
                                 <div className="mt-3">
                                    <span className="inline-block bg-neutral-light text-primary font-bold text-[10px] md:text-xs px-3 py-1.5 rounded-full hover:bg-promotion hover:text-neutral-light transition-colors shadow-lg group-hover:scale-105 transform duration-300">
                                       {banner.cta}
                                    </span>
                                 </div>
                              )}
                           </div>

                           {/* Hover Effect */}
                           <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                     </Link>
                  ))}
               </div>

               {/* Right Column - 1 large box */}
               <Link
                  href={`/products/${LARGE_BANNER.productId}`}
                  className="group relative block overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
               >
                  <div
                     className={`relative aspect-square bg-linear-to-br ${LARGE_BANNER.bgColor}`}
                  >
                     {/* Background Image */}
                     <Image
                        src={LARGE_BANNER.image}
                        alt={LARGE_BANNER.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover opacity-30 group-hover:opacity-40 transition-opacity group-hover:scale-105 duration-700"
                     />

                     {/* Content */}
                     <div className="relative h-full flex items-center justify-center p-6 md:p-8 lg:p-12">
                        <div className="text-center max-w-lg">
                           <p className="text-neutral-light/90 text-lg md:text-xl lg:text-2xl font-semibold mb-3">
                              {LARGE_BANNER.subtitle}
                           </p>
                           <h3 className="text-4xl md:text-5xl lg:text-7xl font-black text-neutral-light mb-6 lg:mb-8 leading-tight drop-shadow-2xl">
                              {LARGE_BANNER.title}
                           </h3>

                           {/* Features Grid */}
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                              {LARGE_BANNER.features.map((feature, i) => (
                                 <div
                                    key={i}
                                    className="bg-neutral-light/10 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-neutral-light/20"
                                 >
                                    <p className="text-neutral-light text-sm md:text-base font-bold">
                                       {feature}
                                    </p>
                                 </div>
                              ))}
                           </div>

                           <span className="inline-block bg-neutral-light text-primary font-bold text-base md:text-lg px-8 py-4 rounded-full hover:bg-promotion hover:text-neutral-light transition-colors shadow-2xl group-hover:scale-105 transform duration-300">
                              Tìm hiểu thêm
                           </span>
                        </div>
                     </div>

                     {/* Hover Effect */}
                     <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
               </Link>
            </div>
         </div>
      </section>
   );
}
