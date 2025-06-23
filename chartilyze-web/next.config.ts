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
  // Remove the middleware section from here
}

module.exports = nextConfig
