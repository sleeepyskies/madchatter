import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

// load environment variables from monorepo root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  output: "export", // needed to serve static pages from backend
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // create environment variable aliases such that they can be read from browser
  env: {
    NEXT_PUBLIC_SERVER_ADDRESS: process.env.MC_SERVER_ADDRESS,
    NEXT_PUBLIC_SERVER_PORT: process.env.MC_SERVER_PORT,
  }
};

export default nextConfig;
