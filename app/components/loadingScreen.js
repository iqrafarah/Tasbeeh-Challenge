import Image from "next/image";
import { useEffect } from "react";

export default function LoadingScreen() {
  useEffect(() => {
    // Request notification permission
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="container bg-white z-50 text-center flex flex-col items-center justify-center h-screen gap-3">
      <Image
        src="/icon.png"
        alt="icon"
        width={100}
        height={100}
        className="w-[60px] h-[60px] object-cover rounded-lg"
      />
      <h1 className="title mb-[80px]">Tasbeeh Challenge</h1>
    </div>
  );
}

// Function to send notifications
export function sendNotification(title, options) {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      ...options,
      icon: '/icon.png', // Add an icon if needed
      badge: '/badge.png', // Add a badge if needed
    });

    // Add a click event to the notification
    notification.onclick = (event) => {
      event.preventDefault(); // Prevent the browser from focusing the Notification's tab
      window.open(options.url, '_blank'); // Open the link in a new tab
    };
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        const notification = new Notification(title, {
          ...options,
          icon: '/icon.png', // Add an icon if needed
          badge: '/badge.png', // Add a badge if needed
        });

        // Add a click event to the notification
        notification.onclick = (event) => {
          event.preventDefault(); // Prevent the browser from focusing the Notification's tab
          window.open(options.url, '_blank'); // Open the link in a new tab
        };
      }
    });
  }
}