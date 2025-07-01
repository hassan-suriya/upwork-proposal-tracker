/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false, // Changed to false to avoid double rendering in development
  swcMinify: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  // This is critical for proper cookie handling with auth system
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
