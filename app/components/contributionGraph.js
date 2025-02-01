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

// Generate heatmap data for the current month (keeping the same contribution logic)
const generateHeatmapData = (contributions, startDate) => {
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const heatmapData = Array.from({ length: daysInMonth }, (_, index) => {
        const dateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`;
        return contributions[dateStr] || 0; // Contributions or default 0
    });
    return heatmapData;
};

// Calculate the day of the week for the first day of the month (0=Sunday, 1=Monday, etc.)
const getStartDayOfWeek = (date) => {
    const newDate = new Date(date);
    return newDate.getDay(); // Returns a number from 0 (Sunday) to 6 (Saturday)
};

const HeatTracker = ({ uid }) => {
    const [heatmapData, setHeatmapData] = useState([]); // To store contributions or other metric data
    const [startDate, setStartDate] = useState(adjustStartDate(new Date())); // Default to current month
    const [startDay, setStartDay] = useState(0);

    // Fetch contributions from the database and generate heatmap data
    const fetchContributions = async (startDate) => {
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                // const contributions = userData.contributions || {};
                const contributions = {
                    "2025-01-01": 1,
                    "2025-01-02": 2,
                    "2025-01-03": 3,
                    "2025-01-04": 1,
                    "2025-01-05": 4,
                    "2025-01-06": 2,
                    "2025-01-07": 1,
                    "2025-01-08": 5,
                    "2025-01-09": 1,
                    "2025-01-10": 2,
                    "2025-01-11": 3,
                    "2025-01-12": 1,
                    "2025-01-13": 4,
                    "2025-01-14": 2,
                    "2025-01-15": 1,
                    "2025-01-16": 5,
                    "2025-01-17": 1,
                    "2025-01-18": 2,
                    "2025-01-19": 3,
                    "2025-01-20": 1,
                    "2025-01-21": 4,
                    "2025-01-22": 2,
                    "2025-01-23": 1,
                    "2025-01-24": 5,
                    "2025-01-25": 1,
                    "2025-01-26": 2,
                    "2025-01-27": 3,
                    "2025-01-28": 1,
                    "2025-01-29": 4,
                    "2025-01-30": 2,
                    "2025-01-31": 1,
                    "2025-02-01": 5,
                    "2025-02-02": 1,
                    "2025-02-03": 0,
                    "2025-02-04": 0,
                    "2025-02-05": 1,
                    "2025-02-06": 4,
                    "2025-02-07": 2,
                    "2025-02-08": 1,
                    "2025-02-09": 5,
                    "2025-02-10": 1,
                    "2025-02-11": 2,
                    "2025-02-12": 3,
                    "2025-02-13": 1,
                    "2025-02-14": 4,
                    "2025-02-15": 2,
                    "2025-02-16": 1,
                    "2025-02-17": 0,
                    "2025-02-18": 1,
                    "2025-02-19": 2,
                    "2025-02-20": 0,
                    "2025-02-21": 1,
                    "2025-02-22": 4,
                    "2025-02-23": 2,
                    "2025-02-24": 1,
                    "2025-02-25": 5,
                    "2025-02-26": 1,
                    "2025-02-27": 2,
                    "2025-02-28": 3,
                    "2025-03-01": 1,
                    "2025-03-02": 4,
                    "2025-03-03": 2,
                    "2025-03-04": 1,
                    "2025-03-05": 5,
                    "2025-03-06": 1,
                    "2025-03-07": 2,
                    "2025-03-08": 3,
                    "2025-03-09": 1,
                    "2025-03-10": 4,
                    "2025-03-11": 2,
                    "2025-03-12": 1,
                    "2025-03-13": 5,
                    "2025-03-14": 1,
                    "2025-03-15": 2,
                    "2025-03-16": 3,
                    "2025-03-17": 1,
                    "2025-03-18": 4,
                    "2025-03-19": 2,
                    "2025-03-20": 1,
                    "2025-03-21": 5,
                    "2025-03-22": 1,
                    "2025-03-23": 2,
                    "2025-03-24": 3,
                    "2025-03-25": 1,
                    "2025-03-26": 4,
                    "2025-03-27": 2,
                    "2025-03-28": 1,
                    "2025-03-29": 5,
                    "2025-03-30": 1,
                    "2025-03-31": 2,
                    "2025-04-01": 3,
                    "2025-04-02": 1,
                    "2025-04-03": 4,
                    "2025-04-04": 2,
                    "2025-04-05": 1,
                    "2025-04-06": 5,
                    "2025-04-07": 1,
                    "2025-04-08": 2,
                    "2025-04-09": 3,
                    "2025-04-10": 1,
                    "2025-04-11": 4,
                    "2025-04-12": 2,
                    "2025-04-13": 1,
                    "2025-04-14": 5,
                    "2025-04-15": 1,
                    "2025-04-16": 2,
                    "2025-04-17": 3,
                    "2025-04-18": 1,
                    "2025-04-19": 4,
                    "2025-04-20": 2,
                    "2025-04-21": 1,
                    "2025-04-22": 5,
                    "2025-04-23": 1,
                    "2025-04-24": 2,
                    "2025-04-25": 3,
                    "2025-04-26": 1,
                    "2025-04-27": 4,
                    "2025-04-28": 2,
                    "2025-04-29": 1,
                    "2025-04-30": 5,
                };

                const heatmap = generateHeatmapData(contributions, startDate);
                setHeatmapData(heatmap);
            }
        } catch (error) {
            console.error("Error fetching contributions:", error);
        }
    };

    useEffect(() => {
        setStartDay(getStartDayOfWeek(startDate)); // Set the start day for the month
        fetchContributions(startDate); // Fetch the contributions or metrics
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

            {/* Heatmap grid for current month */}
            <div className="w-full grid grid-cols-7 gap-2">
                {/* Empty cells for the days before the first day of the month */}
                {Array.from({ length: startDay }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-8 flex justify-center items-center"></div>
                ))}

                {/* Render the actual days of the month */}
                {daysArray.map((day) => {
                    const count = heatmapData[day - 1] || 0; // Fetch contribution or count for the day
                    const currentDate = new Date(startDate);
                    currentDate.setDate(day); // Set to the correct day

                    return (
                        <div
                            key={day}
                            className="h-8 flex justify-center items-center relative"
                            style={{
                                backgroundColor: count > 0
                                    ? `rgb(157, 245, 157, ${Math.min(1, count / 3)})`  // Green color based on the count
                                    : 'rgb(240 240 240)', // Light grey for no data
                                borderRadius: '3px',
                                cursor: 'pointer',
                            }}
                            title={`Date: ${currentDate.toLocaleDateString()}, Contributions: ${count}`}
                        >
                            {/* Display day number */}
                            <span className="numbers">{day}</span>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default HeatTracker;
