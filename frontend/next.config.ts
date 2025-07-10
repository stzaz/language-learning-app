// frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos', // The new, reliable image service
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
