/** @type {import('next').NextConfig} */
const nextConfig = {
  // Custom server is used — no static export
  reactStrictMode: true,
  // Allow the Socket.io path through
  async rewrites() {
    return [];
  },
};

export default nextConfig;
