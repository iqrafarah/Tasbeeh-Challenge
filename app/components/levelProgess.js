import { useState, useEffect } from "react";
import { userService } from "../lib/services/userService";

export default function LevelProgress({ data, userId }) {
    const { totalPoints, pointsToNextLevel } = data;

    const [progress, setProgress] = useState({
        totalPoints: Number(totalPoints),
        pointsToNextLevel: Number(pointsToNextLevel),
    });

    const progressPercentage = ((progress.totalPoints / progress.pointsToNextLevel) * 100).toFixed(0);
    const remainingPoints = progress.pointsToNextLevel - progress.totalPoints;

    const handleLevelProgression = async () => {
        if (progress.totalPoints >= progress.pointsToNextLevel) {
            const newPointsToNextLevel = Math.round(5 * Math.pow(progress.totalPoints / 5, 1.5)); // Use the adjusted formula for level progression

            setProgress((prev) => ({
                ...prev,
                pointsToNextLevel: newPointsToNextLevel,
            }));

            try {
                console.log(newPointsToNextLevel, totalPoints);
                // No need to reset totalPoints, only update progress and pointsToNextLevel
                await userService.updateUserStats(userId, 0); // No reset for totalPoints
                console.log("Progress updated", progress);
            } catch (error) {
                console.log("Error updating progress:", error);
            }
        }
    };

    useEffect(() => {
        handleLevelProgression();
    }, [progress.totalPoints]); // Listen to totalPoints changes

    return (
        <div className="mt-8 flex gap-4 w-full">
            <div className="w-full flex flex-col justify-center min-h-[100px] p-4 rounded-xl bg-lightgray">
                <div className="flex justify-between">
                    <div>
                        <div className="flex flex-col">
                            <h3 className="font-bold">Level Progress</h3>
                            <p className="text-xs">{remainingPoints} points remaining</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="progressNumber">{progressPercentage}%</h3>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div
                        className="h-full bg-black rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
