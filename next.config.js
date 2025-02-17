/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'img.logo.dev',
      }
    ],
  },
  trailingSlash: false,
  eslint: {
    ignoreDuringBuilds: true, // Disables ESLint during build
  },
};

module.exports = nextConfig;
