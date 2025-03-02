import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useSwipeable } from 'react-swipeable';
import app from "../lib/firebase.config";

const db = getFirestore(app);

const adjustStartDate = (date) => {
    const newDate = new Date(date);
    newDate.setDate(1);
    return newDate;
};

const generateHeatmapData = (dailyStats, startDate) => {
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const heatmapData = Array.from({ length: daysInMonth }, (_, index) => {
        const dateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`;
        return dailyStats[dateStr] || { totalDhikr: 0, ChallengesCompleted: 0 };
    });
    return heatmapData;
};

const getStartDayOfWeek = (date) => {
    return new Date(date).getDay();
};

const HeatTracker = ({ uid }) => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [startDate, setStartDate] = useState(adjustStartDate(new Date()));
    const [startDay, setStartDay] = useState(0);
    const [activeDay, setActiveDay] = useState(null); // State to manage active day for tooltip

    const fetchContributions = async (startDate) => {
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const dailyStats = userData.dailyStats || {}; // Correctly extract dailyStats
                const heatmap = generateHeatmapData(dailyStats, startDate);
                setHeatmapData(heatmap);
            }
        } catch (error) {
            console.error("Error fetching contributions:", error);
        }
    };

    useEffect(() => {
        setStartDay(getStartDayOfWeek(startDate));
        fetchContributions(startDate);
    }, [startDate, uid]);

    const handleSwipe = (direction) => {
        const newStartDate = new Date(startDate);
        newStartDate.setMonth(newStartDate.getMonth() + (direction === 'left' ? 1 : -1));
        setStartDate(adjustStartDate(newStartDate));
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => handleSwipe('left'),
        onSwipedRight: () => handleSwipe('right'),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
    });

    const totalDaysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const daysArray = Array.from({ length: totalDaysInMonth }, (_, index) => index + 1);

    return (
        <div {...handlers} className="bg-lightgray rounded-xl pb-4 mt-5 w-full p-4 flex flex-col items-center justify-center">
            <h1 className="small_title text-left w-full capitalize mb-3">
                {startDate.toLocaleString('en-US', { month: 'long' })} {startDate.getFullYear()}
            </h1>

            <div className="w-full grid grid-cols-7 gap-2">
                {Array.from({ length: startDay }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-8 flex justify-center items-center"></div>
                ))}

                {daysArray.map((day) => {
                    const { totalDhikr = 0, ChallengesCompleted = 0 } = heatmapData[day - 1] || {};
                    const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), day); // Create a new Date object for each day

                    return (
                        <div key={day} className="relative group">
                            <div
                                className="h-8 w-8 flex justify-center items-center rounded-md cursor-pointer"
                                style={{
                                    backgroundColor: totalDhikr > 0
                                        ? `rgba(34, 197, 94, ${Math.min(1, totalDhikr / 100)})` // Green intensity based on `totalDhikr`
                                        : 'rgb(240 240 240)',
                                }}
                                onClick={() => setActiveDay(activeDay === day ? null : day)} // Toggle tooltip on click
                            >
                                <span className="numbers">{day}</span>
                            </div>

                            {/* Tooltip */}
                            {activeDay === day && (
                                <div className="absolute bottom-10 z-50 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-4 py-3 rounded-md shadow-md whitespace-nowrap">
                                    <p className='font-bold'>Dhikr: {totalDhikr}</p>
                                    <p className='font-bold'>Challenges: {ChallengesCompleted}</p>
                                    <div className="tooltip-pointer"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HeatTracker;