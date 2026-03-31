import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
      domains: [
         "store.storeimages.cdn-apple.com",
         "images.unsplash.com",
         "cdn2.fptshop.com.vn",
         "cdn2.cellphones.com.vn",
         "res.cloudinary.com",
         "lh3.googleusercontent.com",
         "graph.facebook.com",
         "platform-lookaside.fbsbx.com",
      ],
      remotePatterns: [
         {
            protocol: "https",
            hostname: "**.fbcdn.net",
         },
      ],
   },
   productionBrowserSourceMaps: false,
};

export default nextConfig;
