'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Statistics from '../components/statistics';
import LevelProgress from '../components/levelProgess';
import HeatTracker from '../components/contributionGraph';
import { getFirestore, doc, deleteDoc, getDoc } from "firebase/firestore";
import app from '../lib/services/userService'; // Ensure this imports Firebase correctly

const ProfileModal = ({ user, onClose, currentUser }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFriend, setIsFriend] = useState(false); // Track if the user is a friend

    useEffect(() => {
        const checkIfFriend = async () => {
            if (!currentUser || !user) return;

            const db = getFirestore(app);

            // Check if the current user is friends with the viewed user
            const userFriendRef = doc(db, "users", currentUser.uid, "friends", user.uid);
            const userFriendDoc = await getDoc(userFriendRef);

            setIsFriend(userFriendDoc.exists()); // Set isFriend based on the existence of the document
        };

        checkIfFriend();
    }, [currentUser, user]);

    const handleDeleteFriend = async () => {
        if (!currentUser || !user) return;

        setIsDeleting(true);
        try {
            const db = getFirestore(app);

            // Delete from current user's friend list
            await deleteDoc(doc(db, "users", currentUser.uid, "friends", user.uid));

            // Delete from friend's friend list too (bidirectional friendship)
            await deleteDoc(doc(db, "users", user.uid, "friends", currentUser.uid));

            alert(`${user.displayName} has been removed from your friends list.`);
            onClose(); // Close modal after deleting
        } catch (error) {
            console.error("Error removing friend:", error);
            alert("Failed to remove friend. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50">
            <div className="bg-white p-6 container overflow-y-auto max-h-screen relative">
                {/* Close & Delete Buttons */}
                <div className="flex justify-between items-center mb-4">
                    <i onClick={onClose} className="fa-solid fa-chevron-left text-lg cursor-pointer"></i>

                    {/* Only show the Delete button if the user is a friend */}
                    {isFriend && (
                        <button
                            onClick={handleDeleteFriend}
                            className="text-red-500 text-sm font-semibold"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Removing..." : "Delete Friend"}
                        </button>
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
                <h2 className="text-center text-xl font-semibold mt-3">{user.displayName}</h2>

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
                <HeatTracker uid={user.uid} />
            </div>
        </div>
    );
};

export default ProfileModal;