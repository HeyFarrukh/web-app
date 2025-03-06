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
  // We don't need the rewrites anymore as Astro files will be in the public directory
};

module.exports = nextConfig;
