import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useSwipeable } from 'react-swipeable';
import app from "../lib/firebase.config";

const db = getFirestore(app);

// Adjust the start date to the first day of the month
const adjustStartDate = (date) => {
    const newDate = new Date(date);
    newDate.setDate(1); // Set to the first day of the month
    return newDate;
};

// Generate heatmap data for the current month
const generateHeatmapData = (contributions, startDate) => {
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const heatmapData = Array.from({ length: daysInMonth }, (_, index) => {
        const dateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`;
        return contributions[dateStr] || 0;
    });
    return heatmapData;
};

// Calculate the day of the week for the first day of the month (0=Sunday, 1=Monday, etc.)
const getStartDayOfWeek = (date) => {
    const newDate = new Date(date);
    return newDate.getDay(); // Returns a number from 0 (Sunday) to 6 (Saturday)
};

const HeatTracker = ({ uid }) => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [startDate, setStartDate] = useState(adjustStartDate(new Date())); // Default to current month
    const [startDay, setStartDay] = useState(0);

    // Fetch contributions from the database and generate heatmap data
    const fetchContributions = async (startDate) => {
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const contributions = userData.contributions || {};
                const heatmap = generateHeatmapData(contributions, startDate);
                setHeatmapData(heatmap);
            }
        } catch (error) {
            console.error("Error fetching contributions:", error);
        }
    };

    useEffect(() => {
        setStartDay(getStartDayOfWeek(startDate)); // Set the start day for the month
        fetchContributions(startDate);
    }, [startDate, uid]);

    // Handle swipe actions to navigate between months
    const handleSwipe = (direction) => {
        const newStartDate = new Date(startDate);

        if (direction === 'right') {
            newStartDate.setMonth(newStartDate.getMonth() - 1); // Go to previous month
        } else if (direction === 'left') {
            newStartDate.setMonth(newStartDate.getMonth() + 1); // Go to next month
        }

        // Adjust start date to the first day of the new month
        setStartDate(adjustStartDate(newStartDate));
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => handleSwipe('left'),  // Swipe left -> next month
        onSwipedRight: () => handleSwipe('right'), // Swipe right -> previous month
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
    });

    // Day labels (Sunday to Saturday)
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const totalDaysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const daysArray = Array.from({ length: totalDaysInMonth }, (_, index) => index + 1); // [1, 2, 3, ..., days in month]

    return (
        <div {...handlers} className="bg-lightgray rounded-xl pb-4 mt-5 w-full p-4 flex flex-col items-center justify-center">

            <h1 className="small_title text-left w-full capitalize mb-3">{startDate.toLocaleString('default', { month: 'long' })} {startDate.getFullYear()}</h1>

            {/* Display current month */}
            {/*<div className="text-xs mb-4 text-left w-full">*/}
            {/*    <span>{startDate.toLocaleString('default', { month: 'long' })} {startDate.getFullYear()}</span>*/}
            {/*</div>*/}

            {/* Day labels row (Sunday-Saturday) */}
            {/*<div className="w-full grid grid-cols-7 gap-2 mb-2">*/}
            {/*    {dayLabels.map((day, index) => (*/}
            {/*        <div key={index} className="text-center text-xs mt-3">{day}</div>*/}
            {/*    ))}*/}
            {/*</div>*/}

            {/* Heatmap grid for current month */}
            <div className="w-full grid grid-cols-7 gap-2">
                {/* Empty cells for the days before the first day of the month */}
                {Array.from({ length: startDay }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-8 flex justify-center items-center"></div>
                ))}

                {/* Render the actual days of the month */}
                {daysArray.map((day, index) => {
                    const count = heatmapData[day - 1] || 0;
                    const currentDate = new Date(startDate);
                    currentDate.setDate(day); // Set to the correct day

                    return (
                        <div
                            key={day}
                            className="h-8 flex justify-center items-center"
                            style={{
                                backgroundColor: count > 0
                                    ? `rgba(44, 190, 78, ${Math.min(1, count / 5)})`
                                    : '#ebedf0',
                                borderRadius: '3px',
                                cursor: 'pointer',
                            }}
                            title={`Date: ${currentDate.toLocaleDateString()}, Contributions: ${count}`}
                        />
                    );
                })}
            </div>

        </div>
    );
};

export default HeatTracker;
