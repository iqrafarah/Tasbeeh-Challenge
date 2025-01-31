import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

export default function LevelUpModal({ newLevel, onClose }) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (newLevel) {
            setShowConfetti(true);
            // Stop confetti after a few seconds
            setTimeout(() => {
                setShowConfetti(false);
            }, 5000); // Adjust time as needed
        }
    }, [newLevel]);

    if (!newLevel) return null;

    return (
        <div className="container fixed z-50">
            {/* Confetti effect */}
            {showConfetti && <Confetti />}
            <div className="flex flex-col h-[80%] justify-between bg-white w-[340px] p-8 rounded-xl text-center mx-auto">
                <h3 className="text-lg">Level up!</h3>
               <div className="">
                   <div
                       className="mb-8  w-[200px] h-[200px] flex items-center justify-center p-4 rounded-lg mx-auto ">
                       <i className="fa-solid fa-shield text-[220px] text-[#f2e8c4]"></i>
                       <h1 className="levelTitle absolute">{newLevel}</h1>

                   </div>
                   <h3 className="title">Congrats🎉</h3>
                   <p className="mt-2 text-[#rgb(195 195 195)] text-sm">Masha Allah You leveled up to Level</p>
               </div><button
                    onClick={onClose}
                    className="button"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
