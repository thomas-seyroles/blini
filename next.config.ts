import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["*.*.*.*", "*.local", "*.ngrok-free.app", "*.ngrok-free.dev", "*.ngrok.app", "*.ngrok.dev"],
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
};

export default nextConfig;
