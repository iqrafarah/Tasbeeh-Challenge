"use client";
import { useState, useEffect } from "react";
import { challengeService } from "../lib/services/challengeService";
import LoadingScreen from "../components/loadingScreen";
import ProtectedRoute from "../components/protectedRoute";

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
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const challengesList = await challengeService.getChallenges();
        console.log("Challenges:", challengesList);
        setChallenges(challengesList);
      } catch (error) {
        console.error("Error loading challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedRoute>
      <div className="">
        <h1 className="title sticky top-0 bg-white pb-4">Challenges</h1>
        <div className="overflow-y-auto h-[calc(100vh-160px)]">
          <div className="mt-4 flex flex-col gap-4 pb-4">
            {challenges.map((challenge, index) => (
              <div
                key={challenge.id}
                className="challenge-card flex flex-col justify-between gap-4 min-h-[175px] p-4 rounded-xl"
                style={{ backgroundColor: getColorForIndex(index) }}
              >
                <div className="">
                  <h3 className="text-xl font-bold">{challenge.title}</h3>
                  <p className="arabic-text">{challenge.meaning}</p>
                </div>
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <span className="bg-black text-white px-4 text-sm py-1 h-fit rounded-full">
                      {challenge.points} points
                    </span>
                    <span className="bg-black text-white px-4 text-sm py-1 h-fit rounded-full">
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
