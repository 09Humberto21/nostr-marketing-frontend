/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    // Same-origin proxy to the FastAPI backend. The browser talks to the Next
    // server at `/api/*`, which forwards to the backend server-side — this
    // sidesteps CORS entirely (no preflight), so the backend needs no CORS
    // config. Set the axios base URL to `/api` (see NEXT_PUBLIC_API_BASE_URL).
    const backendOrigin = (
      process.env.BACKEND_ORIGIN ?? "http://localhost:8000"
    ).replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
