/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nzitdxkujwsaernacugl.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/hotel/**",
      },
    ],
  },
  // output: "export",
};

export default nextConfig;
