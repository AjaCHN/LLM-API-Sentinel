/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  output: 'standalone',
  distDir: process.env.NEXT_DIST_DIR || process.env.USERPROFILE + '\\.next'
};

export default nextConfig;