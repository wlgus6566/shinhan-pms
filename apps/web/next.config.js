/** @type {import('next').NextConfig} */
const nextConfig = {
  // CSR mode with dynamic routes
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  // Development settings
  allowedDevOrigins: ['http://localhost:3000'],
};

export default nextConfig;
