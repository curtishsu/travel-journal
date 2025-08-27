import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* your existing options ... */
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
