import { SITE_URL } from "../config/site.config";

export default function sitemap() {
  return [
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
    },
  ];
}
