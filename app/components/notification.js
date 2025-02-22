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

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button onClick={handleOpen} className="relative">
                <i className="fa-solid fa-bell text-xl"></i>
                {unreadCount > 0 && (
                    <span className="absolute top-[-5px] right-[-15px] bg-red-500 text-white text-xs rounded-full py-[2px] px-[5px] flex items-center justify-center min-w-[20px] min-h-[20px] text-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="fixed inset-0 flex w-full mx-auto justify-center items-center z-50">
                    <div className="container max-h-screen relative">
                        <div className="flex gap-3 items-center mb-5">
                            {/* Close Button */}
                            <div className="">
                                <button onClick={handleClose}>
                                    <i className="fa-solid fa-chevron-left text-lg cursor-pointer"></i>
                                </button>
                            </div>

                            <h1 className="title w-[80%] text-center">Activity</h1>
                        </div>
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div key={notification.id} className="border-b last:border-b-0 py-2 flex items-center gap-3">
                                    <Image src={notification.photoURL} alt={notification.body} width={32} height={32} className="w-[50px] h-[50px] rounded-full border border-borderColor" />
                                    <div className="flex flex-col">
                                        <p className="text-sm">{notification.body}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">You have no notifications</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
