import React from "react";
import Link from "next/link";

export default function TrialEndModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                <div className="text-center mb-6">
                    <div className="bg-[#d8d8f2] text-[#949CD0] rounded-full p-3 inline-block mb-4">
                        <i className="fa-solid fa-hourglass-end text-2xl"></i>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Your free trial has ended</h2>
                    <p className="text-gray-600">
                        Continue your spiritual journey by upgrading to a premium plan today.
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    <label className="block border rounded-lg p-4 cursor-pointer transition-all border-gray-200">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div>
                                    <h3 className="text-sm font-medium">Monthly Premium</h3>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">$3.99/month</p>
                            </div>
                        </div>
                    </label>

                    <label className="block border rounded-lg p-4 cursor-pointer transition-all border-gray-200">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div>
                                    <h3 className="text-sm font-medium">Lifetime Access</h3>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">$29.99 (one-time)</p>
                            </div>
                        </div>
                    </label>
                </div>

                <div className="space-y-3">
                    <Link href="/pricing">
                        <button
                            className="button py-4 "
                            onClick={onClose}
                        >
                            View Plans
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}