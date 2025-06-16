import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src'); // ✅ Fixes @/components crash
    return config;
  },
};

export default nextConfig;
