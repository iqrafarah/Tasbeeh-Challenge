import "./globals.css";
import BottomNav from "./components/bottomNav";

export const metadata = {
  title: "Tasbeeh Challenge",
  description: "A simple tasbeeh counter app",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <main className="container">
          {children}
          <BottomNav />
        </main>
      </body>
    </html>
  );
}
