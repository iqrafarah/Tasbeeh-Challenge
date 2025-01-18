import withPWA from "next-pwa";

const config = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  experimental: {
    appDir: true,
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(config);
