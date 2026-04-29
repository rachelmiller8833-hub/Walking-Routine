import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict mode catches lifecycle bugs early
  reactStrictMode: true,

  // Allow the app to call the OSRM public routing API from server-side routes
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
