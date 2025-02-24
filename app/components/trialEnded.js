import React from "react";
import Link from "next/link";

export default function TrialEndModal({ isOpen, onClose }) {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                <div className="text-center mb-6">
                    <div className="bg-blue-100 text-blue-800 rounded-full p-3 inline-block mb-4">
                        <i className="fa-solid fa-hourglass-end text-2xl"></i>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Your free trial has ended</h2>
                    <p className="text-gray-600">
                        Continue your spiritual journey by upgrading to a premium plan today.
                    </p>
                </div>
                
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between border-b pb-2">
                        <span>Monthly Premium</span>
                        <span className="font-medium">$3.99/month</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">Lifetime Access</span>
                        <span className="font-medium">$29.99 (one-time)</span>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <Link href="/pricing">
                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
                            onClick={onClose}
                        >
                            View Plans
                        </button>
                    </Link>
                </div>
                
                <p className="text-center text-xs text-gray-500 mt-4">
                    You can continue using basic features with the free plan
                </p>
            </div>
        </div>
    );
}