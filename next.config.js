/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
  //  unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'img.logo.dev',
      },
      {
        protocol: 'https',
        hostname: 'logos.apprenticewatch.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.apprenticewatch.com',
      }

    ],
  },
  trailingSlash: false,
  eslint: {
    ignoreDuringBuilds: true, // Disables ESLint during build
  },
  // Ensure content files are included in the build
  output: 'standalone',
  outputFileTracing: true,
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
    outputFileTracingIncludes: {
      '*': ['content/**/*'],
    },
  },
};

module.exports = nextConfig;
