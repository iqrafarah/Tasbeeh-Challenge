import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const config = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  trailingSlash: true,
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(config);
