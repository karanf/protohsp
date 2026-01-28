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
    // Turbopack config (Next.js 16+ default)
    // Turbopack handles code splitting and optimizations automatically
    turbopack: {},
  }

export default nextConfig;