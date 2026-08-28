const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.supabase.co', port: '', pathname: '/**' },
    ],
  },
  transpilePackages: ['motion'],
  output: 'export',
  trailingSlash: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

export default nextConfig;