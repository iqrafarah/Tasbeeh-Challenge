"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Statistics from "../components/statistics";
import LevelProgress from "../components/levelProgess";
import HeatTracker from "../components/contributionGraph";
import { getFirestore, doc, deleteDoc, getDoc } from "firebase/firestore";
import app from "../lib/services/userService";
import ConfirmationModal from "./confirmationModal";
import { userService } from "../lib/services/userService";

const ProfileModal = ({ user, onClose, currentUser, onDeleteFriend }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const checkIfFriend = async () => {
      if (!currentUser || !user) {
        return;
      }

      const db = getFirestore(app);

      // Check if the current user is friends with the viewed user
      const userFriendRef = doc(
        db,
        "users",
        currentUser.uid,
        "friends",
        user.uid
      );
      const userFriendDoc = await getDoc(userFriendRef);

      setIsFriend(userFriendDoc.exists());
    };

    checkIfFriend();
  }, [currentUser, user]);

  const handleDeleteFriend = async () => {
    if (!currentUser || !user) return;

    setIsDeleting(true);
    try {
      await onDeleteFriend(user.uid);
      setIsFriend(false); // Update UI
      onClose(); // Close modal
    } catch (error) {
      console.error("Error removing friend:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex w-full mx-auto justify-center items-center z-50">
      <div className="container max-h-screen relative">
        {/* Close & Delete Buttons */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <i
              onClick={onClose}
              className="fa-solid fa-chevron-left text-lg cursor-pointer"
            ></i>

            <button onClick={onClose} className=""></button>
          </div>
          {/* Only show the Delete button if the user is a friend */}
          {isFriend && (
            <button
              onClick={() => setShowConfirmation(true)} // Open confirmation modal
              className="text-red-500 rounded-full hover:opacity-90"
              disabled={isDeleting}
              dangerouslySetInnerHTML={{
                __html: isDeleting
                  ? "Removing..."
                  : '<i class="fa-solid fa-user-minus"></i>',
              }}
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="flex items-center justify-center mt-4">
          <Image
            src={user.photoURL}
            alt="Profile picture"
            width={100}
            height={100}
            className="rounded-full object-cover w-[70px] h-[70px]"
          />
        </div>
        <h2 className="text-center text-xl font-semibold mt-3">
          {user.displayName}
        </h2>

        {/* Stats Section */}
        <div className="flex justify-between border border-gray-100 rounded-lg mt-3 min-h-[75px]">
          <div className="flex flex-col justify-center text-center border-r w-1/3 h-[90%] m-auto">
            <span className="title">{user.streak}</span>
            <span>Streak</span>
          </div>
          <div className="flex flex-col justify-center text-center border-r w-1/3 h-[90%] m-auto">
            <span className="title">{user.level}</span>
            <span>Level</span>
          </div>
          <div className="flex flex-col justify-center text-center w-1/3 h-[80%] m-auto">
            <span className="title">{user.totalPoints}</span>
            <span>Points</span>
          </div>
        </div>

        {/* Additional Components */}
        <LevelProgress data={user} userId={user.uid} />
        <Statistics stats={user} />
        <div className="mb-5">
          <HeatTracker uid={user.uid} />
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleDeleteFriend}
        title="Delete Friend"
        message="Are you sure you want to remove this friend?"
        confirmText="Delete friend"
        confirmColor="bg-red-500"
      />
    </div>
  );
};

export default ProfileModal;
