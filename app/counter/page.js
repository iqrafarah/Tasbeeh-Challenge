'use client';
import React, {useState, useEffect, Suspense} from "react";
import CircleProgressBar from "../components/circleProgressBar";
import {challengeService} from "../lib/services/challengeService";
import {useSearchParams, useRouter} from "next/navigation";
import LoadingScreen from "../components/loadingScreen";
import app from "../lib/firebase.config";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {userService} from "../lib/services/userService";
import ProtectedRoute from "../components/protectedRoute";
import Confetti from "react-confetti";
import LevelUpModal from "../components/newLevelModal";

// Debounce function
const debounce = (func, wait) => {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

function CounterPageContent() {
    const [count, setCount] = useState(0);
    const [challenge, setChallenge] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [challenges, setChallenges] = useState([]);
    const searchParams = useSearchParams();
    const challengeId = searchParams.get("id");
    const auth = getAuth(app);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState([]);
    const router = useRouter();
    const [showTapInstruction, setShowTapInstruction] = useState(true);
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0);
    const [windowHeight, setWindowHeight] = useState(typeof window !== "undefined" ? window.innerHeight : 0);
    const [levelUpModalVisible, setLevelUpModalVisible] = useState(false);
    const [newLevel, setNewLevel] = useState(null);

    const updateUserStats = async (uid, earnedPoints) => {
        try {
            const result = await userService.updateUserStats(uid, earnedPoints);

            // Check if the level has changed, then show the modal
            if (result.hasLevelChanged) {
                setNewLevel(result.newLevel); // Set the new level
                setLevelUpModalVisible(true); // Show the modal
            }
        } catch (error) {
            console.error("Error updating user stats:", error);
        }
    };

    // Update window dimensions for Confetti
    useEffect(() => {
        if (typeof window === "undefined") return; // Ensure this runs only in the browser

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Authentication handler
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                loadUserData(user.uid);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, [auth]);

    // Load user data
    const loadUserData = async (uid) => {
        try {
            const data = await userService.getUser(uid);
            setUserData(data);
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    // Fetch challenges and challenge data
    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const allChallenges = await challengeService.getChallenges();
                setChallenges(allChallenges);
                const selectedChallenge = allChallenges.find((ch) => ch.id === challengeId);
                if (selectedChallenge) {
                    setChallenge(selectedChallenge);
                    setCompleted(false);
                } else {
                    console.error("Challenge not found.");
                }
            } catch (error) {
                console.error("Error fetching challenges:", error);
            }
        };

        const fetchUserChallenge = async () => {
            try {
                if (user && challengeId) {
                    const userChallenge = await challengeService.getUserChallenge(user.uid, challengeId);
                    if (userChallenge) {
                        setCount(userChallenge.count);
                    } else {
                        setCount(0);
                    }
                }
            } catch (error) {
                console.error("Error fetching user challenge:", error);
            }
        };

        if (user && challengeId) {
            fetchChallenges();
            fetchUserChallenge();
        }
    }, [challengeId, user]);

    // Check completion status
    useEffect(() => {
        if (count >= challenge?.requiredCount && !completed) {
            setCompleted(true);
        }
    }, [count, challenge, completed]);

    // Debounced save challenge function
    const debouncedSaveChallenge = debounce(async (userId, challengeId, count) => {
        try {
            const userData = {
                userId: userId,
                challengeId: challengeId,
                count: count,
            };
            await challengeService.saveChallenge(userData);
        } catch (error) {
            console.error("Error saving challenge:", error);
        }
    }, 1000); // Adjust the delay as needed

    // Save challenge progress
    useEffect(() => {
        if (user && count !== 0) {
            debouncedSaveChallenge(user.uid, challengeId, count);
        }
    }, [count, user, challengeId]);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    const handleClick = async () => {
        if (completed) return;

        if (showTapInstruction) {
            setShowTapInstruction(false); // Hide the instruction after the first tap
        }

        // Trigger vibration if supported
        if (navigator.vibrate) {
            if (isIOS) {
                navigator.vibrate(200); // Simpler pattern for iOS
            } else {
                navigator.vibrate([30, 50, 30]); // More complex pattern for other devices
            }
        } else {
            console.log("Vibration not supported");
            // Fallback for devices that don't support vibration
        }

        setCount((prevCount) => {
            const newCount = prevCount + 1;
            if (newCount >= challenge.requiredCount) {
                updateUserStats(user.uid, challenge.points); // Use challenge.points instead of a fixed value
            }

            return newCount;
        });

        // Update totalDhikr for every count
        userService.updateTotalDhikr(user.uid);
    };
    const handleRetry = () => {
        setCount(0);
        setCompleted(false);
    };

    const handleNext = () => {
        if (!challenges.length) return;

        const currentIndex = challenges.findIndex((ch) => ch.id === challengeId);
        const nextIndex = (currentIndex + 1) % challenges.length;
        const nextChallengeId = challenges[nextIndex].id;

        // Navigate to the next challenge
        router.push(`/counter?id=${nextChallengeId}`);
    };

    if (!challenge) {
        return <LoadingScreen/>;
    }

    const percentage = (count / challenge.requiredCount) * 100;

    return (
        <ProtectedRoute>
            <div
                className="flex flex-col items-center min-h-screen bg-white p-4 cursor-pointer"
                onClick={!completed ? handleClick : undefined}
            >
                {levelUpModalVisible && (
                    <LevelUpModal
                        newLevel={newLevel}
                        onClose={() => setLevelUpModalVisible(false)}
                    />
                )}
                {completed && typeof window !== "undefined" && (
                    <Confetti
                        width={windowWidth}
                        height={windowHeight}
                        recycle={false}
                        numberOfPieces={500}
                        colors={['#f6f2c0', '#c4e3f2', '#c4f8c3', '#f2c4c4', '#e8c4f2', '#f2d4c4']}
                    />
                )}

                {completed ? (
                    <>
                        <h3 className="title text-center">Congrats🎉</h3>
                        <p className="mt-3 text-sm text-center">You have completed this challenge!</p>
                    </>
                ) : (
                    <>
                        <h3 className="text-xl font-bold">{challenge.title}</h3>
                        <p className="text-sm mb-1">{challenge.meaning}</p>
                        <p className="text-xs italic text-center">{challenge.whenToUse}</p>
                    </>
                )}

                <div className="w-72 h-72 flex items-center justify-center mt-32 relative">
                    <CircleProgressBar
                        completed={percentage}
                        bgcolor="#000"
                        baseBgColor="#E5E5E5"
                        size={250}
                        strokeWidth={12}
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="flex flex-col items-center justify-center">
                            <span className="count">{count}</span>
                            <span className="text-lg ml-1 font-semibold">total {challenge.requiredCount}</span>
                        </div>
                    </div>
                </div>

                {completed && (
                    <div className="mt-[60px] flex gap-4 w-full">
                        <button onClick={handleRetry} className="buttonSecondary">
                            Try again
                        </button>
                        <button onClick={handleNext} className="button">
                            Next One
                        </button>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}

export default function CounterPage() {
    return (
        <Suspense fallback={<LoadingScreen/>}>
            <CounterPageContent/>
        </Suspense>
    );
}