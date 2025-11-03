/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [
      "@repo/designsystem",
      "@repo/ui",
    ],
    // Remove rewrites and redirects since we're handling this in middleware
    env: {
      // InstantDB Configuration
      NEXT_PUBLIC_INSTANT_APP_ID: process.env.NEXT_PUBLIC_INSTANT_APP_ID,
      INSTANT_ADMIN_TOKEN: process.env.INSTANT_ADMIN_TOKEN,
    },
    experimental: {
      // Enable barrel optimization for major libraries
      optimizePackageImports: ['lucide-react', 'recharts', 'date-fns', '@radix-ui/react-dropdown-menu'],
    },
    // Bundle optimization for production
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      // Optimize bundles in production
      if (!dev && !isServer) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            // Separate vendor chunk for heavy libraries
            recharts: {
              name: 'recharts',
              test: /[\\/]node_modules[\\/](recharts|recharts-scale)[\\/]/,
              chunks: 'all',
              priority: 20,
            },
            // Separate chunk for table library
            table: {
              name: 'table',
              test: /[\\/]node_modules[\\/]@tanstack[\\/]react-table[\\/]/,
              chunks: 'all',
              priority: 15,
            },
            // Separate chunk for date library
            date: {
              name: 'date',
              test: /[\\/]node_modules[\\/]date-fns[\\/]/,
              chunks: 'all',
              priority: 10,
            },
            // Group all other vendor libraries
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              chunks: 'all',
              priority: 5,
            },
          },
        }
      }
      
      return config
    },
  }

export default nextConfig;