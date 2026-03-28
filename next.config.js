/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Set turbopack root to current directory
  turbopack: {
    root: '.'
  }
};

export default nextConfig;