import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },

  typedRoutes: false,
  productionBrowserSourceMaps: false,
};

export default nextConfig;
