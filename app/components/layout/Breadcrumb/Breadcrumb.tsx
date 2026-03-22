import Link from "next/link";
import Script from "next/script";

interface BreadcrumbItem {
   label: string;
   href?: string;
}

interface BreadcrumbProps {
   items: BreadcrumbItem[];
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://example.com";

export default function Breadcrumb({ items }: BreadcrumbProps) {
   const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
         "@type": "ListItem",
         position: index + 1,
         name: item.label,
         ...(item.href ? { item: `${BASE_URL}${item.href}` } : {}),
      })),
   };

   return (
      <>
         {/* JSON-LD cho Google */}
         <Script
            id="breadcrumb-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
         />

         {/* UI breadcrumb */}
         <nav aria-label="breadcrumb" className="text-blue-600 mb-3">
            <ol className="flex flex-wrap items-center gap-1 ">
               {items.map((item, index) => {
                  const isLast = index === items.length - 1;

                  return (
                     <li key={index} className="flex items-center gap-1">
                        {item.href && !isLast ? (
                           <Link
                              href={item.href}
                              className="hover:underline hover:text-blue-800 transition-colors font-medium"
                           >
                              {item.label}
                           </Link>
                        ) : (
                           <span
                              className="text-primary"
                              aria-current={isLast ? "page" : undefined}
                           >
                              {item.label}
                           </span>
                        )}

                        {!isLast && (
                           <span className="text-gray-400" aria-hidden="true">
                              /
                           </span>
                        )}
                     </li>
                  );
               })}
            </ol>
         </nav>
      </>
   );
}
