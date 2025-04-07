import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log('API URL:', apiUrl);
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/dev/:path*`,
      },
      {
        source: '/api-direct/:path*',
        destination: `${apiUrl}/:path*`,
      }
    ];
  },
};

export default nextConfig;
