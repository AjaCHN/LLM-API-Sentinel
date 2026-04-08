// next.config.mjs v2.4.0
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  experimental: {
    turbo: false
  },
  i18n: {
    locales: ['en', 'zh-cn', 'zh-tw', 'es', 'ar', 'fr', 'pt-BR', 'de', 'ja', 'ko', 'ru', 'vi', 'tr', 'th', 'sv', 'nl', 'pl', 'it', 'id', 'hi', 'cs'],
    defaultLocale: 'en',
  }
};

export default nextConfig;
