"use client";

import Image from "next/image";

interface PolicyHeroProps {
  title: string;
  subtitle: string;
  image: string;
  bgColor?: string;
}

export default function PolicyHero({ title, subtitle, image, bgColor = "stone-50" }: PolicyHeroProps) {
  return (
    <section className={`relative overflow-hidden py-20 px-6 ${bgColor}`}>
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-xl text-stone-600 mb-8 leading-relaxed max-w-lg">
              {subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-promotion text-white px-6 py-3 rounded-full font-medium">
                <span>✓</span> Chính hãng 100%
              </div>
              <div className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full font-medium">
                <span>✓</span> Hỗ trợ 24/7
              </div>
            </div>
          </div>
          <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
    </section>
  );
}
