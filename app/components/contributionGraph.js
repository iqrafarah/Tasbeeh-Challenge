import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useSwipeable } from 'react-swipeable';
import app from "../lib/firebase.config";

const db = getFirestore(app);

const adjustStartDate = (date) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - newDate.getDay());
    return newDate;
};

const generateHeatmapData = (contributions, startDate) => {
    const weeks = 16;
    const daysInWeek = 7;
    const heatmapData = Array.from({ length: weeks }, () => Array(daysInWeek).fill(0));

    Object.entries(contributions).forEach(([dateStr, count]) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const contributionDate = new Date(year, month - 1, day);
        const startTime = startDate.getTime();
        const contributionTime = contributionDate.getTime();

        const diffTime = contributionTime - startTime;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays < weeks * 7) {
            const weekIndex = Math.floor(diffDays / 7);
            const dayIndex = contributionDate.getDay();

            if (weekIndex < weeks) {
                heatmapData[weekIndex][dayIndex] = count;
            }
        }
    });

    return heatmapData;
};

const HeatTracker = ({ uid }) => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [startDate, setStartDate] = useState(() => adjustStartDate(new Date('2025-01-01')));
    const [currentPeriod, setCurrentPeriod] = useState(0);

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
        fetchContributions(startDate);
    }, [startDate, uid]);

    const handleSwipe = (direction) => {
        const newPeriod = direction === 'left' ? currentPeriod + 1 : currentPeriod - 1;
        if (newPeriod >= 0 && newPeriod <= 2) {
            setCurrentPeriod(newPeriod);
            const newStartDate = new Date(2025, newPeriod * 4, 1);
            setStartDate(adjustStartDate(newStartDate));
        }
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => handleSwipe('left'),
        onSwipedRight: () => handleSwipe('right'),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
    });

    const dayLabels = [
        { key: 'sun', label: 'S' },
        { key: 'mon', label: 'M' },
        { key: 'tue', label: 'T' },
        { key: 'wed', label: 'W' },
        { key: 'thu', label: 'T' },
        { key: 'fri', label: 'F' },
        { key: 'sat', label: 'S' }
    ];

    const formatDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    return (
        <div {...handlers} className="mt-8">
            <h3 className="small_title">Analytics</h3>
            <div className="flex justify-between mt-2" style={{ maxWidth: 'calc(16 * 24px)' }}>
                {getMonthRange(currentPeriod).map((month, index) => (
                    <span key={index} className="text-xs">{month}</span>
                ))}
            </div>
            <div className="flex mt-3">
                <div className="flex flex-col justify-between mr-2">
                    {dayLabels.map(({ key, label }) => (
                        <div key={key} className="h-5 text-xs py-1">{label}</div>
                    ))}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(16, 20px)',
                    gridTemplateRows: 'repeat(7, 20px)',
                    gap: '4px',
                }}>
                    {dayLabels.map((day, dayIndex) =>
                        Array.from({ length: 16 }).map((_, weekIndex) => {
                            const cellDate = new Date(startDate);
                            cellDate.setDate(cellDate.getDate() + (weekIndex * 7));
                            const count = heatmapData[weekIndex]?.[dayIndex] || 0;

                            return (
                                <div
                                    key={`${day.key}-${weekIndex}`}
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: count > 0
                                            ? `rgba(44, 190, 78, ${Math.min(1, count / 5)})`
                                            : '#ebedf0',
                                        borderRadius: '3px',
                                    }}
                                    title={`${formatDate(cellDate)}: ${count} contributions`}
                                />
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

const getMonthRange = (period) => {
    const monthNames = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];
    const startMonth = period * 4;
    return monthNames.slice(startMonth, startMonth + 4);
};

export default HeatTracker;