import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendPort = process.env.SERVER_PORT || "8000";
    const address = process.env.ADDRESS || "127.0.0.1";

    return [
      {
        source: "/api/:path*",
        destination: `http://${address}:${backendPort}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
