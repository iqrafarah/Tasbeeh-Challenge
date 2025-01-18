"use client";
import { useState, useEffect } from "react";
import app from "../firebase.config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import deviceCheck from "./hooks/deviceCheck";
import ProfileScreen from "./profile/page";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isMobile = deviceCheck();

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signinWithGoogle = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithRedirect(auth, provider);
      router.push("/profile");
    } catch (error) {
      console.error("Error signing in with Google", error.message);
    }
  };

  if (loading) {
    return <span className="loader"></span>;
  }

  return (
    <div>
      {isMobile ? (
        user ? (
          <ProfileScreen user={user} />
        ) : (
          <div className="container text-center flex flex-col justify-between">
            <div className="min-h-[45vh]">
              <h1 className="title">Welcome</h1>
              <p>Tasbeeh Challengee</p>
            </div>
            <div className="min-h-[45vh] flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <p className="">Choose how to continue</p>
                <button
                  onClick={signinWithGoogle}
                  className="flex items-center gap-3 button"
                >
                  <Image
                    src="google-icon.svg"
                    alt="google icon"
                    width={20}
                    height={20}
                    className="ml-4"
                  />
                  Sign in with Google
                </button>
                <button className="buttonSecondary">
                  Sign in with Hotmail
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
        )
      ) : (
        <p>It only works for mobile devices</p>
      )}
    </div>
  );
}
