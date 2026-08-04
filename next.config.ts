import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright connects over the loopback IP while the dev server defaults to localhost.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
