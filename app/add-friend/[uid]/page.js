"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { userService } from "../../lib/services/userService";
import Link from "next/link";

export default function AddFriendPage() {
  const { uid } = useParams();
  const router = useRouter();
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (uid && currentUser.uid !== uid) {
          handleAddFriend(currentUser);
        } else {
          setErrorMessage("You cannot add yourself as a friend.");
          setStatus("error");
        }
      } else {
        setStatus("unauthenticated");
      }
    });

    return () => unsubscribe();
  }, [uid]);

  const handleAddFriend = async (currentUser) => {
    try {
      await userService.addFriend(currentUser.uid, uid);
      await userService.sendNotification(
        uid,
        currentUser.displayName || "Someone",
        currentUser.photoURL || "/default-avatar.png"
      );
      setStatus("success");
    } catch (error) {
      console.error("Error adding friend:", error);
      setErrorMessage("Failed to add friend. Please try again.");
      setStatus("error");
    }
  };

  const renderContent = () => {
    if (status === "loading") {
      return <p className="text-center">Loading...</p>;
    }

    if (status === "unauthenticated") {
      return (
        <div className="text-center">
          <h2 className="text-lg font-bold mb-4">Please Log In</h2>
          <p className="mb-4">You need to be logged in to add friends.</p>
          <Link href="/">
            <button className="px-6 py-3 bg-[#94D098] text-white rounded-full">
              Log In
            </button>
          </Link>
        </div>
      );
    }

    if (status === "success") {
      return (
        <div className="text-center">
          <h2 className="text-lg font-bold mb-4">Friend Added Successfully!</h2>
          <p className="mb-4">You can now view them on your leaderboard.</p>
          <Link href="/leaderboard">
            <button className="px-6 py-3 bg-[#94D098] text-black rounded-full">
              Go to Leaderboard
            </button>
          </Link>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="text-center">
          <h2 className="text-lg font-bold mb-4">Error Adding Friend</h2>
          <p className="text-red-500 mb-4">{errorMessage}</p>
          <Link href="/leaderboard">
            <button className="px-6 py-3 bg-[#94D098] text-white rounded-full">
              Go to Leaderboard
            </button>
          </Link>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        {renderContent()}
      </div>
    </div>
  );
}
