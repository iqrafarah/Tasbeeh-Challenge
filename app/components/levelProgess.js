import {useState, useEffect} from "react";
import {userService} from "../lib/services/userService";

export default function LevelProgress({data, userId}) {
    const {levelPoints, pointsToNextLevel} = data;

    const [progress, setProgress] = useState({
        levelPoints: Number(levelPoints), pointsToNextLevel: Number(pointsToNextLevel),
    });

    const progressPercentage = ((progress.levelPoints / progress.pointsToNextLevel) * 100).toFixed(0);

    const remainingPoints = progress.pointsToNextLevel - progress.levelPoints;

    const handleLevelProgression = async () => {
        if (progress.levelPoints >= progress.pointsToNextLevel) {
            const newPointsToNextLevel = Math.round(progress.pointsToNextLevel * progress.pointsToNextLevel * 1.05);

            const updateProgress = {
                levelPoints: 0, pointsToNextLevel: newPointsToNextLevel,
            }

            setProgress(updateProgress);

            try {
                await userService.updateUserStats(userId, updateProgress);
                console.log('progress', progress);
            } catch (error) {
                console.log('error', error);
            }
        }
    }

    useEffect(() => {
        handleLevelProgression();
    }, [progress, levelPoints]);

    return (<div className="mt-8 flex gap-4 w-full">
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
                        style={{width: `${progressPercentage}%`}}
                    ></div>
                </div>
            </div>
        </div>);
}