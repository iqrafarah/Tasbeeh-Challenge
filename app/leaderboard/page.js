"use client";
import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import app from "../lib/services/userService";
import Image from "next/image";

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [tab, setTab] = useState('community'); // 'all' or 'friends'
    const [loading, setLoading] = useState(true);

    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!user) return; // If user is not authenticated, return

            const db = getFirestore(app);
            const usersRef = collection(db, "users");

            let q;

            // Set the query based on the tab selected
            if (tab === 'friends' && user.friends) {
                // Assuming you have a friends array or object for each user
                q = query(usersRef, orderBy("totalPoints", "desc"), limit(20));
            } else {
                q = query(usersRef, orderBy("totalPoints", "desc"), limit(20)); // Fetch top 20 users
            }

            try {
                const querySnapshot = await getDocs(q);
                const leaderboardData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(leaderboardData);
                console.log(leaderboardData);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [tab, user]);

    return (
        <div className="">
            <h1 className="title mb-5 text-left">Leaderboard</h1>

            {/* Leaderboard Section */}
            <div className="bg-lightgray rounded-xl mt-5 w-full p-4 flex flex-col items-center">
                {loading ? (
                    <p className="text-center text-gray-500">Loading leaderboard...</p>
                ) : (
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
                                    <div key={user.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                                        {/* Rank & Icon */}
                                        <div className="flex w-full items-center gap-4 w-fit">
                                            {index === 0 ? (
                                                <i className="fa-solid fa-crown text-[#ffd700] text-xl"></i>
                                            ) : index === 1 ? (
                                                <i className="fa-solid fa-medal text-[#c0c0c0] text-xl"></i>
                                            ) : index === 2 ? (
                                                <i className="fa-solid fa-medal text-[#cd7f32] text-xl"></i>
                                            ) : (
                                                <span className="text-2xl font-bold">{index + 1}</span>
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
                                                {/* User Info */}
                                                <div>
                                                    <h3 className="text-sm font-semibold">{user.displayName || "Anonymous"}</h3>
                                                    <p className="text-xs text-gray-500">Lvl {user.level}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Points */}
                                        <span className="text-sm font-semibold w-fit">{user.totalPoints} pts</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500">No users found.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
