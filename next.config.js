/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Optimized for Hostinger Node.js
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true // Ensures images work without sharp dependencies on shared hosts
  }
};

module.exports = nextConfig;
