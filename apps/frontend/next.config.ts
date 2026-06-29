import type { NextConfig } from "next";
import CopyPlugin from "copy-webpack-plugin";
import dotenv from "dotenv";
import path from "path";

// load environment variables from monorepo root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // handles copying certain build files required for serving static files for react-vad
  webpack: (config, { }) => {
    config.resolve.extensions.push(".ts", ".tsx")
    config.resolve.fallback = { fs: false }

    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: "node_modules/onnxruntime-web/dist/*.wasm",
            to: "../public/[name][ext]",
          },
          {
            from: "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
            to: "../public/[name][ext]",
          },
          {
            from: "node_modules/@ricky0123/vad-web/dist/*.onnx",
            to: "../public/[name][ext]",
          },
          {
            from: "node_modules/onnxruntime-web/dist/*.mjs",
            to: "../public/[name][ext]",
          },
        ],
      })
    )

    return config
  },

  // create environment variable aliases such that they can be read from browser
  env: {
    NEXT_PUBLIC_SERVER_ADDRESS: process.env.MC_SERVER_ADDRESS,
    NEXT_PUBLIC_SERVER_PORT: process.env.MC_SERVER_PORT,
  }
};

export default nextConfig;
