module.exports = {
  buildCommand: 'pnpm build',
  outputDirectory: 'out',
  routes: [
    {
      path: '/',
      destination: '/index.html',
    },
    {
      path: '/api/check',
      type: 'rewrite',
      destination: 'https://us-central1-gen-lang-client-0697781254.cloudfunctions.net/getApiStatus',
    },
  ],
  headers: [
    {
      path: '/*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
    {
      path: '/*.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      path: '/*.css',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      path: '/*.html',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
      ],
    },
  ],
  redirects: [],
  envVars: [],
};
