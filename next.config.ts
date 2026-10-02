import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  allowedDevOrigins: process.env.DEV_ORIGIN ? [process.env.DEV_ORIGIN] : undefined
};

export default nextConfig;
