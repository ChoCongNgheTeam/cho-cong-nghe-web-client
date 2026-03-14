import { LucideIcon } from "lucide-react";
import Image from "next/image";

interface PolicySectionProps {
  title: string;
  content: string;
  number?: number;
  image?: string;
  icon?: LucideIcon;
  IconComponent?: React.ComponentType<{ className?: string }>;
}

export default function PolicySection({
  title,
  content,
  number,
  image,
  IconComponent: Icon,
}: PolicySectionProps) {
  return (
    <section className="mb-12 last:mb-0">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 hover:shadow-md transition-all">
        <div className="flex items-start gap-6 mb-6">
          {number && (
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center font-bold text-2xl text-white shrink-0">
              {number}
            </div>
          )}
          {Icon && (
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary p-3 shrink-0">
              <Icon className="w-6 h-6" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
            {image && (
              <div className="w-24 h-24 rounded-xl overflow-hidden mb-4 bg-stone-100">
                <Image src={image} alt="" width={96} height={96} className="object-cover" />
              </div>
            )}
          </div>
        </div>
        <div className="prose prose-primary max-w-none">
          <p className="text-lg leading-relaxed text-stone-700">{content}</p>
        </div>
      </div>
    </section>
  );
}

