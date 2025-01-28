"use client";
import { useState, useEffect } from "react";
import { challengeService } from "../lib/services/challengeService";
import { userService } from "../lib/services/userService"; // Import userService
import LoadingScreen from "../components/loadingScreen";
import ProtectedRoute from "../components/protectedRoute";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../lib/firebase.config";

const baseColors = [
  { hex: "#f6f2c0" }, // Light Yellow (original)
  { hex: "#c4e3f2" }, // Light Blue (original)
  { hex: "#c4f8c3" }, // Light Green (original)
  { hex: "#f2c4c4" }, // Light Red
  { hex: "#e8c4f2" }, // Light Purple
  { hex: "#f2d4c4" }, // Light Orange
  { hex: "#d4f2ef" }, // Light Turquoise
  { hex: "#f2c4e3" }, // Light Pink
  { hex: "#d8d8f2" }, // Light Lavender
  { hex: "#f2e8c4" }, // Light Peach
];

// Function to get color based on index
const getColorForIndex = (index) => {
  return baseColors[index % baseColors.length].hex;
};

export default function ChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const challengesList = await challengeService.getChallenges();
        setChallenges(challengesList);
      } catch (error) {
        console.error("Error loading challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    const updateLastActive = async (uid) => {
      try {
        await userService.updateLastActive(uid);
      } catch (error) {
        console.error("Error updating last active:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        updateLastActive(user.uid);
      }
    });

    loadChallenges();

    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return <LoadingScreen />;
  }

  const handleChallengeClick = (challenge) => {
    router.push(`/counter?id=${challenge.id}`);
  };

  return (
    <ProtectedRoute>
      <div className="bg-white">
        <h1 className="title sticky top-0 bg-white pb-4">Challenges</h1>
        <div className="overflow-y-auto h-[calc(100vh-160px)]">
          <div className="mt-4 flex flex-col gap-4 pb-4">
            {challenges.map((challenge, index) => (
              <div
                key={challenge.id}
                className="cursor-pointer flex flex-col justify-between gap-4 min-h-[180px] p-4 rounded-xl"
                style={{ backgroundColor: getColorForIndex(index) }}
                onClick={() => handleChallengeClick(challenge)}
              >
                <div className="">
                  <h3 className="text-xl font-bold">{challenge.title}</h3>
                  <p className="text-sm mb-1">{challenge.meaning}</p>
                  <p className="text-xs italic">{challenge.whenToUse}</p>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-black text-white px-3 text-xs py-1 h-fit rounded-full">
                      {challenge.points} points
                    </span>
                    <span className="bg-black text-white px-3 text-xs py-1 h-fit rounded-full">
                      {challenge.requiredCount} times
                    </span>
                  </div>
                  <span className="title">Start</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
