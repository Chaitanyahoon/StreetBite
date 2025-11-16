/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set Turbopack root to this frontend package
  // to avoid Next inferring the wrong workspace root when
  // multiple lockfiles exist on the machine.
  turbopack: { root: '.' },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
