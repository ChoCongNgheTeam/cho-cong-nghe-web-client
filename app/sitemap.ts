export default function sitemap() {
  return [
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/products`,
      lastModified: new Date(),
    },
  ];
}
