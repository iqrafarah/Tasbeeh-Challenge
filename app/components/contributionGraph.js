import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useSwipeable } from 'react-swipeable';
import app from "../lib/firebase.config";

const db = getFirestore(app);

// Adjust start date to the nearest previous Sunday
const adjustStartDate = (date) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - newDate.getDay()); // Move back to the last Sunday
    return newDate;
};

// Generate a heatmap grid (16 weeks x 7 days)
const generateHeatmapData = (contributions, startDate) => {
    const weeks = 16; // 4 months
    const daysInWeek = 7;
    const heatmapData = Array.from({ length: weeks }, () => Array(daysInWeek).fill(0)); // [week][day]

    console.log("Start Date:", startDate.toISOString());

    Object.entries(contributions).forEach(([date, count]) => {
        const parsedDate = new Date(date + "T00:00:00Z"); // Force UTC

        if (isNaN(parsedDate.getTime())) {
            console.warn(`Invalid date: ${date}`);
            return; // Skip invalid dates
        }

        const diffDays = Math.floor((parsedDate - startDate) / (24 * 60 * 60 * 1000));
        const week = Math.floor(diffDays / 7);
        const day = parsedDate.getUTCDay(); // 0 (Sunday) to 6 (Saturday)

        console.log(`Date: ${date}, Parsed: ${parsedDate.toISOString()}, Week: ${week}, Day: ${day}, Count: ${count}`);

        if (week >= 0 && week < weeks && day >= 0 && day < daysInWeek) {
            heatmapData[week][day] = count;
        }
    });

    console.log("Final Heatmap:", heatmapData);
    return heatmapData;
};

// Transpose the heatmap data to render vertically
const transposeHeatmapData = (heatmapData) => {
    const weeks = heatmapData.length;
    const daysInWeek = heatmapData[0].length;
    const transposedData = Array.from({ length: daysInWeek }, () => Array(weeks).fill(0)); // [day][week]

    for (let week = 0; week < weeks; week++) {
        for (let day = 0; day < daysInWeek; day++) {
            transposedData[day][week] = heatmapData[week][day];
        }
    }

    return transposedData;
};

