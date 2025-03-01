import React, {useEffect, useState} from 'react';
import Confetti from 'react-confetti';

export default function LevelUpModal({newLevel, onClose}) {
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0);
    const [windowHeight, setWindowHeight] = useState(typeof window !== "undefined" ? window.innerHeight : 0);

    useEffect(() => {
        if (newLevel) {
            setShowConfetti(true);
        }
    }, [newLevel]);

    if (!newLevel) return null;

    return (
        <div className="container fixed top-0 z-[100]">
            {/* Confetti effect */}
            {showConfetti &&
                <Confetti
                width={windowWidth}
                height={windowHeight}
                recycle={false}
                numberOfPieces={500}
                colors={['#f6f2c0', '#c4e3f2', '#c4f8c3', '#f2c4c4', '#e8c4f2', '#f2d4c4']}
            />}
            <div
                className="flex flex-col h-[80%] justify-between bg-white w-[340px] p-8 rounded-xl text-center mx-auto">
                <h3 className="text-lg">Level up!</h3>
                <div className="">
                    <div
                        className="mb-8  w-[200px] h-[200px] flex items-center justify-center p-4 rounded-lg mx-auto ">
                        <i className="fa-solid fa-shield text-[220px] text-[#f2e8c4]"></i>
                        <h1 className="levelTitle absolute">{newLevel}</h1>

                    </div>
                    <h3 className="title">Masha Allah🎉</h3>
                    <p className="mt-2 text-[#rgb(195 195 195)] text-sm">Alhamdulillah, you leveled up to Level</p>                </div>
                <button
                    onClick={onClose}
                    className="button"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
