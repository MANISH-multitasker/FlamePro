/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "r2.fivemanage.com",
      },
    ],
  },
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "@prisma/client"],
}

export default nextConfig
