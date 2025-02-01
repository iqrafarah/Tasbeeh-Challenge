"use client";
import React from "react";
import Link from "next/link";

export default function SettingsPage() {
    return (
        <div className="overflow-y-auto pb-[130px]">
            {/* Close Button */}
            <div className="pb-3">
                <Link href="/profile">
                    <i className="fa-solid fa-chevron-left text-lg cursor-pointer"></i>
                </Link>
            </div>

            <h1 className="title">Settings</h1>

            <div className="mt-5">
                {/* Upgrade to Pro Section */}
                <div className="border border-[#d8d8f2] flex items-center justify-between px-4 py-3 rounded-xl bg-[#d8d8f2]">
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
                    <h4 className="uppercase text-gray-600 text-sm font-medium">Feedback</h4>
                    <div className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl">
                        <div className="flex gap-3">
                            <div
                                className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
                                <i className="fa-brands fa-discord text-xl "></i>
                            </div>
                            <div className="flex gap-1 flex-col">
                                <h3 className="text-[15px] font-semibold capitalize">Join Discord</h3>
                                <p className="text-xs text-gray-500">Connect with the team!</p>
                            </div>
                        </div>
                        <div>
                            <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
                        </div>
                    </div>
                    <div className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl">
                        <div className="flex gap-3">
                            <div
                                className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
                                <i className="fa-solid fa-envelope text-xl"></i>
                            </div>
                            <div className="flex gap-1 flex-col">
                                <h3 className="text-[15px] font-semibold capitalize">Contact support</h3>
                                <p className="text-xs text-gray-500">Leave feedback, report issues</p>
                            </div>
                        </div>
                        <div>
                            <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
                        </div>
                    </div>
                </div>

                {/* Legal Section */}
                <div className="mt-6">
                    <h4 className="uppercase text-gray-600 text-sm font-medium">Legal</h4>
                    <div className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl">
                        <div className="flex gap-3">
                            <div
                                className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
                                <i className="fa-solid fa-file-contract text-xl "></i>
                            </div>
                            <div className="flex gap-1 flex-col">
                                <h3 className="text-[15px] font-semibold capitalize">Terms of service</h3>
                                <p className="text-xs text-gray-500">Read our terms</p>
                            </div>
                        </div>
                        <div>
                            <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
                        </div>
                    </div>
                    <div className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl">
                        <div className="flex gap-3">
                            <div
                                className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
                                <i className="fa-solid fa-shield text-xl "></i>
                            </div>
                            <div className="flex gap-1 flex-col">
                                <h3 className="text-[15px] font-semibold capitalize">Privacy Policy</h3>
                                <p className="text-xs text-gray-500">View our privacy Policy</p>
                            </div>
                        </div>
                        <div>
                            <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-6">
                    <h4 className="uppercase text-gray-500 text-sm font-medium">Info</h4>
                    <div className="mt-3 border border-gray-100 flex items-center justify-between px-4 py-3 rounded-xl">
                        <div className="flex gap-3">
                            <div
                                className="w-[50px] h-[50px] flex items-center justify-center rounded-lg bg-lightgray overflow-hidden">
                                <i className="fa-solid fa-circle-info text-xl"></i>
                            </div>
                            <div className="flex gap-1 flex-col">
                                <h3 className="text-[15px] font-semibold capitalize">Version</h3>
                                <p className="text-xs text-gray-500">1.0.0</p>
                            </div>
                        </div>
                        <div>
                            <i className="fa-solid fa-chevron-right text-sm text-gray-500"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}