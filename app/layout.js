import "./globals.css";
import Head from "next/head";

export const metadata = {
  title: "Tasbeeh Challenge",
  description: "A simple tasbeeh counter app",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1"
          crossOrigin="anonymous"
        />
        <script
          src="https://kit.fontawesome.com/e20sdfsd9.js"
          crossOrigin="anonymous"
        ></script>
      </Head>
      <body>{children}</body>
    </html>
  );
}
