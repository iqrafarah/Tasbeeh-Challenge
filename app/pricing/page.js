"use client";
import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import app from "../lib/firebase.config";
import { userService } from "../lib/services/userService";
import LoadingScreen from "../components/loadingScreen";
import ProtectedRoute from "../components/protectedRoute";
import Link from "next/link";
import TrialEndModal from "../components/trialEnded";

export default function PricingPage() {
    const auth = getAuth(app);
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
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
                console.log(data);  

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
        });

        return () => unsubscribe();
    }, [auth, router]);

    const openCheckout = (planType) => {
        setProcessingPayment(true);

        const urls = {
            monthly: 'https://shop-buildwithiqra.lemonsqueezy.com/buy/a9a111d9-119c-4478-a343-c17df5fdd8fe',
            lifetime: 'https://shop-buildwithiqra.lemonsqueezy.com/buy/df6dcae4-0f15-4016-a481-c199ee13d564'
        };

        const url = urls[planType];
        if (!url) {
            console.error("Invalid plan type");
            setProcessingPayment(false);
            return;
        }

        setCheckoutUrl(url);
        setProcessingPayment(false);
    };

    const getSubscriptionInfo = () => {
        if (!userData || !userData.subscription) return { status: "Free", daysLeft: 0 };

        const { status, trialEndDate } = userData.subscription;

        if (status === "trial") {
            const endDate = trialEndDate instanceof Date ? trialEndDate : trialEndDate.toDate();
            const daysLeft = Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)));
            return { status: "Trial", daysLeft };
        } else if (status === "monthly") {
            return { status: "Premium Monthly" };
        } else if (status === "lifetime") {
            return { status: "Premium Lifetime" };
        } else {
            return { status: "Free" };
        }
    };

    const subscriptionInfo = userData?.subscription ? getSubscriptionInfo() : { status: "Free", daysLeft: 0 };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <ProtectedRoute>
            <div className="h-screen flex flex-col overflow-y-auto pb-[130px]">
                <div className="flex items-center mb-6">
                    <Link href="/profile">
                        <i className="fa-solid fa-arrow-left text-2xl cursor-pointer mr-4"></i>
                    </Link>
                    <h1 className="title">Choose Your Plan</h1>
                </div>

                {/* Current Plan Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 shadow-sm">
                    <h3 className="font-medium mb-1">Current Plan: {subscriptionInfo.status}</h3>
                    {subscriptionInfo.status === "Trial" && (
                        <>
                            <p className="text-sm text-gray-600 mb-2">
                                Your trial ends in {subscriptionInfo.daysLeft} days
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${100 - (subscriptionInfo.daysLeft / 7) * 100}%` }}
                                ></div>
                            </div>
                        </>
                    )}
                </div>

                {/* Plans */}
                <div className="grid gap-6">
                    {/* Monthly Plan */}
                    <div className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold">Monthly Premium</h2>
                                <p className="text-gray-600">Perfect for ongoing spiritual growth</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">$3.99</p>
                                <p className="text-gray-500">per month</p>
                            </div>
                        </div>

                        <ul className="space-y-2 mb-5">
                            <li className="flex items-center">
                                <i className="fa-solid fa-check text-green-500 mr-2"></i>
                                <span>Unlimited access to all features</span>
                            </li>
                            <li className="flex items-center">
                                <i className="fa-solid fa-check text-green-500 mr-2"></i>
                                <span>Premium dhikr content</span>
                            </li>
                            <li className="flex items-center">
                                <i className="fa-solid fa-check text-green-500 mr-2"></i>
                                <span>Advanced progress tracking</span>
                            </li>
                            <li className="flex items-center">
                                <i className="fa-solid fa-check text-green-500 mr-2"></i>
                                <span>Cancel anytime</span>
                            </li>
                        </ul>

                        <button
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
                            onClick={() => openCheckout('monthly')}
                            disabled={processingPayment || subscriptionInfo.status === "Premium Monthly"}
                        >
                            {subscriptionInfo.status === "Premium Monthly" ? "Current Plan" : "Select Monthly Plan"}
                        </button>
                    </div>

                    {/* Lifetime Plan */}
                    <div className="border-2 border-blue-500 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow relative">
                        <div className="absolute -top-3 -right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Best Value
                        </div>

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold">Lifetime Access</h2>
                                <p className="text-gray-600">One-time payment, forever access</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">$29.99</p>
                                <p className="text-green-600 font-medium">Save over 80%</p>
                            </div>
                        </div>

                        <ul className="space-y-2 mb-5">
                            <li className="flex items-center">
                                <i className="fa-solid fa-check text-green-500 mr-2"></i>
                                <span>Everything in monthly plan</span>
                            </li>
                            <li className="flex items-center">
                                <i className="fa-solid fa-check text-green-500 mr-2"></i>
                                <span>No recurring payments</span>
                            </li>
                            <li className="flex items-center">
                                <i className="fa-solid fa-check text-green-500 mr-2"></i>
                                <span>All future updates included</span>
                            </li>
                            <li className="flex items-center">
                                <i className="fa-solid fa-check text-green-500 mr-2"></i>
                                <span>Founder supporter badge</span>
                            </li>
                        </ul>

                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
                            onClick={() => openCheckout('lifetime')}
                            disabled={processingPayment || subscriptionInfo.status === "Premium Lifetime"}
                        >
                            {subscriptionInfo.status === "Premium Lifetime" ? "Current Plan" : "Get Lifetime Access"}
                        </button>
                    </div>
                </div>

                <div className="text-center text-gray-500 text-sm mt-6">
                    <p>Secure payment via Lemon Squeezy</p>
                    <p className="mt-1">100% satisfaction guarantee. Cancel anytime.</p>
                </div>

                {checkoutUrl && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg overflow-hidden w-full max-w-3xl shadow-lg relative">
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
        </ProtectedRoute>
    );
}