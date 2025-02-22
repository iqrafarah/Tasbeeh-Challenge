import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import app from "../lib/services/userService";
import Image from "next/image";
import Link from "next/link";

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
                <div className="fixed inset-0 flex w-full mx-auto justify-center items-center z-50">
                    <div className="container max-h-screen relative">
                        <div className="flex gap-3 items-center mb-5">
                            {/* Close Button */}
                            <div className="">
                                <Link href="/leaderboard">
                                    <i className="fa-solid fa-chevron-left text-lg cursor-pointer"></i>
                                </Link>
                            </div>

                            <h1 className="title w-[80%] text-center">Activity</h1>
                            </div>
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div key={notification.id} className="border-b last:border-b-0 py-2 flex items-center gap-3">
                                    <div className="w-[50px] h-[50px] flex items-center justify-center rounded-full bg-lightgray overflow-hidden">
                                        {/* <Image src={notification.photoURL} alt={notification.title} width={32} height={32} className="rounded-full" /> */}
                                    </div>
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