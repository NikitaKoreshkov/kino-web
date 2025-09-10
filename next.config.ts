import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Remove framework disclosure header
  poweredByHeader: false,
  // Ensure source maps are not shipped to browsers in production
  productionBrowserSourceMaps: false, 
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
