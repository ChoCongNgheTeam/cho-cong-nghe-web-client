import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm font-medium text-stone-600">
      {items.map((item, index) => (
        <div key={item.name} className="flex items-center space-x-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-stone-400" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-primary transition-colors">
              {item.name}
            </Link>
          ) : (
            <span className="font-semibold text-primary">{item.name}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

