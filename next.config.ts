import type { NextConfig } from "next";

const FLASK = process.env.FLASK_URL || "http://localhost:5001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // All /api/* and Flask routes proxied — browser stays on :3001, cookies work
      { source: "/api/:path*", destination: `${FLASK}/api/:path*` },
      { source: "/login", destination: `${FLASK}/login` },
      { source: "/logout", destination: `${FLASK}/logout` },
      { source: "/ia/:path*", destination: `${FLASK}/ia/:path*` },
    ];
  },
};

export default nextConfig;
