/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,       // Example config option
  swcMinify: true,             // Example option
  typescript: {
    // Dangerously allow production builds to succeed even with type errors
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;   // CommonJS style for Vercel
