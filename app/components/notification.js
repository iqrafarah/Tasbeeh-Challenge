import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import app from "../lib/services/userService";
import Image from "next/image";

export default function NotificationIcon() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

 useEffect(() => {
  if (!user) return;

  const db = getFirestore(app);
  const notificationsRef = collection(db, "users", user.uid, "notifications");
  const q = query(notificationsRef, orderBy("timestamp", "desc"));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    console.log("New notifications detected:", querySnapshot.docs.length);

    const fetchedNotifications = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));

    console.log("Fetched notifications:", fetchedNotifications);

    setNotifications(fetchedNotifications);
    setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
  });

  return () => unsubscribe();
}, [user]);

  const handleOpen = async () => {
    if (!isOpen) {
      setIsOpen(true);
      setUnreadCount(0);

      // Mark notifications as read in Firestore
      const db = getFirestore(app);
      const batchUpdates = notifications.map(n => {
        if (!n.read) {
          return updateDoc(doc(db, "users", user.uid, "notifications", n.id), { read: true });
        }
        return null;
      }).filter(Boolean);

      await Promise.all(batchUpdates);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative">
        <i className="fa-solid fa-bell text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="border-b last:border-b-0 py-2">
                <Image src={notification.photoURL} alt={notification.title} width={32} height={32} className="rounded-full" />
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-gray-500">{notification.body}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No notifications</p>
          )}
        </div>
      )}
    </div>
  );
}