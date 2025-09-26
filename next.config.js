/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  
  // Optimize for static generation
  images: {
    unoptimized: true
  },
  
  // Ensure proper asset handling
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  
  // Configure redirects if needed
  async redirects() {
    return []
  },
  
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig