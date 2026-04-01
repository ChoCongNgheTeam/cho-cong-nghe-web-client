import Image from "next/image";
import Link from "next/link";
import { formatDate as formatLocaleDate } from "@/helpers";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";

type BlogApiCategory = {
   name?: string;
   slug?: string;
};

type BlogApiItem = {
   id?: string;
   title?: string;
   slug?: string;
   thumbnail?: string | null;
   imageUrl?: string | null;
   excerpt?: string | null;
   createdAt?: string;
   publishedAt?: string | null;
   category?: BlogApiCategory | string | null;
};

type NewsBlog = {
   id: string;
   title: string;
   slug: string;
   excerpt: string;
   thumbnail: string;
   createdAt: string;
   publishedAt: string;
   category: { name: string; slug: string } | null;
};

const CATEGORY_COLORS: Record<string, string> = {
   featured: "bg-accent-light text-accent",
   "tin-moi": "bg-accent-light text-accent",
   "danh-gia-tu-van": "bg-neutral-light-active text-primary",
};

function formatDate(value?: string): string {
   if (!value) return "";
   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return "";
   return formatLocaleDate(date.toISOString());
}

function mapBlog(item: BlogApiItem): NewsBlog {
   const createdAt = item.createdAt ?? new Date().toISOString();
   const publishedAt = item.publishedAt ?? createdAt;
   const rawCategory = item.category;

   const category =
      typeof rawCategory === "string"
         ? { name: rawCategory, slug: rawCategory }
         : rawCategory
           ? { name: rawCategory.name ?? "Tin tức", slug: rawCategory.slug ?? "" }
           : null;

   return {
      id: item.id ?? "",
      title: item.title ?? "Bài viết",
      slug: item.slug ?? "",
      excerpt: item.excerpt ?? "",
      thumbnail: item.thumbnail ?? item.imageUrl ?? "/images/avatar.png",
      createdAt,
      publishedAt,
      category,
   };
}

function getCategoryLabel(blog: NewsBlog): string {
   return blog.category?.name ?? "Tin tức";
}

function getCategoryColor(blog: NewsBlog): string {
   const slug = blog.category?.slug ?? "";
   return CATEGORY_COLORS[slug] ?? "bg-neutral-light-active text-primary";
}

async function fetchBlogs(): Promise<NewsBlog[]> {
   if (!BASE_URL) return [];
   const response = await fetch(`${BASE_URL}/api/v1/blogs?page=1&limit=10`, {
      cache: "no-store",
   });

   if (!response.ok) return [];

   const data = (await response.json()) as { data?: BlogApiItem[] };
   const items: BlogApiItem[] = Array.isArray(data?.data) ? data.data : [];
   return items.map(mapBlog).filter((item) => item.slug);
}

export default async function NewsPage() {
   let blogs: NewsBlog[] = [];

   try {
      blogs = await fetchBlogs();
   } catch {
      blogs = [];
   }

   if (!blogs.length) {
      return (
         <div className="min-h-screen bg-neutral-light">
            <div className="container py-10">
               <h1 className="text-xl font-bold text-primary mb-2">
                  Tin tức khuyến mãi
               </h1>
               <p className="text-primary-light">
                  Hiện chưa có bài viết nào. Vui lòng quay lại sau.
               </p>
            </div>
         </div>
      );
   }

   const [featuredNews, ...restNews] = blogs;
   const tabs = [
      "T?t c?",
      ...Array.from(
         new Set(blogs.map((item) => item.category?.name).filter(Boolean))
      ),
   ].slice(0, 4);

   return (
      <div className="min-h-screen bg-neutral-light">
         {/* Header */}
         <div className="border-b border-neutral bg-neutral-light">
            <div className="container py-6 sm:py-8">
               <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                     <p className="uppercase tracking-[0.15em] text-primary font-medium mb-1">
                        Cập nhật mới nhất
                     </p>
                     <h1 className="text-[28px] font-bold text-primary leading-tight">
                        Tin tức khuyến mãi
                     </h1>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex gap-1 bg-neutral-light-active rounded-lg p-1 overflow-x-auto whitespace-nowrap">
                     {tabs.map((tab, i) => (
                        <button
                           key={tab}
                           className={[
                              "px-4 py-1.5 rounded-md font-medium transition-colors cursor-pointer shrink-0",
                              i === 0
                                 ? "bg-neutral-light text-primary shadow-sm"
                                 : "text-primary hover:text-primary",
                           ].join(" ")}
                        >
                           {tab}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         <div className="container py-6 sm:py-8">
            <Link
               href={`/blog/${featuredNews.slug}`}
               className="group block mb-8"
            >
               <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-xl overflow-hidden border border-neutral bg-neutral-light hover:shadow-md transition-shadow duration-200">
                  {/* Image */}
                  <div className="lg:col-span-3 relative overflow-hidden bg-accent-light aspect-video">
                     <Image
                        src={featuredNews.thumbnail}
                        alt={featuredNews.title}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                     />
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-2 p-5 sm:p-6 lg:p-7 flex flex-col justify-between">
                     <div>
                        <div className="flex items-center gap-2 mb-3 text-sm">
                           <span
                              className={`px-2 py-0.5 rounded font-semibold ${getCategoryColor(featuredNews)}`}
                           >
                              {getCategoryLabel(featuredNews)}
                           </span>
                           <span className="text-primary">
                              {formatDate(featuredNews.publishedAt || featuredNews.createdAt)}
                           </span>
                        </div>
                        <h2 className="font-bold text-primary leading-snug mb-3 group-hover:text-accent transition-colors">
                           {featuredNews.title}
                        </h2>
                        <p className="text-primary leading-relaxed line-clamp-3">
                           {featuredNews.excerpt}
                        </p>
                     </div>
                     <div className="mt-4 sm:mt-5">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-accent group-hover:gap-2.5 transition-all">
                           Xem chi tiết
                           <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path
                                 d="M2 7h10M8 3l4 4-4 4"
                                 stroke="currentColor"
                                 strokeWidth="1.5"
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                              />
                           </svg>
                        </span>
                     </div>
                  </div>
               </div>
            </Link>

            {/* Grid list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
               {restNews.map((item) => (
                  <Link
                     key={item.id}
                     href={`/blog/${item.slug}`}
                     className="group flex flex-col rounded-xl overflow-hidden border border-neutral bg-neutral-light hover:shadow-md transition-shadow duration-200"
                  >
                     {/* Image */}
                     <div className="relative overflow-hidden aspect-video bg-accent-light">
                        <Image
                           src={item.thumbnail}
                           alt={item.title}
                           fill
                           className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                     </div>

                     {/* Content */}
                     <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2 text-sm">
                           <span
                              className={`px-2 py-0.5 rounded font-semibold ${getCategoryColor(item)}`}
                           >
                              {getCategoryLabel(item)}
                           </span>
                           <span className="text-primary">
                              {formatDate(item.publishedAt || item.createdAt)}
                           </span>
                        </div>
                        <h3 className="text-[14px] font-bold text-primary leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors flex-1">
                           {item.title}
                        </h3>
                        <p className="text-primary leading-relaxed line-clamp-2 mb-3">
                           {item.excerpt}
                        </p>
                        <span className="inline-flex items-center gap-1 font-semibold text-accent group-hover:gap-2 transition-all mt-auto">
                           Xem chi ti?t
                           <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                              <path
                                 d="M2 7h10M8 3l4 4-4 4"
                                 stroke="currentColor"
                                 strokeWidth="1.5"
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                              />
                           </svg>
                        </span>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      </div>
   );
}
