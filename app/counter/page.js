"use client";
import React, { useState, useEffect, Suspense, useRef } from "react";
import CircleProgressBar from "../components/circleProgressBar";
import { challengeService } from "../lib/services/challengeService";
import { useSearchParams, useRouter } from "next/navigation";
import app from "../lib/firebase.config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { userService } from "../lib/services/userService";
import ProtectedRoute from "../components/protectedRoute";
import Confetti from "react-confetti";
import LevelUpModal from "../components/newLevelModal";
import Link from "next/link"; // Import Link component

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
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 0
  );
  const [levelUpModalVisible, setLevelUpModalVisible] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true); // State to manage sound toggle
  const [visualFeedback, setVisualFeedback] = useState(false); // State to manage visual feedback
  const [showTooltip, setShowTooltip] = useState(false); // State for the tooltip visibility
  const tooltipRef = useRef(null); // Ref for the tooltip
  const [initialRender, setInitialRender] = useState(true); // State to track initial render

  // Load sound setting from localStorage
  useEffect(() => {
    const savedSoundSetting = localStorage.getItem("soundEnabled");
    if (savedSoundSetting !== null) {
      setSoundEnabled(JSON.parse(savedSoundSetting));
    }
  }, []);

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
        const selectedChallenge = allChallenges.find(
          (ch) => ch.id === challengeId
        );
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
          const userChallenge = await challengeService.getUserChallenge(
            user.uid,
            challengeId
          );
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
    if (challenge && count >= challenge.requiredCount && !completed) {
      setCompleted(true);
    }
  }, [count, challenge, completed]);

  // Debounced save challenge function
  const debouncedSaveChallenge = debounce(
    async (userId, challengeId, count) => {
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
    },
    1000
  ); // Adjust the delay as needed

  // Save challenge progress
  useEffect(() => {
    if (user && challengeId) {
      // Always save the current count, even if it's zero
      debouncedSaveChallenge(user.uid, challengeId, count);
    }
  }, [count, user, challengeId]);

  const handleClick = async (event) => {
    // Prevent counting a tap when toggling the sound or clicking the tooltip
    if (
      event.target.closest(".sound-toggle") ||
      event.target.closest(".tooltip-toggle") ||
      event.target.closest(".tooltip-content")
    )
      return;

    if (completed) return;

    if (showTapInstruction) {
      setShowTapInstruction(false); // Hide the instruction after the first tap
    }

    if (soundEnabled) {
      const audio = new Audio("/tapSound2.mp4");
      audio.play();
    }

    setVisualFeedback(true); // Show visual feedback
    setTimeout(() => setVisualFeedback(false), 200); // Hide visual feedback after 200ms

    setCount((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount >= challenge.requiredCount) {
        updateUserStats(user.uid, challenge.points);
      }
      return newCount;
    });

    userService.updateTotalDhikr(user.uid, +1);
  };

  const handleRetry = () => {
    setCount(0);
    setCompleted(false);

    // Explicitly save the zero count to database when resetting
    if (user && challengeId) {
      challengeService.saveChallenge({
        userId: user.uid,
        challengeId: challengeId,
        count: 0,
      });
    }
  };

  const handleDecrease = async (e) => {
    e.stopPropagation();

    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);

      if (user) {
        try {
          // Update the challenge progress in the database
          await challengeService.saveChallenge({
            userId: user.uid,
            challengeId: challengeId,
            count: newCount,
          });

          // Decrease total dhikr count in the database using the updateTotalDhikr function
          await userService.updateTotalDhikr(user.uid, -1); // Decrement by 1
        } catch (error) {
          console.error(
            "Error updating challenge or total dhikr count in database:",
            error
          );
        }
      }
    }
  };

  const toggleSound = (e) => {
    e.stopPropagation(); // Prevent event propagation
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem("soundEnabled", JSON.stringify(newSoundEnabled));
  };

  const toggleTooltip = (e) => {
    e.stopPropagation(); // Prevent event propagation
    setShowTooltip(!showTooltip);
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showTooltip]);

  const percentage = challenge ? (count / challenge.requiredCount) * 100 : 0;

  const handleNextChallenge = () => {
    const currentIndex = challenges.findIndex((ch) => ch.id === challengeId);
    const nextChallenge = challenges[(currentIndex + 1) % challenges.length];
    router.push(`/counter?id=${nextChallenge.id}`);
  };

  return (
    <ProtectedRoute>
      <div
        className="flex flex-col items-center min-h-fit bg-white p-4 cursor-pointer relative"
        onClick={handleClick}
      >
        {/* Sound and Help Toggle */}
        {!completed && (
          <div className="absolute top-5 right-4 flex items-center gap-6 z-30">
            <div className="tooltip-toggle relative" onClick={toggleTooltip}>
              <i className="fa-solid fa-lightbulb text-xl cursor-pointer"></i>
            </div>

            <div className="sound-toggle" onClick={toggleSound}>
              {soundEnabled ? (
                <i className="fa-solid fa-volume-high text-xl cursor-pointer"></i>
              ) : (
                <i className="fa-solid fa-volume-xmark text-xl cursor-pointer"></i>
              )}
            </div>
          </div>
        )}

        {/* Centered Tooltip */}
        {showTooltip && (
          <div
            className="absolute top-[75%] flex items-center justify-center z-40"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
          >
            <div
              className="border border-[#d8d8f2] rounded-lg bg-[#d8d8f2] w-80 p-4 m-4"
              onClick={(e) => e.stopPropagation()}
              ref={tooltipRef}
            >
              <h1 className="small_title mb-1">Benefits</h1>
              <p className="text-sm">{challenge?.whenToUse}</p>
            </div>
          </div>
        )}

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
            colors={[
              "#f6f2c0",
              "#c4e3f2",
              "#c4f8c3",
              "#f2c4c4",
              "#e8c4f2",
              "#f2d4c4",
            ]}
          />
        )}

        <div className="flex-1 flex flex-col align-center justify-start w-full">
          {completed ? (
            <>
              <h3 className="title text-center">Ma Sha Allah 🎉</h3>
              <p className="mt-3 text-sm text-center">
                You have completed this challenge!
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold w-[75%] text-left">
                {challenge?.title}
              </h3>
              <p>{challenge?.arabic}</p>
            </>
          )}
        </div>
        {challenge && (
          <div className="counter">
            <div className="mx-auto w-72 h-72 flex items-center justify-center relative">
              <CircleProgressBar
                completed={percentage}
                bgcolor="#000"
                baseBgColor="#E5E5E5"
                size={250}
                strokeWidth={12}
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center justify-center">
                  <span
                    className={`count ${visualFeedback ? "animate-pulse" : ""}`}
                  >
                    {count}
                  </span>
                  <span className="text-lg ml-1 font-semibold">
                    {completed
                      ? "Completed!"
                      : `total ${challenge?.requiredCount}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center mt-6 pb-6 gap-6 z-45">
              {completed ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetry();
                    }}
                    className="flex align-center bg-[lightgray] px-5 py-5 rounded-full h-fit pointer-events-auto  text-lg"
                  >
                    <i className="fa-solid fa-arrows-rotate text-black text-xl"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextChallenge();
                    }}
                    className="flex align-center bg-black px-5 py-5 rounded-full h-fit pointer-events-auto  text-lg"
                  >
                    <i className="fa-solid fa-arrow-right text-white text-xl"></i>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDecrease}
                    className="flex align-center bg-[lightgray] px-5 py-5 rounded-full h-fit pointer-events-auto  text-lg"
                  >
                    <i className="fa-solid fa-rotate-left text-xl"></i>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetry();
                    }}
                    className="flex align-center bg-black px-5 py-5 rounded-full h-fit pointer-events-auto  text-lg"
                  >
                    <i className="fa-solid fa-arrows-rotate text-xl text-white"></i>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function CounterPage() {
  return (
    <Suspense>
      <CounterPageContent />
    </Suspense>
  );
}
