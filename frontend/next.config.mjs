const backendApiUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081/api').replace(/\/$/, '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set Turbopack root to this frontend package
  // to avoid Next inferring the wrong workspace root when
  // multiple lockfiles exist on the machine.
  turbopack: { root: '.' },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendApiUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig
