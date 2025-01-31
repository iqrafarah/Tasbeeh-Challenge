import React from 'react';

// Sample data for 4 months (16 weeks)
const commitsData = [
    { date: '2024-01-01', count: 2 }, // Jan
    { date: '2024-01-02', count: 5 },
    { date: '2024-01-03', count: 0 },
    { date: '2024-01-04', count: 3 },
    { date: '2024-01-05', count: 1 },
    { date: '2024-01-06', count: 4 },
    { date: '2024-01-07', count: 2 },
    { date: '2024-02-01', count: 3 }, // Feb
    { date: '2024-02-02', count: 1 },
    { date: '2024-02-03', count: 0 },
    { date: '2024-02-04', count: 4 },
    { date: '2024-02-05', count: 2 },
    { date: '2024-02-06', count: 5 },
    { date: '2024-02-07', count: 1 },
    { date: '2024-03-01', count: 0 }, // Mar
    { date: '2024-03-02', count: 2 },
    { date: '2024-03-03', count: 3 },
    { date: '2024-03-04', count: 1 },
    { date: '2024-03-05', count: 4 },
    { date: '2024-03-06', count: 2 },
    { date: '2024-03-07', count: 0 },
    { date: '2024-04-01', count: 1 }, // Apr
    { date: '2024-04-02', count: 3 },
    { date: '2024-04-03', count: 2 },
    { date: '2024-04-04', count: 0 },
    { date: '2024-04-05', count: 4 },
    { date: '2024-04-06', count: 1 },
    { date: '2024-04-07', count: 2 },
    // Add more data points for 4 months
];

// Generate a grid of 16 weeks (4 months) x 7 days
const generateHeatmapData = (data) => {
    const weeks = 16; // 4 months
    const daysInWeek = 7;
    const heatmapData = Array.from({ length: daysInWeek }, () => Array(weeks).fill(0)); // Transposed grid

    data.forEach((entry) => {
        const date = new Date(entry.date);
        const week = Math.floor((date - new Date('2024-01-01')) / (7 * 24 * 60 * 60 * 1000)); // Calculate week number
        const day = date.getDay(); // 0 (Sunday) to 6 (Saturday)

        if (week >= 0 && week < weeks) {
            heatmapData[day][week] = entry.count;
        }
    });

    return heatmapData;
};

// HeatTracker component
const HeatTracker = () => {
    const heatmapData = generateHeatmapData(commitsData);

    return (
        <div style={{marginTop: '2em', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(16, 20px)', // 16 weeks (4 months)
                    gridTemplateRows: 'repeat(7, 20px)', // 7 days in a week
                    gap: '4px',
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
                                new Date('2024-01-01').getTime() + (weekIndex * 7 + dayIndex) * 24 * 60 * 60 * 1000
                            ).toLocaleDateString()}, Contributions: ${count}`}
                        />
                    ))
                )}
            </div>
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
            </div>
        </div>
    );
};

export default HeatTracker;