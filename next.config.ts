/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  // Remove swcMinify as it's no longer needed in Next.js 15+
}

module.exports = nextConfig
