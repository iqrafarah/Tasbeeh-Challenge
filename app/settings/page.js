"use client";
import React from "react";
import Link from "next/link";

export default function SettingsPage() {
    return (
        <div
                  >
            {/* Close Button */}
            <div className="p-4">
                <Link href="/profile">
                    <i className="fa-solid fa-chevron-left text-lg cursor-pointer"></i>
                </Link>
            </div>

            <h1 className="title px-4">Settings</h1>

            <div className="mt-5 px-4">
                {/* Upgrade to Pro Section */}
                <div className="border flex items-center justify-between px-4 py-3 rounded-xl">
                    <div className="flex gap-3">
                        <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-[#949CD0] overflow-hidden">
                            <i className="fa-solid fa-crown text-2xl"></i>
                        </div>
                        <div className="flex gap-1 flex-col">
                            <h3 className="text-[15px] font-semibold capitalize">Upgrade to pro</h3>
                            <p className="text-xs text-gray-500">to use the app</p>
                        </div>
                    </div>
                    <div>
                        <i className="fa-solid fa-chevron-right text-sm"></i>
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="mt-6">
                    <h4 className="uppercase text-gray-600 text-sm">Feedback</h4>
                    <div className="mt-3 border flex items-center justify-between px-4 py-3 rounded-xl">
                        <div className="flex gap-3">
                            <div className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
                                <i className="fa-solid fa-crown text-2xl text-gray-500"></i>
                            </div>
                            <div className="flex gap-1 flex-col">
                                <h3 className="text-[15px] font-semibold capitalize">Join Discord</h3>
                                <p className="text-xs text-gray-500">Connect with the team!</p>
                            </div>
                        </div>
                        <div>
                            <i className="fa-solid fa-chevron-right text-sm"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}