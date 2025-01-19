"use client";
import React, { useState } from "react";
import CircleProgressBar from "../components/circleProgressBar";

export default function CounterPage() {
  const [count, setCount] = useState(0);
  const challenge = {
    title: "Subhanallah",
    arabicText: "سُـبْحانَ الله",
    requiredCount: 99,
  };

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
    <div
      className="flex flex-col items-center min-h-screen bg-white p-4 cursor-pointer"
      onClick={handleClick}
    >
      <div className="bg-black text-white px-4 py-1 rounded-full text-sm mb-8">
        Goals
      </div>

      <h1 className="text-xl font-medium mb-2">{challenge.title}</h1>
      <div className="">
        <div className="arabic-text text-xl">{challenge.arabicText}</div>
      </div>

      <div className="w-72 h-72 flex items-center justify-center relative">
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
            <span className="text-lg ml-1">/99</span>
          </div>
        </div>
      </div>
    </div>
  );
}
