import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API calls to the backend during local development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
