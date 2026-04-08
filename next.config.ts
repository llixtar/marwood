import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'aekamyikeykyzjmcrkzv.supabase.co',
      },
    ],
  },
};

export default nextConfig;