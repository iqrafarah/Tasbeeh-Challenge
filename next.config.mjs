import withPWA from "next-pwa";

const config = {
  output: "standalone",
  images: {
    unoptimized: true,
    domains: ["lh3.googleusercontent.com"],
  },
  swcMinify: true,
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(config);
