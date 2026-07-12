import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Pre-existing lint debt must not block production deploys
  eslint: { ignoreDuringBuilds: true },
  images: {
    // Admin uploads live under /uploads; formats from sharp (webp)
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 256, 384],
  },
  async redirects() {
    return [
      // Prefer apex over www
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.xn--h1alalj0ac.xn--p1ai" }],
        destination: "https://xn--h1alalj0ac.xn--p1ai/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
