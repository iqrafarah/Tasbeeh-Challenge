"use client";
import React, {useState, useEffect} from "react";
import {getAuth, signOut, onAuthStateChanged} from "firebase/auth";
import {useRouter} from "next/navigation";
import app from "../lib/firebase.config";
import {userService} from "../lib/services/userService";
import LoadingScreen from "../components/loadingScreen";
import ProtectedRoute from "../components/protectedRoute";
import Image from "next/image";
import Statistics from "../components/statistics";
import LevelProgess from "../components/levelProgess";
import HeatTracker from "../components/contributionGraph";
import Link from "next/link";

export default function ProfileScreen() {
    const auth = getAuth(app);
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (!authUser) {
                router.push("/"); // Redirect to home if not authenticated
                return;
            }

            setUser(authUser);
            try {
                const data = await userService.getUser(authUser.uid);
                setUserData(data);
            } catch (error) {
                console.error("Error loading user data:", error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth, router]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/"); // Redirect to home after logout
        } catch (error) {
            console.error("Error signing out", error.message);
        }
    };

    if (loading) {
        return <LoadingScreen/>;
    }

    if (!user || !userData) {
        return null; // If user or userData isn't available
    }

    return (
        <ProtectedRoute>
            <div className="h-screen flex flex-col  overflow-y-auto pb-[130px]">
                    {/* Gear Icon to Open Settings */}
                    
                    <div className="flex justify-between items-center">
                    <h1 className="title">Profile</h1>

                    <div className="text-right w-full pr-2">
                        <Link href="/settings">
                            <i className="fa-solid fa-gear text-2xl cursor-pointer"></i>
                        </Link>
                    </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1">
                        <div
                            className="profile-header text-center flex flex-col gap-4 justify-center items-center pt-4">
                            <Image
                                src={userData.photoURL}
                                width={100}
                                height={100}
                                alt="profile pic"
                                className="rounded-full object-cover w-[70px] h-[70px]"
                            />
                            <h1 className="text-xl font-bold">{userData.displayName}</h1>
                        </div>

                        <div className="flex justify-between border border-gray-100 rounded-lg mt-3 min-h-[75px]">
                            <div className="flex flex-col justify-center text-center border-r w-1/3 h-[90%] m-auto">
                                <span className="title">{userData.streak}</span>
                                <span>Streak</span>
                            </div>

                            <div className="flex flex-col justify-center text-center border-r w-1/3 h-[90%] m-auto">
                                <span className="title">{userData.level}</span>
                                <span>Level</span>
                            </div>

                            <div className="flex flex-col justify-center text-center w-1/3 h-[80%] m-auto">
                                <span className="title">{userData.totalPoints}</span>
                                <span>Points</span>
                            </div>
                        </div>

                        <LevelProgess data={userData} userId={user.uid}/>
                        <Statistics stats={userData}/>
                        <HeatTracker uid={user.uid}/>
                </div>
            </div>
        </ProtectedRoute>
    );
}