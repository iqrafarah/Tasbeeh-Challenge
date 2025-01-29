"use client";
import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import app from "../lib/firebase.config";
import { getDoc, doc, getFirestore } from "firebase/firestore";
import LoadingScreen from "../components/loadingScreen";
import ProtectedRoute from "../components/protectedRoute";
import Image from "next/image";
import { userService } from "../lib/services/userService";
import Statistics from "../components/statistics"
export default function ProfileScreen() {
  const auth = getAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const loadUserData = async (uid) => {
      try {
        const data = await userService.getUser(uid);
        setUserData(data);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push("/");
        return;
      }

      setUser(authUser);
      await loadUserData(authUser.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out", error.message);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="">
        <div className=""></div>
        <div className="text-center flex flex-col gap-4 justify-center items-center">
          <Image
            src={userData.photoURL}
            width={100}
            height={100}
            alt="profile pic"
            className="rounded-full"
          />
          <h1 className="text-xl font-bold">{userData.displayName}</h1>
        </div>

        <div className="flex justify-between border border-gray-100 rounded-lg mt-3 min-h-[75px]">
          <div className="flex flex-col justify-center text-center border-r w-1/3 h-[90%] m-auto">
            <span className="title">{userData?.streak}</span>
            <span>Streak</span>
          </div>

          <div className="flex flex-col justify-center text-center border-r w-1/3 h-[90%] m-auto">
            <span className="title">{userData?.level}</span>
            <span>level</span>
          </div>

          <div className="flex flex-col justify-center text-center w-1/3 h-[80%] m-auto">
            <span className="title">{userData?.levelPoints}</span>
            <span>points</span>
          </div>
        </div>

        <Statistics stats={userData} />
      </div>
    </ProtectedRoute>
  );
}
