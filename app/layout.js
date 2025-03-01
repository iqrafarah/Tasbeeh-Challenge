import "./globals.css";
import BottomNav from "./components/bottomNav";
import { Toaster } from "react-hot-toast";

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
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
                />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="screen-orientation" content="portrait" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/icon.png" />
                
                <title>Tasbeeh Challenge</title>
            </head>
            <body>
                <main className="container">
                    {children}
                    <Toaster position="top-center" />
                    <BottomNav />
                </main>
            </body>
        </html>
    );
}