"use client";
import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import app from "../lib/firebase.config";
import { getDoc, doc, getFirestore } from "firebase/firestore";
import LoadingScreen from "../components/loadingScreen";
import ProtectedRoute from "../components/protectedRoute";

export default function ProfileScreen() {
  const auth = getAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push("/");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", authUser.uid));
      if (userDoc.exists()) {
        setUser({ ...authUser, ...userDoc.data() });
      }
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
        <h1>Profile, {user.displayName}</h1>
        <p>Profile page</p>
        <button onClick={handleLogout}>Sign out</button>
      </div>
    </ProtectedRoute>
  );
}
