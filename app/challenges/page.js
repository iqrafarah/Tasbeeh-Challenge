"use client";
import { useState, useEffect } from "react";
import { challengeService } from "../lib/services/challengeService";
import { userService } from "../lib/services/userService";
import ProtectedRoute from "../components/protectedRoute";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../lib/firebase.config";
import TrialEndModal from "../components/trialEnded";
import InstallAppModal from "../components/installApp"; // Import the InstallAppModal component

const baseColors = [
  { hex: "#f6f2c0" },
  { hex: "#c4e3f2" },
  { hex: "#c4f8c3" },
  { hex: "#f2c4c4" },
  { hex: "#e8c4f2" },
  { hex: "#f2d4c4" },
  { hex: "#d4f2ef" },
  { hex: "#f2c4e3" },
  { hex: "#d8d8f2" },
  { hex: "#f2e8c4" },
];

// Function to get color based on index
const getColorForIndex = (index) => baseColors[index % baseColors.length].hex;

// Utility function to darken a hex color
const darkenHexColor = (hex, amount) => {
  let color = hex.slice(1);
  let num = parseInt(color, 16);
  let r = (num >> 16) - amount;
  let g = ((num >> 8) & 0x00ff) - amount;
  let b = (num & 0x0000ff) - amount;
  r = r < 0 ? 0 : r;
  g = g < 0 ? 0 : g;
  b = b < 0 ? 0 : b;
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
};

export default function ChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isTrialEnded, setIsTrialEnded] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null); // State to store the deferred prompt
  const [showInstallModal, setShowInstallModal] = useState(false); // State to show/hide install modal
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
      if (challenges.length === 0) {
        return;
      }

      const progress = await Promise.all(
        challenges.map(async (challenge) => {
          const userChallenge = await challengeService.getUserChallenge(uid, challenge.id);
          return { [challenge.id]: userChallenge ? userChallenge.count : 0 };
        })
      );

      setUserProgress(progress.reduce((acc, curr) => ({ ...acc, ...curr }), {}));
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  };

  // Handle user authentication and subscription status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push("/");
        return;
      }

      setUser(authUser);
      try {
        const data = await userService.getUser(authUser.uid);
        setUserData(data);

        if (data && data.subscription) {
          if (data.subscription.status === "trial" || data.subscription.status === "free") {
            const trialEndDate = data.subscription.trialEndDate.toDate();
            if (new Date() > trialEndDate) {
              setIsTrialEnded(true);
            } else {
              setIsTrialEnded(false);
            }
          } else {
            setIsTrialEnded(false);
          }
        } else {
          setIsTrialEnded(false);
        }

        if (challenges.length === 0) {
          await loadChallenges();
        }

        fetchUserProgress(authUser.uid);

        // Show install modal if user is new
        if (data && data.onBoarded === false) {
          setShowInstallModal(true);
          await userService.updateUser(authUser.uid, { onBoarded: true });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  // Fetch user progress when challenges are loaded
  useEffect(() => {
    if (user && challenges.length > 0) {
      fetchUserProgress(user.uid);
    }
  }, [user, challenges]);

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      setDeferredPrompt(null);
      setShowInstallModal(false);
    }
  };

  const handleChallengeClick = (challenge) => {
    router.push(`/counter?id=${challenge.id}`);
  };

  return (
    <ProtectedRoute showTrialEndModal={true}>
      <div className="">
        <h1 className="title sticky top-0 pb-4">Challenges</h1>
        <div className="min-h-screen overflow-y-auto">
          <div className="h-[calc(100vh-160px)]">
            <div className="mt-4 flex flex-col gap-4 pb-4 pb-[200px]">
              {challenges.map((challenge, index) => {
                const count = userProgress[challenge.id] || 0;
                const requiredCount = challenge.requiredCount || 1; // Prevent division by zero
                const percentage = ((count / requiredCount) * 100).toFixed(0);
                const isStarted = count > 0;
                const backgroundColor = getColorForIndex(index);
                const darkenedColor = darkenHexColor(backgroundColor, 30);

                return (
                  <div
                    key={challenge.id}
                    className="cursor-pointer flex flex-col justify-between gap-4 min-h-[190px] p-4 rounded-xl"
                    style={{ backgroundColor }}
                    onClick={() => handleChallengeClick(challenge)}
                  >
                    <div>
                      <h3 className="text-lg font-bold">{challenge.title}</h3>
                      <p className="text-sm my-1">{challenge.arabic}</p>
                      <p className="text-sm mb-1">{challenge.meaning}</p>
                      <p className="text-xs font-semibold">
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="border-2 text-black font-semibold px-3 text-xs py-1 h-fit rounded-full"
                          style={{ borderColor: darkenedColor, backgroundColor: darkenedColor }}
                        >
                          <i className="fas fa-praying-hands"></i> {challenge.requiredCount} Times
                        </span>
                        <span
                          className="border-2 bg-black text-black font-semibold px-3 text-xs py-1 h-fit rounded-full"
                          style={{ borderColor: darkenedColor, backgroundColor: darkenedColor }}
                        >
                          <i className="fas fa-coins"></i> {challenge.points}
                        </span>
                      </div>
                      {isStarted ? (
                        <span className="text-2xl font-black">{percentage}%</span>
                      ) : (
                        <span className="text-2xl font-black">Start</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <InstallAppModal
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
          onInstall={handleInstallClick}
        />
      </div>

      {/* Trial Ended Modal */}
      {isTrialEnded && <TrialEndModal isOpen={isTrialEnded} onClose={() => setIsTrialEnded(false)} />}
    </ProtectedRoute>
  );
}