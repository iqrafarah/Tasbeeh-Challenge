"use client";
import React, { useState, useEffect } from "react";
import CircleProgressBar from "../components/circleProgressBar";
import { challengeService } from "../lib/services/challengeService";
import { useSearchParams } from "next/navigation";
import LoadingScreen from "../components/loadingScreen";
import app from "../lib/firebase.config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { userService } from "../lib/services/userService";
import ProtectedRoute from "../components/protectedRoute";

export default function CounterPage() {
  const [count, setCount] = useState(0);
  const [challenge, setChallenge] = useState(null);
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("id");
  const auth = getAuth(app);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        loadUserData(user.uid);
        console.log("User is authenticated", user.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const loadUserData = async (uid) => {
    try {
      const data = await userService.getUser(uid);
      setUserData(data);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!challengeId) return;

      try {
        const challenges = await challengeService.getChallenges();
        const selectedChallenge = challenges.find(
          (ch) => ch.id === challengeId
        );
        if (selectedChallenge) {
          setChallenge(selectedChallenge);
        } else {
          console.error("Challenge not found.");
        }
      } catch (error) {
        console.error("Error fetching challenge:", error);
      }
    };

    const saveChallenge = async () => {
      try {
        if (user) {
          const userId = user.uid;
          const userData = {
            userId: userId,
            challengeId: challengeId,
            count: count,
          };
          await challengeService.saveChallenge(userData);
        }
      } catch (error) {
        console.error("Error saving challenge:", error);
      }
    };

    saveChallenge();
    fetchChallenge();
  }, [challengeId, user, count]);

  if (!challenge) {
    return <LoadingScreen />;
  }

  const percentage = (count / challenge.requiredCount) * 100;

  const handleClick = () => {
    setCount((prevCount) => {
      if (prevCount < challenge.requiredCount) {
        return prevCount + 1;
      }
      return prevCount;
    });
  };

  return (
    <ProtectedRoute>
      <div
        className="flex flex-col items-center min-h-screen bg-white p-4 cursor-pointer"
        onClick={handleClick}
      >
        <div className="bg-black text-white px-4 py-1 rounded-full text-sm mb-8">
          Goals
        </div>

        <h3 className="text-xl font-bold">{challenge.title}</h3>
        <p className="text-sm mb-1">{challenge.meaning}</p>
        <p className="text-xs italic text-center">{challenge.whenToUse}</p>

        <div className="w-72 h-72 flex items-center justify-center mt-8 relative">
          <CircleProgressBar
            completed={percentage}
            bgcolor="#000"
            baseBgColor="#E5E5E5"
            size={220}
            strokeWidth={10}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <span className="count">{count}</span>
              <span className="text-lg ml-1">/{challenge.requiredCount}</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
