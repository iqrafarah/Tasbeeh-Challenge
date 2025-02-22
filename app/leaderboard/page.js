'use client';

import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, docs, querySnapshot, orderBy, limit, getDocs, writeBatch, where, doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import app, { userService } from "../lib/services/userService";
import Image from "next/image";
import FriendModal from "../components/friendModal";
import ProfileModal from "../components/profileModal";
import Notification from "../components/notification";
import Loading from "../components/loadingScreen";
import ProtectedRoute from "../components/protectedRoute";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('community');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [friendLink, setFriendLink] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!user) return;

      const db = getFirestore(app);
      const usersRef = collection(db, "users");
      let q;

      if (tab === 'friends') {
        const friendsRef = collection(db, "users", user.uid, "friends");
        const friendsSnapshot = await getDocs(friendsRef);
        const friends = friendsSnapshot.docs.map(doc => doc.data().friendId);
        friends.push(user.uid);

        if (friends.length > 0) {
          q = query(usersRef, where("uid", "in", friends), orderBy("totalPoints", "desc"), limit(20));
        } else {
          setUsers([]);
          setLoading(false);
          return;
        }
      } else {
        q = query(usersRef, orderBy("totalPoints", "desc"), limit(20));
      }

      try {
        const querySnapshot = await getDocs(q);
        const leaderboardData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(leaderboardData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [tab, user]);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const db = getFirestore(app);
      const notificationsRef = collection(db, "users", user.uid, "notifications");
      const q = query(notificationsRef, orderBy("timestamp", "desc"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedNotifications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
      });

      return () => unsubscribe();
    };

    fetchNotifications();
  }, [user]);

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    setUnreadCount(0);

    const db = getFirestore(app);
    const batch = writeBatch(db);

    notifications.forEach((n) => {
      if (!n.read) {
        const notificationRef = doc(db, "users", user.uid, "notifications", n.id);
        batch.update(notificationRef, { read: true });
      }
    });

    await batch.commit();
  };

  const handleAddFriend = async () => {
    if (!friendLink) return;

    const friendUid = friendLink.split('/').pop();
    if (user.uid === friendUid) {
      setModalMessage("You cannot add yourself as a friend.");
      setModalType("error");
      setModalOpen(true);
      return;
    }

    try {
      await userService.addFriend(user.uid, friendUid);

      // Get the current user's information
      const currentUser = auth.currentUser;
      const senderName = currentUser.displayName || "Someone";
      const senderPhotoURL = currentUser.photoURL || "/default-avatar.png";

      // Send notification to the friend
      await userService.sendNotification(friendUid, senderName, senderPhotoURL);

      setModalMessage("Friend added successfully.");
      setModalType("success");
      setModalOpen(true);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding friend:", error);
      setModalMessage("Failed to add friend. Please try again.");
      setModalType("error");
      setModalOpen(true);
    }
  };

  const handleGenerateLink = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/add-friend/${user.uid}`;
    }
    return "";
  };

  const handleDeleteFriend = async (friendUid) => {
    try {
      await userService.deleteFriend(user.uid, friendUid);

      // Remove the friend from the users state
      setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== friendUid));
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const handleUserClick = async (userId) => {
    const db = getFirestore(app);
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      setSelectedUser(userDoc.data());
    } else {
      console.error("User data not found");
    }
  };

  return (
    <ProtectedRoute>
      <div className="relative">
        {/* Leaderboard Header */}
        <div className="flex justify-between items-center px-4 py-2">
          <h1 className="text-2xl font-bold">Leaderboard</h1>

          <div className="flex gap-10">
            {/* Notification Icon */}
            <Notification />

            {/* Add Friend Icon */}
            <button onClick={() => setIsModalOpen(true)} className="relative">
              <i className="fa-solid fa-plus text-xl"></i>
            </button>
          </div>
        </div>

        {/* Notification Dropdown */}
        {showNotifications && (
           <Notification notifications={notifications} onClose={handleOpenNotifications} /> 
        )}

        {/* Friend Modal */}
        {isModalOpen && (
          <FriendModal
            friendLink={friendLink}
            setFriendLink={setFriendLink}
            onClose={() => setIsModalOpen(false)}
            onAddFriend={handleAddFriend}
            onGenerateLink={handleGenerateLink}
          />
        )}

        {/* Leaderboard Section */}
        <div className="bg-lightgray rounded-xl mt-6 w-full p-4 flex flex-col items-center">
          <div className="space-y-4 w-full">
            <div className="flex justify-between mb-5 space-x-4">
              <button
                className={`px-6 text-sm font-semibold py-3 w-1/2 rounded-xl ${tab === 'community' ? 'bg-black text-white' : ''}`}
                onClick={() => setTab('community')}
              >
                Community
              </button>
              <button
                className={`px-6 text-sm font-semibold py-3 w-1/2 rounded-xl ${tab === 'friends' ? 'bg-black text-white' : ''}`}
                onClick={() => setTab('friends')}
              >
                Friends
              </button>
            </div>

            {/* Leaderboard List */}
            <div className="grid grid-cols-1 gap-4 w-full">
              {users.length > 0 ? (
                users.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-3 border-b last:border-b-0 cursor-pointer"
                    onClick={() => handleUserClick(user.id)}
                  >
                    <div className="flex w-full items-center gap-4">
                      {index === 0 ? (
                        <i className="fa-solid fa-crown text-[#ffd700] text-xl"></i>
                      ) : index === 1 ? (
                        <i className="fa-solid fa-medal text-[#c0c0c0] text-xl"></i>
                      ) : index === 2 ? (
                        <i className="fa-solid fa-medal text-[#cd7f32] text-xl"></i>
                      ) : (
                        <span className="small_title ml-[5px] mr-1.5">{index + 1}</span>
                      )}
                      <div className="flex gap-2 items-center">
                        <Image src={user.photoURL} alt={user.displayName} width={100} height={100} className="w-12 h-12 rounded-full" />
                        <div>
                          <h3 className="text-sm font-semibold">{user.uid === auth.currentUser.uid ? "You" : user.displayName || "Anonymous"}</h3>
                          <p className="text-xs text-gray-500">Lvl {user.level}</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold w-1/2 text-right">{user.totalPoints} pts</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500"></p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Modal */}
        {selectedUser && (
          <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} currentUser={user} onDeleteFriend={handleDeleteFriend} />
        )}
      </div>
    </ProtectedRoute>
  );
}