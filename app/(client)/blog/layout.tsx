export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mb-10 mx-auto pt-4 pb-8 sm:px-6 lg:px-0">
      {children}
    </div>
  );
}
