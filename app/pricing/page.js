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
import Image from "next/image";

export default function PricingPage() {
    const auth = getAuth(app);
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [checkoutUrl, setCheckoutUrl] = useState(null);
    const [isTrialEnded, setIsTrialEnded] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('lifetime'); // Default to lifetime plan

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
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth, router]);

    const openCheckout = () => {
        setProcessingPayment(true);

        const urls = {
            monthly: 'https://tasbeehchallenge.lemonsqueezy.com/buy/a9a111d9-119c-4478-a343-c17df5fdd8fe',
            lifetime: 'https://tasbeehchallenge.lemonsqueezy.com/buy/df6dcae4-0f15-4016-a481-c199ee13d564'
        };

        const url = urls[selectedPlan];
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
                <div className="    ">
                    <Link href="/profile">
                        <i className="fa-solid fa-chevron-left text-lg cursor-pointer mr-4"></i>
                    </Link>
                    
                    {/* Trial Notice */}
                    {subscriptionInfo.status === "Trial" && (
                        <div className="bg-gray-100 rounded-lg p-4 my-4 flex items-center">
                            <i className="fa-solid fa-circle-check text-bklack mr-3 text-lg"></i>
                            <div className="text-sm">
                                <p>Your free trial expires in <b>{subscriptionInfo.daysLeft} days</b></p>
                                <p className="text-black font-medium text-xs">Upgrade now to commit to your goals</p>
                            </div>
                        </div>
                    )}

                    {/* Main message */}
                    <div className="text-center my-6">
                        <h2 className="text-2xl font-bold mb-1">Beat procrastination.</h2>
                        <h2 className="text-2xl font-bold mb-4">Achieve your goals.</h2>
                        
                        <div className="flex justify-center text-yellow-400 mb-2">
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                        </div>

                        <div className="flex items-center justify-center mb-6">
                            <div className="flex -space-x-2">
                                <Image src="/icon.png" width={40} height={40} className="w-[40px] h-[40px] object-cover rounded-full border-2 border-white" alt="User" />
                                <Image src="/icon.png" width={40} height={40} className="w-[40px] h-[40px] object-cover rounded-full border-2 border-white" alt="User" />
                                <Image src="/icon.png" width={40} height={40} className="w-[40px] h-[40px] object-cover rounded-full border-2 border-white" alt="User" />
                                <Image src="/icon.png" width={40} height={40} className="w-[40px] h-[40px] object-cover rounded-full border-2 border-white" alt="User" />
                            </div>
                        </div>

                        <p className="mb-4 text-xs">
                            <span className="font-bold">4.8/5</span> from 23,000+ achievers
                        </p>
                        
                        <h3 className="text-xl font-bold mt-6 mb-1">Building lasting habits is hard</h3>
                        <p className="text-gray-600 text-sm">80% of New Year's resolutions fail in 2 months...</p>
                    </div>

                    {/* Pricing Plans */}
                    <div className="space-y-4 mt-8">
                        {/* Monthly Plan */}
                        <label className={`block border rounded-lg p-4 cursor-pointer transition-all ${selectedPlan === 'monthly' ? 'border-[#949CD0] bg-[#d8d8f2] shadow-md' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="plan"
                                        value="monthly"
                                        checked={selectedPlan === 'monthly'}
                                        onChange={() => setSelectedPlan('monthly')}
                                        className="mr-3 h-5 w-5 accent-blue-500"
                                    />
                                    <div>
                                        <h3 className="text-sm font-medium">Monthly</h3>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">$3.99/month</p>
                                </div>
                            </div>
                        </label>

                        {/* Lifetime Plan */}
                        <label className={`block border rounded-lg p-4 cursor-pointer transition-all ${selectedPlan === 'lifetime' ? 'border-[#949CD0] bg-[#d8d8f2] shadow-md' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="plan"
                                        value="lifetime"
                                        checked={selectedPlan === 'lifetime'}
                                        onChange={() => setSelectedPlan('lifetime')}
                                        className="mr-3 h-5 w-5 accent-blue-500"
                                    />
                                    <div>
                                        <h3 className="text-sm font-medium">Pay once, yours forever</h3>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">$29.99</p>
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* CTA Button */}
                    <button
                        className="button mt-6 py-4 "
                        onClick={openCheckout}
                        disabled={processingPayment || 
                            (selectedPlan === 'monthly' && subscriptionInfo.status === "Premium Monthly") || 
                            (selectedPlan === 'lifetime' && subscriptionInfo.status === "Premium Lifetime")}
                    >
                        {processingPayment ? (
                            "Processing..."
                        ) : (
                            <>
                                UPGRADE & GET ACCESS 
                            </>
                        )}
                    </button>

                    <div className="text-xs text-center text-gray-500 text-sm mt-4">
                        <p>Secure payment via Lemon Squeezy</p>
                        <p className="mt-1">100% satisfaction guarantee</p>
                    </div>

                    {/* Checkout Modal */}
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
            </div>
        </ProtectedRoute>
    );
}