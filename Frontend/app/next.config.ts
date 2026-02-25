import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: true, // Isso diz aos browsers que o redirecionamento é definitivo
      },
    ];
  },
};
export default nextConfig;
