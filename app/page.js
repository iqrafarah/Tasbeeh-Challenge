"use client";
import { useState, useEffect } from "react";
import app from "./lib/firebase.config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { authService } from "./lib/services/authService";
import { userService } from "./lib/services/userService";
import { useRouter } from "next/navigation";
import ProfileScreen from "./profile/page";
import LoadingScreen from "./components/loadingScreen";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        router.push("/profile");
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignIn = async () => {
    try {
      const result = await authService.signInWithGoogle();
      if (result?.user) {
        await userService.saveUser(result.user);
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      {user ? (
        <ProfileScreen user={user} />
      ) : (
        <div className="container text-center flex flex-col">
          <div className="h-[50vh] flex flex-col items-center justify-center gap-3">
            <Image
              src="/icon.png"
              alt="icon"
              width={100}
              height={100}
              className="w-[60px] h-[60px] object-cover rounded-lg"
            />
            <h1 className="title">Tasbeeh Challenge</h1>
          </div>
          <div className="h-[50vh] flex flex-col justify-between">
            <div className="flex flex-col gap-3">
              <p className="text-sm">Choose how to continue</p>
              <button
                onClick={handleSignIn}
                className="flex items-center justify-center gap-3 button"
              >
                <Image
                  src="google-icon.svg"
                  alt="google icon"
                  width={20}
                  height={20}
                />
                Continue with Google
              </button>
            </div>

            <p className="text-xs">
              By continuing you agree to our{" "}
              <Link href="#" className="font-semibold underline">
                Terms of Service
              </Link>
              and Privacy
              <Link href="#" className="font-semibold underline">
                Policy
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
