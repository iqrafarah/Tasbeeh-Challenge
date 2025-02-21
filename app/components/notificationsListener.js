// NotificationListener.js
import { useEffect } from "react";
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import app from "../lib/services/userService";
import { sendNotification } from "./loadingScreen";

const NotificationListener = ({ userId }) => {
  useEffect(() => {
    const db = getFirestore(app);
    const notificationsRef = collection(db, "users", userId, "notifications");
    const q = query(notificationsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const notification = change.doc.data();
          sendNotification(notification.title, {
            body: notification.body,
            url: notification.url
          });
        }
      });
    });

    return () => unsubscribe();
  }, [userId]);

  return null;
};

export default NotificationListener;