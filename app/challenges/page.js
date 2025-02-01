"use client";
import {useState, useEffect} from "react";
import {challengeService} from "../lib/services/challengeService";
import {userService} from "../lib/services/userService";
import LoadingScreen from "../components/loadingScreen";
import ProtectedRoute from "../components/protectedRoute";
import {useRouter} from "next/navigation";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import app from "../lib/firebase.config";

const baseColors = [
    {hex: "#f6f2c0"}, {hex: "#c4e3f2"}, {hex: "#c4f8c3"}, {hex: "#f2c4c4"},
    {hex: "#e8c4f2"}, {hex: "#f2d4c4"}, {hex: "#d4f2ef"}, {hex: "#f2c4e3"},
    {hex: "#d8d8f2"}, {hex: "#f2e8c4"},
];

// Function to get color based on index
const getColorForIndex = (index) => baseColors[index % baseColors.length].hex;

export default function ChallengesPage() {
    const router = useRouter();
    const [challenges, setChallenges] = useState([]);
    const [userProgress, setUserProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const auth = getAuth(app);

    // Load challenges
    const loadChallenges = async () => {
        try {
            const challengesList = await challengeService.getChallenges();
            setChallenges(challengesList);
        } catch (error) {
            console.error("Error loading challenges:", error);
        }
    };

    // Fetch user progress
    const fetchUserProgress = async (uid) => {
        try {
            setLoading(true);
            if (challenges.length === 0) {
                setLoading(false);
                return;
            }

            const progress = await Promise.all(
                challenges.map(async (challenge) => {
                    const userChallenge = await challengeService.getUserChallenge(uid, challenge.id);
                    return {[challenge.id]: userChallenge ? userChallenge.count : 0};
                })
            );

            setUserProgress(progress.reduce((acc, curr) => ({...acc, ...curr}), {}));
        } catch (error) {
            console.error("Error fetching user progress:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle user authentication
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                userService.updateLastActive(user.uid);

                if (challenges.length === 0) {
                    await loadChallenges();
                }

                fetchUserProgress(user.uid);
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth]);

    // Fetch user progress when challenges are loaded
    useEffect(() => {
        if (user && challenges.length > 0) {
            fetchUserProgress(user.uid);
        }
    }, [user, challenges]);

    if (loading) {
        return <LoadingScreen/>;
    }

    const handleChallengeClick = (challenge) => {
        router.push(`/counter?id=${challenge.id}`);
    };

    return (
        <ProtectedRoute>
            <div className="">
                <h1 className="title sticky top-0  pb-4">Challenges</h1>
                <div className="min-h-screen overflow-y-auto">
                    <div className="h-[calc(100vh-160px)]">
                    <div className="mt-4 flex flex-col gap-4 pb-4 pb-[170px]">
                        {challenges.map((challenge, index) => {
                            const count = userProgress[challenge.id] || 0;
                            const requiredCount = challenge.requiredCount || 1; // Prevent division by zero
                            const percentage = ((count / requiredCount) * 100).toFixed(0);
                            const isStarted = count > 0;

                            return (
                                <div
                                    key={challenge.id}
                                    className="cursor-pointer flex flex-col justify-between gap-4 min-h-[180px] p-4 rounded-xl"
                                    style={{backgroundColor: getColorForIndex(index)}}
                                    onClick={() => handleChallengeClick(challenge)}
                                >
                                    <div>
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
                                        {isStarted ? (
                                            <span className="title">{percentage}%</span>
                                        ) : (
                                            <span className="title">Start</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
