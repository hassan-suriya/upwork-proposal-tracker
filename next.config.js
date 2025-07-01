/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false, // Changed to false to avoid double rendering in development
  swcMinify: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  // Server Actions are now available by default
  experimental: {
    // No experimental features needed at the moment
  },
};

module.exports = nextConfig;
