'use client';

import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, orderBy, limit, getDocs, where, doc, getDoc } from "firebase/firestore";
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
        // Fetch the user's friends list from the 'friends' subcollection
        const friendsRef = collection(db, "users", user.uid, "friends");
        const friendsSnapshot = await getDocs(friendsRef);

        // Extract friend IDs from the 'friends' subcollection
        const friends = friendsSnapshot.docs.map(doc => doc.data().friendId);

        // Include the current logged-in user in the friends list
        friends.push(user.uid);

        if (friends.length > 0) {
          // Query Firestore to get the details of the friends
          q = query(usersRef, where("uid", "in", friends), orderBy("totalPoints", "desc"), limit(20));
        } else {
          setUsers([]);
          setLoading(false);
          return;
        }
      } else {
        // Fetch top 20 users for the community tab
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

  const handleAddFriend = async () => {
    if (!friendLink) return;

    // Extract the UID from the friend link
    const friendUid = friendLink.split('/').pop();
    if (user.uid === friendUid) {
      setModalMessage("Self-add? Astaghfirullah, habibi—focus on real connections! ");
      setModalType("warning");
      setModalOpen(true);

      setIsModalOpen(false);
      setFriendLink("");
      return;
    }

    try {
      await userService.addFriend(user.uid, friendUid);
      setIsModalOpen(false);
      setFriendLink("");

      setModalMessage("Mashallah, new friend unlocked!");
      setModalType("success");

      setTimeout(() => {
        setModalOpen(true);
      }, 10);
    } catch (error) {
      console.error("Error adding friend:", error);

      setModalMessage(error.message || "Failed to add friend. Please try again.");
      setModalType("warning");

      setTimeout(() => {
        setModalOpen(true);
      }, 10);
    }
  };

  const handleDeleteFriend = async (friendUid) => {
    try {
      await userService.deleteFriend(user.uid, friendUid);
      setModalMessage("Friend removed successfully.");
      setModalType("success");
      setModalOpen(true);
    } catch (error) {
      console.error("Error removing friend:", error);
      setModalMessage("Failed to remove friend. Please try again.");
      setModalType("warning");
      setModalOpen(true);
    }
  };

  const handleGenerateLink = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/add-friend/${user.uid}`;
    }
    return "";
  };

  const handleUserClick = async (userId) => {
    // Fetch the clicked user's profile data
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
      <div className="">
        <Notification isOpen={modalOpen} onClose={() => setModalOpen(false)} message={modalMessage} type={modalType} />
        <div className="flex justify-between items-center">
          <h1 className="title">Leaderboard</h1>

          {/* Add Friend Button */}
          <button onClick={() => setIsModalOpen(true)} className="">
            <i className="fa-solid fa-plus text-xl"></i>
          </button>
        </div>

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

        {/* Profile Modal - Display on user click */}
        {selectedUser && (
          <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} currentUser={user} />
        )}

        {/* Leaderboard Section */}
        <div className="bg-lightgray rounded-xl mt-10 w-full p-4 flex flex-col items-center">
          <div className="space-y-4 w-full">
            <div className="flex justify-between mb-5 space-x-4">
              <button
                className={`px-6 text-sm font-semibold py-3 h-fit w-1/2 rounded-xl ${tab === 'community' ? 'bg-black text-white' : ''}`}
                onClick={() => setTab('community')}
              >
                Community
              </button>
              <button
                className={`px-6 text-sm font-semibold py-3 h-fit w-1/2 rounded-xl ${tab === 'friends' ? 'bg-black text-white' : ''}`}
                onClick={() => setTab('friends')}
              >
                Friends
              </button>
            </div>
            {/* Using Grid Layout */}
            <div className="grid grid-cols-1 gap-4 w-full">
              {users.length > 0 ? (
                users.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-3 border-b last:border-b-0"
                    onClick={() => handleUserClick(user.id)} // Handle user click to show profile
                  >
                    {/* Rank & Icon */}
                    <div className="flex w-full items-center gap-4 w-fit">
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
                        {/* Profile Image */}
                        <Image
                          src={user.photoURL}
                          alt={user.displayName}
                          width={100}
                          height={100}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="text-sm font-semibold">{user.uid === auth.currentUser.uid ? "You" : user.displayName || "Anonymous"}</h3>
                          <p className="text-xs text-gray-500">Lvl {user.level}</p>
                        </div>
                      </div>
                    </div>
                    {/* Points */}
                    <span className="text-sm font-semibold w-1/2 text-right">{user.totalPoints} pts</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No users found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}