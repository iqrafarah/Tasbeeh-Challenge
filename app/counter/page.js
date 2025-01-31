'use client';
import React, { useState, useEffect, Suspense } from "react";
import CircleProgressBar from "../components/circleProgressBar";
import { challengeService } from "../lib/services/challengeService";
import { useSearchParams, useRouter } from "next/navigation";
import LoadingScreen from "../components/loadingScreen";
import app from "../lib/firebase.config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { userService } from "../lib/services/userService";
import ProtectedRoute from "../components/protectedRoute";
import Confetti from "react-confetti";

// Debounce function to limit the number of calls
const debounce = (func, wait) => {
    let timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(func, wait);
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
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Update window dimensions for Confetti
    useEffect(() => {
        const handleResize = debounce(() => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        }, 200);

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Authentication handler
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
                setLoading(true);
                const allChallenges = await challengeService.getChallenges();
                setChallenges(allChallenges);
                const selectedChallenge = allChallenges.find((ch) => ch.id === challengeId);
                if (selectedChallenge) {
                    setChallenge(selectedChallenge);
                    setCompleted(false);
                } else {
                    setError("Challenge not found.");
                    console.error("Challenge not found.");
                }
                setLoading(false);
            } catch (error) {
                setError("Error fetching challenges.");
                console.error("Error fetching challenges:", error);
                setLoading(false);
            }
        };

        if (user && challengeId) {
            fetchChallenges();
        }
    }, [challengeId, user]);

    // Fetch user challenge data
    useEffect(() => {
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
            fetchUserChallenge();
        }
    }, [challengeId, user]);

    // Check completion status
    useEffect(() => {
        if (count >= challenge?.requiredCount && !completed) {
            setCompleted(true);
        }
    }, [count, challenge, completed]);

    // Save challenge progress
    useEffect(() => {
        const saveChallenge = async () => {
            if (count % 5 === 0 && user) { // Save every 5 counts
                const userData = { userId: user.uid, challengeId: challengeId, count };
                try {
                    await challengeService.saveChallenge(userData);
                } catch (error) {
                    console.error("Error saving challenge:", error);
                }
            }
        };

        if (count > 0) {
            saveChallenge();
        }
    }, [count, user, challengeId]);

    const updateStats = async () => {
        if (count >= challenge.requiredCount) {
            await userService.updateUserStats(user.uid, challenge.points);
            console.log("Challenge completed!");
        }
        await userService.updateTotalDhikr(user.uid);
    };

    const handleClick = async () => {
        if (completed) return;

        if (showTapInstruction) {
            setShowTapInstruction(false); // Hide the instruction after the first tap
        }

        setCount((prevCount) => {
            const newCount = prevCount + 1;
            if (newCount >= challenge.requiredCount) {
                setCompleted(true); // Mark the challenge as completed
            }
            return newCount;
        });

        // Update stats and total Dhikr only after the count is updated
        updateStats();
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

    if (loading) return <LoadingScreen />;
    if (error) return <div>{error}</div>;

    if (!challenge) {
        return <LoadingScreen />;
    }

    const percentage = (count / challenge.requiredCount) * 100;

    return (
        <ProtectedRoute>
            <div
                className="flex flex-col items-center min-h-screen bg-white p-4 cursor-pointer"
                onClick={!completed ? handleClick : undefined}
            >
                {completed && (
                    <Confetti
                        width={windowWidth}
                        height={windowHeight}
                        recycle={false}
                        numberOfPieces={500}
                        colors={['#f6f2c0', '#c4e3f2', '#c4f8c3', '#f2c4c4', '#e8c4f2', '#f2d4c4']}
                        style={{ position: 'absolute', top: 0, left: 0 }}
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
        <Suspense fallback={<LoadingScreen />}>
            <CounterPageContent />
        </Suspense>
    );
}
