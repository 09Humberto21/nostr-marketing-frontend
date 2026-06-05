/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The backend lives on a separate origin. We expose its base URL via a
  // public env var (consumed by the Axios instance). No rewrites needed for
  // the MVP, but you can proxy /api here if you prefer same-origin requests.
};

export default nextConfig;
