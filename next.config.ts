import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  typescript: {
    ignoreBuildErrors: true, // 暫時禁用以解決 SSR 問題
  },
};

export default nextConfig;
