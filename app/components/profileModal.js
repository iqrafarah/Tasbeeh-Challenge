'use client';
import React from 'react';
import Image from 'next/image';
import Statistics from '../components/statistics';
import LevelProgress from '../components/levelProgess';
import HeatTracker from '../components/contributionGraph';

const ProfileModal = ({ user, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 w-96 overflow-y-auto max-h-screen">
                <i   onClick={onClose} className="fa-solid fa-chevron-left text-lg cursor-pointer"></i>
                <div className="flex items-center justify-center mt-4">
                    <Image src={user.photoURL} alt="Profile picture" width={100} height={100} className="rounded-full object-cover w-[70px] h-[70px]" />
                </div>
                <h2 className="text-center text-xl font-semibold mt-3">{user.displayName}</h2>
                <div className="flex justify-between border border-gray-100 rounded-lg mt-3 min-h-[75px]">
                    <div className="flex flex-col justify-center text-center border-r w-1/3 h-[90%] m-auto">
                        <span className="title">{user.streak}</span>
                        <span>Streak</span>
                    </div>
                    <div className="flex flex-col justify-center text-center border-r w-1/3 h-[90%] m-auto">
                        <span className="title">{user.level}</span>
                        <span>Level</span>
                    </div>
                    <div className="flex flex-col justify-center text-center w-1/3 h-[80%] m-auto">
                        <span className="title">{user.totalPoints}</span>
                        <span>Points</span>
                    </div>
                </div>
               
                <LevelProgress data={user} userId={user.uid} />
                <Statistics stats={user} />
                <HeatTracker uid={user.uid} />
            </div>
        </div>
    );
};

export default ProfileModal;