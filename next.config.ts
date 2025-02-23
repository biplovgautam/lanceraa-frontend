import { type NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  // Improve static asset handling
  assetPrefix: process.env.NODE_ENV === 'production' ? '/_next' : '',
  // Improve CSS handling
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Static optimization
  experimental: {
    optimizeCss: true,
  }
}

export default nextConfig
