import { type NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Improve static asset handling
  assetPrefix: process.env.NODE_ENV === 'production' ? '/_next' : '',
  
  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
}

export default nextConfig
