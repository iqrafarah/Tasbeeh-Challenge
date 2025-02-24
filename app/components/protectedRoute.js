"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import LoadingScreen from "./loadingScreen";
import TrialEndModal from "./trialEnded";
import { userService } from "../lib/services/userService";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTrialEnded, setIsTrialEnded] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push("/");
      } else {
        setUser(authUser);
        try {
          const data = await userService.getUser(authUser.uid);
          setUserData(data);

          // Check if trial has ended
          if (data.subscription.status === "trial") {
            const trialEndDate = data.subscription.trialEndDate.toDate();
            if (new Date() > trialEndDate) {
              setIsTrialEnded(true);
            }
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (isTrialEnded) {
    return <TrialEndModal isOpen={true} onClose={() => setIsTrialEnded(false)} />;
  }

  return children;
}