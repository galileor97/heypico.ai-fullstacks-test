import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Transpile packages from the monorepo
  transpilePackages: ["@repo/ui"],

  // API rewrites to proxy to Elysia backend (avoid CORS in development)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/:path*",
      },
    ];
  },
};

export default nextConfig;
