// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
    ignoreDuringBuilds: true, // This will ignore all ESLint errors during build
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        has: [
          {
            type: 'host',
            value: 'app.chartilyze.com',
          },
        ],
        permanent: false,
      },
    ]
  },
  async middleware() {
    return {
      matcher: [
        // Skip static files and api routes
        '/((?!_next/static|_next/image|favicon.ico).*)',
      ],
    }
  },
}

module.exports = nextConfig
