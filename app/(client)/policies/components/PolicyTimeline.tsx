import Image from "next/image";

interface TimelineItem {
  year: string;
  desc: string;
  icon?: string;
}

interface PolicyTimelineProps {
  title: string;
  items: TimelineItem[];
}

export default function PolicyTimeline({ title, items }: PolicyTimelineProps) {
  return (
    <section className="py-20 bg-linear-to-br from-stone-50 to-neutral-light">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {title}
          </h3>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Hành trình phát triển chính sách và cam kết của chúng tôi
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary to-accent" />
          {items.map((item, i) => (
            <div
              key={i}
              className={`relative mb-16 flex ${
                i % 2 === 0 ? "flex-row-reverse justify-end" : "justify-start"
              }`}
            >
              <div
                className={`w-5/12 p-6 rounded-2xl shadow-xl ${
                  i % 2 === 0
                    ? "bg-linear-to-r from-accent to-primary ml-auto"
                    : "bg-white border border-stone-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="font-bold text-lg text-white">
                      {item.year}
                    </span>
                  </div>
                  {item.icon && (
                    <Image
                      src={item.icon}
                      alt=""
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-lg"
                      unoptimized
                    />
                  )}
                </div>
                <p className="text-white font-medium leading-relaxed md:text-lg">
                  {item.desc}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 z-10 shadow-lg border-4 border-stone-50">
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
