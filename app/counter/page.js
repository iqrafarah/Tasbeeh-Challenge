'use client';
import React, {useState, useEffect, Suspense} from "react";
import CircleProgressBar from "../components/circleProgressBar";
import {challengeService} from "../lib/services/challengeService";
import {useSearchParams} from "next/navigation";
import LoadingScreen from "../components/loadingScreen";
import app from "../lib/firebase.config";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {userService} from "../lib/services/userService";
import ProtectedRoute from "../components/protectedRoute";
import Confetti from "react-confetti";

function CounterPageContent() {
    const [count, setCount] = useState(0);
    const [challenge, setChallenge] = useState(null);
    const [completed, setCompleted] = useState(false);
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
                const selectedChallenge = challenges.find((ch) => ch.id === challengeId);
                if (selectedChallenge) {
                    setChallenge(selectedChallenge);
                } else {
                    console.error("Challenge not found.");
                }
            } catch (error) {
                console.error("Error fetching challenge:", error);
            }
        };

        const fetchUserChallenge = async () => {
            try {
                if (user) {
                    const userChallenge = await challengeService.getUserChallenge(user.uid, challengeId);
                    if (userChallenge) {
                        setCount(userChallenge.count);
                    }
                }
            } catch (error) {
                console.error("Error fetching user challenge:", error);
            }
        };

        fetchChallenge();
        fetchUserChallenge();
    }, [challengeId, user]);

    // Check completion status
    useEffect(() => {
        if (count >= challenge?.requiredCount && !completed) {
            setCompleted(true);
        }
    }, [count, challenge, completed]);

    // Hide confetti after 5 seconds

    // Save challenge progress
    useEffect(() => {
        const saveChallenge = async () => {
            try {
                if (user) {
                    const userId = user.uid;
                    const userData = {
                        userId: userId, challengeId: challengeId, count: count,
                    };
                    await challengeService.saveChallenge(userData);
                }
            } catch (error) {
                console.error("Error saving challenge:", error);
            }
        };

        saveChallenge();
    }, [count, user, challengeId]);

    if (!challenge) {
        return <LoadingScreen/>;
    }

    const percentage = (count / challenge.requiredCount) * 100;

    const handleClick = async () => {
        if (completed) return; // Stop counting if challenge is completed

        setCount((prevCount) => {
            const newCount = prevCount + 1;
            if (newCount >= challenge.requiredCount) {
                userService.updateUserStats(user.uid, challenge.points);
                console.log("Challenge completed!");
            }
            return newCount;
        });
    };

    const handleRetry = () => {
        setCount(0);
        setCompleted(false);
    };

    const handleNext = () => {
        console.log("Go to next challenge");
        // Implement logic to navigate to the next challenge
    };

    return (<ProtectedRoute>
        <div className="flex flex-col items-center min-h-screen bg-white p-4 cursor-pointer"
             onClick={!completed ? handleClick : undefined}>
            {completed && <Confetti width={375} height={window.innerHeight} recycle={false} numberOfPieces={500}
                           colors={['#f6f2c0', '#c4e3f2', '#c4f8c3', '#f2c4c4', '#e8c4f2', '#f2d4c4']}/>}
            {completed ? (<>
                <h3 className="title text-center">Congrats🎉</h3>
                <p className="mt-3 text-sm text-center">You have completed this challenge!</p>
            </>) : (<>
                <h3 className="text-xl font-bold">{challenge.title}</h3>
                <p className="text-sm mb-1">{challenge.meaning}</p>
                <p className="text-xs italic text-center">{challenge.whenToUse}</p>
            </>)}

            <div className="w-72 h-72 flex items-center justify-center mt-16 relative">
                <CircleProgressBar
                    completed={percentage}
                    bgcolor="#000"
                    baseBgColor="#E5E5E5"
                    size={220}
                    strokeWidth={12}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                        <span className="count">{count}</span>
                        <span className="text-lg ml-1 font-semibold">/{challenge.requiredCount}</span>
                    </div>
                </div>
            </div>

            {completed && (<div className="mt-8 flex gap-4 w-full">
                <button onClick={handleRetry} className="buttonSecondary">
                    Try again
                </button>
                <button onClick={handleNext} className="button">
                    Next One
                </button>
            </div>)}
        </div>
    </ProtectedRoute>);
}

export default function CounterPage() {
    return (<Suspense fallback={<LoadingScreen/>}>
        <CounterPageContent/>
    </Suspense>);
}