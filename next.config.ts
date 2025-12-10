import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // In a future major version of Next.js, you will need to explicitly configure "allowedDevOrigins" in next.config to allow this.
  // Read more: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
  experimental: {
    allowedDevOrigins: [
        'https://6000-firebase-studio-*.cloudworkstations.dev',
        'https://*.firebase.studio'
    ]
  }
};

export default nextConfig;
