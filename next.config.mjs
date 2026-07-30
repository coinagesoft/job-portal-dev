/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "jobportal.coinage.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "7011",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "7011",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;