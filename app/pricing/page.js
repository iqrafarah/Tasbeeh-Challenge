"use client";
import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import app from "../lib/firebase.config";
import { userService } from "../lib/services/userService";
import ProtectedRoute from "../components/protectedRoute";
import Link from "next/link";
import TrialEndModal from "../components/trialEnded";
import Image from "next/image";

export default function PricingPage() {
  const auth = getAuth(app);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [isTrialEnded, setIsTrialEnded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push("/"); // Redirect to home if not authenticated
        return;
      }

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
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const openCheckout = () => {
    setProcessingPayment(true);

    const url =
      "https://tasbeehchallenge.lemonsqueezy.com/buy/df6dcae4-0f15-4016-a481-c199ee13d564";

    if (!url) {
      console.error("Invalid checkout URL");
      setProcessingPayment(false);
      return;
    }

    setCheckoutUrl(url);
    setProcessingPayment(false);
  };

  const getSubscriptionInfo = () => {
    if (!userData || !userData.subscription)
      return { status: "Free", daysLeft: 0 };

    const { status, trialEndDate } = userData.subscription;

    if (status === "trial") {
      const endDate =
        trialEndDate instanceof Date ? trialEndDate : trialEndDate.toDate();
      const daysLeft = Math.max(
        0,
        Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))
      );
      return { status: "Trial", daysLeft };
    } else if (status === "lifetime") {
      return { status: "Premium Lifetime" };
    } else {
      return { status: "Free" };
    }
  };

  const subscriptionInfo = userData?.subscription
    ? getSubscriptionInfo()
    : { status: "Free", daysLeft: 0 };

  return (
    <ProtectedRoute>
      <div className="pricing h-screen flex flex-col overflow-y-auto pb-[30px]">
        <div className="    ">
          <Link href="/profile">
            <i className="fa-solid fa-chevron-left text-lg cursor-pointer mr-4"></i>
          </Link>

          {/* Testimonials */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-lightgray rounded-lg p-4">
              <div className="flex items-center">
                <Image
                  src="/ahmar.jpg"
                  alt="Upgrade to premium"
                  width={300}
                  height={300}
                  className="rounded-full w-[35px] h-[35px] object-cover  mr-2"
                />
                <span className="text-xs font-semibold">Ahmar Ali Khan</span>
              </div>

              <p className="text-[10px] mt-2">
                Awesome, i found this in the month of Ramadan.{" "}
              </p>

              <div className="flex  text-xs text-[#949CD0] text-left mt-2">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
            </div>
            <div className="bg-lightgray rounded-lg p-4">
              <div className="flex items-center">
                <Image
                  src="/jay.jpg"
                  alt="Upgrade to premium"
                  width={300}
                  height={300}
                  className="rounded-full w-[35px] h-[35px] object-cover  mr-2"
                />
                <span className="text-xs font-semibold">Jay Jihane</span>
              </div>

              <p className="text-[10px] mt-2">
                Beautiful idea! May Allah bless your work :)
              </p>

              <div className="flex  text-xs text-[#949CD0] text-left mt-2">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
            </div>
            <div className="bg-lightgray rounded-lg p-4">
              <div className="flex items-center">
                <Image
                  src="/jawad.jpg"
                  alt="Upgrade to premium"
                  width={300}
                  height={300}
                  className="rounded-full w-[35px] h-[35px] object-cover  mr-2"
                />
                <span className="text-xs font-semibold">Jawad Binazam</span>
              </div>

              <p className="text-[10px] mt-2">
                This app helps me stay consistent with my Dhikr. I’ll be sharing
                it with my mom and sister
              </p>

              <div className="flex  text-xs text-[#949CD0] text-left mt-2">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
            </div>
            <div className="bg-lightgray rounded-lg p-4">
              <div className="flex items-center">
                <Image
                  src="/shugri.png"
                  alt="Upgrade to premium"
                  width={300}
                  height={300}
                  className="rounded-full w-[35px] h-[35px] object-cover  mr-2"
                />
                <span className="text-xs font-semibold">Shugri</span>
              </div>

              <p className="text-[10px] mt-2">
                Loving this app! It’s super easy to use, and it keeps me on
                track with my Dhikr{" "}
              </p>

              <div className="flex  text-xs text-[#949CD0] text-left mt-2">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
            </div>
          </div>

          {/* Main message */}
          <div className="text-center my-6 mt-8">
            <h2 className="text-xl font-semibold my-3">
              Keep track of your DHIKR
            </h2>

            <div className="flex flex-col justify-start gap-2">
              <p className="text-left flex items-center font-medium">
                <i className="fa-solid fa-circle-check text-[#949CD0] mr-2"></i>
                <span className="text-sm">
                  Track your streaks, levels, and daily achievements
                </span>
              </p>
              <p className="text-left flex items-center font-medium">
                <i className="fa-solid fa-circle-check text-[#949CD0] mr-2"></i>
                <span className="text-sm">
                  View detailed analytics of your completed challenges
                </span>
              </p>

              <p className="text-left flex items-center font-medium">
                <i className="fa-solid fa-circle-check text-[#949CD0] mr-2"></i>
                <span className="text-sm">
                  Check your daily total Dhikr and monitor progress
                </span>
              </p>
              <p className="text-left flex items-center font-medium">
                <i className="fa-solid fa-circle-check text-[#949CD0] mr-2"></i>
                <span className="text-sm">
                  Compete with the top 20 worldwide and your friends on the
                  leaderboard
                </span>
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            className="button mt-6 py-4  text-sm"
            onClick={openCheckout}
            disabled={
              processingPayment ||
              subscriptionInfo.status === "Premium Lifetime"
            }
          >
            {processingPayment ? (
              "Processing..."
            ) : (
              <>$5.99 UPGRADE & LEVEL UP YOUR DHIKR 🌙</>
            )}
          </button>

          <div className="text-xs text-center text-gray-500 text-sm mt-4">
            <p>Secure payment via Lemon Squeezy</p>
            <p className="mt-1">100% satisfaction guarantee</p>
          </div>

          {/* Checkout Modal */}
          {checkoutUrl && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white overflow-hidden w-full max-w-3xl shadow-lg relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setCheckoutUrl(null)}
                >
                  <i className="fa-solid fa-times text-2xl"></i>
                </button>
                <iframe
                  src={checkoutUrl}
                  className="w-full h-[100vh] border-none"
                  frameBorder="0"
                  allow="payment"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
