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
        <title>Tasbeeh Challenge</title>
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
