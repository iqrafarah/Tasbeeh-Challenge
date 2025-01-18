"use client";
import { useState, useEffect } from "react";
import app from "../firebase.config";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import ProfileScreen from "./profile/page";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);

    // Handle redirect result first
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          router.push("/profile");
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result:", error);
      });

    // Then set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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

  const signinWithGoogle = async () => {
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (result?.user) {
        setUser(result.user);
        await router.replace("/profile"); // Use replace instead of push
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      if (error.code === "auth/popup-blocked") {
        // Fall back to redirect method
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          console.error("Redirect error:", redirectError);
        }
      }
    }
  };

  useEffect(() => {
    const auth = getAuth(app);

    // Handle redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          router.replace("/profile");
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result:", error);
      });

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        router.replace("/profile");
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const auth = getAuth(app);
    // Check if the user was redirected after login
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          setUser(result.user);
          router.push("/profile"); // Redirect to profile after successful login
        }
      } catch (error) {
        console.error("Error getting redirect result: ", error.message);
      }
    };

    checkRedirectResult();
  }, [router]);

  if (loading) {
    return (
      <div className="container text-center flex flex-col items-center justify-center h-screen gap-3">
        <Image
          src="/icon.png"
          alt="icon"
          width={100}
          height={100}
          className="w-[60px] h-[60px] object-cover rounded-lg"
        />
        <h1 className="title">Tasbeeh Challenge</h1>
      </div>
    );
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
                onClick={signinWithGoogle}
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
