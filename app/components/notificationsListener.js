import { useEffect } from "react";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import app from "../lib/services/userService";
import { sendNotification } from "./loadingScreen";

const NotificationListener = ({ userId }) => {
  useEffect(() => {
    const db = getFirestore(app);
    const userRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(userRef, (doc) => {
      const data = doc.data();
      if (data && data.notifications) {
        data.notifications.forEach(notification => {
          sendNotification(notification.title, {
            body: notification.body,
            url: notification.url
          });
        });
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return null;
};

export default NotificationListener;