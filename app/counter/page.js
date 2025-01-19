"use client";
import { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function CounterPage() {
  const [count, setCount] = useState(0);
  const challenge = {
    title: "Subhanallah",
    arabicText: "سُـبْحانَ الله",
    requiredCount: 99,
  };

  const percentage = (count / challenge.requiredCount) * 100;

  // Calculate the position of the indicator dot
  const angle = ((percentage / 100) * 360 - 90) * (Math.PI / 180);
  const radius = 36;
  const x = 36 + radius * Math.cos(angle);
  const y = 36 + radius * Math.sin(angle);

  // Handle screen click
  const handleClick = () => {
    setCount((prevCount) => {
      // Don't increment beyond requiredCount
      if (prevCount < challenge.requiredCount) {
        return prevCount + 1;
      }
      return prevCount;
    });
  };

  return (
    // Add onClick handler to the main container
    <div
      className="flex flex-col items-center min-h-screen bg-white p-4 cursor-pointer"
      onClick={handleClick}
    >
      <div className="bg-black text-white px-4 py-1 rounded-full text-sm mb-8">
        Goals
      </div>

      <h1 className="text-xl font-medium mb-2">{challenge.title}</h1>
      <div className="mb-8">
        <div className="arabic-text text-xl">{challenge.arabicText}</div>
      </div>

      <div className="w-72 h-72 relative">
        <CircularProgressbar
          value={percentage}
          text=""
          circleRatio={1}
          styles={{
            root: {},
            path: {
              stroke: "#000",
              strokeLinecap: "round",
              strokeWidth: "2",
              transition: "stroke-dashoffset 0.5s ease",
            },
            trail: {
              stroke: "#E5E5E5",
              strokeWidth: "2",
            },
          }}
        />

        {/* Custom text in the center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline">
            <span className="text-5xl font-bold">{count}</span>
            <span className="text-lg ml-1">/99</span>
          </div>
        </div>
      </div>
    </div>
  );
}
