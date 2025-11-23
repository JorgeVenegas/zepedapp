import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  serverExternalPackages: ['@xenova/transformers', 'onnxruntime-node'],
};

export default nextConfig;
