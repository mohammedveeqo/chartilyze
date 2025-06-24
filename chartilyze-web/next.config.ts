/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // This will ignore all ESLint errors during build
  },
  images: {
    domains: ['i.ibb.co'],
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
}

module.exports = nextConfig

