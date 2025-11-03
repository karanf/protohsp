/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [
      "@repo/designsystem",
      "@repo/ui",
    ],
}

export default nextConfig;