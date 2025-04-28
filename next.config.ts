import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    console.log('API URL:', apiUrl || "No API URL provided");

    if (!apiUrl) {
      console.warn("⚠️ No NEXT_PUBLIC_API_URL found — API routes will not be available.");
      return []; // no rewrites if API URL missing
    }

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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
