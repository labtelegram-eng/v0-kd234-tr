/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledJsx: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    loader: 'custom',
    loaderFile: './lib/image-loader.js'
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  }
}

export default nextConfig