// HeatTracker component
const HeatTracker = ({ uid }) => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [startDate, setStartDate] = useState(adjustStartDate(new Date('2025-01-01')));
    const [currentPeriod, setCurrentPeriod] = useState(0); // 0 = Jan–Apr, 1 = May–Aug, 2 = Sep–Dec

    const fetchContributions = async (startDate) => {
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const contributions = userData.contributions || {};
                // const contributions = {
                //     "2025-01-01": 1,
                //     "2025-01-02": 2,
                //     "2025-01-03": 3,
                //     "2025-01-04": 1,
                //     "2025-01-05": 4,
                //     "2025-01-06": 2,
                //     "2025-01-07": 1,
                //     "2025-01-08": 5,
                //     "2025-01-09": 1,
                //     "2025-01-10": 2,
                //     "2025-01-11": 3,
                //     "2025-01-12": 1,
                //     "2025-01-13": 4,
                //     "2025-01-14": 2,
                //     "2025-01-15": 1,
                //     "2025-01-16": 5,
                //     "2025-01-17": 1,
                //     "2025-01-18": 2,
                //     "2025-01-19": 3,
                //     "2025-01-20": 1,
                //     "2025-01-21": 4,
                //     "2025-01-22": 2,
                //     "2025-01-23": 1,
                //     "2025-01-24": 5,
                //     "2025-01-25": 1,
                //     "2025-01-26": 2,
                //     "2025-01-27": 3,
                //     "2025-01-28": 1,
                //     "2025-01-29": 4,
                //     "2025-01-30": 2,
                //     "2025-01-31": 1,
                //     "2025-02-01": 5,
                //     "2025-02-02": 1,
                //     "2025-02-03": 2,
                //     "2025-02-04": 3,
                //     "2025-02-05": 1,
                //     "2025-02-06": 4,
                //     "2025-02-07": 2,
                //     "2025-02-08": 1,
                //     "2025-02-09": 5,
                //     "2025-02-10": 1,
                //     "2025-02-11": 2,
                //     "2025-02-12": 3,
                //     "2025-02-13": 1,
                //     "2025-02-14": 4,
                //     "2025-02-15": 2,
                //     "2025-02-16": 1,
                //     "2025-02-17": 5,
                //     "2025-02-18": 1,
                //     "2025-02-19": 2,
                //     "2025-02-20": 3,
                //     "2025-02-21": 1,
                //     "2025-02-22": 4,
                //     "2025-02-23": 2,
                //     "2025-02-24": 1,
                //     "2025-02-25": 5,
                //     "2025-02-26": 1,
                //     "2025-02-27": 2,
                //     "2025-02-28": 3,
                //     "2025-03-01": 1,
                //     "2025-03-02": 4,
                //     "2025-03-03": 2,
                //     "2025-03-04": 1,
                //     "2025-03-05": 5,
                //     "2025-03-06": 1,
                //     "2025-03-07": 2,
                //     "2025-03-08": 3,
                //     "2025-03-09": 1,
                //     "2025-03-10": 4,
                //     "2025-03-11": 2,
                //     "2025-03-12": 1,
                //     "2025-03-13": 5,
                //     "2025-03-14": 1,
                //     "2025-03-15": 2,
                //     "2025-03-16": 3,
                //     "2025-03-17": 1,
                //     "2025-03-18": 4,
                //     "2025-03-19": 2,
                //     "2025-03-20": 1,
                //     "2025-03-21": 5,
                //     "2025-03-22": 1,
                //     "2025-03-23": 2,
                //     "2025-03-24": 3,
                //     "2025-03-25": 1,
                //     "2025-03-26": 4,
                //     "2025-03-27": 2,
                //     "2025-03-28": 1,
                //     "2025-03-29": 5,
                //     "2025-03-30": 1,
                //     "2025-03-31": 2,
                //     "2025-04-01": 3,
                //     "2025-04-02": 1,
                //     "2025-04-03": 4,
                //     "2025-04-04": 2,
                //     "2025-04-05": 1,
                //     "2025-04-06": 5,
                //     "2025-04-07": 1,
                //     "2025-04-08": 2,
                //     "2025-04-09": 3,
                //     "2025-04-10": 1,
                //     "2025-04-11": 4,
                //     "2025-04-12": 2,
                //     "2025-04-13": 1,
                //     "2025-04-14": 5,
                //     "2025-04-15": 1,
                //     "2025-04-16": 2,
                //     "2025-04-17": 3,
                //     "2025-04-18": 1,
                //     "2025-04-19": 4,
                //     "2025-04-20": 2,
                //     "2025-04-21": 1,
                //     "2025-04-22": 5,
                //     "2025-04-23": 1,
                //     "2025-04-24": 2,
                //     "2025-04-25": 3,
                //     "2025-04-26": 1,
                //     "2025-04-27": 4,
                //     "2025-04-28": 2,
                //     "2025-04-29": 1,
                //     "2025-04-30": 5,
                // };
                const heatmap = generateHeatmapData(contributions, startDate);
                const transposedHeatmap = transposeHeatmapData(heatmap); // Transpose the heatmap data
                setHeatmapData(transposedHeatmap);
                console.log(`Heatmap data: ${JSON.stringify(transposedHeatmap)}`);
            }
        } catch (error) {
            console.error("Error fetching contributions:", error);
        }
    };

    useEffect(() => {
        fetchContributions(startDate);
    }, [startDate]);

    const handleSwipe = (direction) => {
        const newPeriod = direction === 'left' ? currentPeriod + 1 : currentPeriod - 1;
        if (newPeriod >= 0 && newPeriod <= 2) {
            setCurrentPeriod(newPeriod);
            const newStartDate = new Date(startDate);
            newStartDate.setMonth(startDate.getMonth() + (direction === 'left' ? 4 : -4));
            setStartDate(adjustStartDate(newStartDate)); // Adjust to Sunday
        }
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => handleSwipe('left'),
        onSwipedRight: () => handleSwipe('right'),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
    });

    return (
        <div {...handlers} style={{ marginTop: '2em', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h3 className="small_title">Analytics</h3>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(16, 20px)', // 16 weeks (4 months)
                    gridTemplateRows: 'repeat(7, 20px)', // 7 days in a week
                    gap: '4px',
                    marginTop: '0.75rem',
                    width: '100%',
                    overflow: 'hidden'
                }}
            >
                {heatmapData.map((week, dayIndex) =>
                    week.map((count, weekIndex) => (
                        <div
                            key={`${dayIndex}-${weekIndex}`}
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: count > 0 ? `rgba(44, 190, 78, ${Math.min(1, count / 5)})` : '#ebedf0',
                                borderRadius: '3px',
                            }}
                            title={`Date: ${new Date(
                                startDate.getTime() + (weekIndex * 7 + dayIndex) * 24 * 60 * 60 * 1000
                            ).toLocaleDateString()}, Contributions: ${count}`}
                        />
                    ))
                )}
            </div>

            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                {getMonthRange(currentPeriod).map((month, index) => (
                    <span key={index} style={{ margin: '0 5px'}} className="text-xs">{month}</span>
                ))}
            </div>
        </div>
    );
};

// Helper function to get the full month names being displayed
const getMonthRange = (period) => {
    const startMonth = period * 4; // 0 = January, 4 = May, 8 = September
    const monthNames = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December',
    ];

    return monthNames.slice(startMonth, startMonth + 4);
};

export default HeatTracker;