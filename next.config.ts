import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   /* config options here */
   images: {
      domains: [
         "store.storeimages.cdn-apple.com",
         "images.unsplash.com",
         "cdn2.fptshop.com.vn",
         "res.cloudinary.com",
         "lh3.googleusercontent.com",
      ],
   },
   productionBrowserSourceMaps: false,
};

export default nextConfig;
