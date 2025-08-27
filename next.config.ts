import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Don’t fail the Vercel build on ESLint issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don’t fail the Vercel build on TS type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
