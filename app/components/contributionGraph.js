import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Rectangle } from 'recharts';

// Sample data for the contribution graph
const commitsData = [
    { date: '2023-10-01', day: 'Sun', count: 2 },
    { date: '2023-10-02', day: 'Mon', count: 5 },
    { date: '2023-10-03', day: 'Tue', count: 0 },
    { date: '2023-10-04', day: 'Wed', count: 3 },
    { date: '2023-10-05', day: 'Thu', count: 1 },
    { date: '2023-10-06', day: 'Fri', count: 4 },
    { date: '2023-10-07', day: 'Sat', count: 2 },
    // Add more data points as needed
];

// Custom heatmap cell
const CustomCell = ({ x, y, width, height, value, index }) => {
    const color = value > 0 ? `rgba(44, 190, 78, ${Math.min(1, value / 5)})` : '#ebedf0'; // Green for contributions, gray for no contributions
    return (
        <Rectangle
            key={`cell-${index}`}
            x={x}
            y={y}
            width={width}
            height={height}
            fill={color}
            stroke="#fff"
            strokeWidth={1}
        />
    );
};

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '5px', border: '1px solid #ccc' }}>
                <p>{`Date: ${payload[0].payload.date}`}</p>
                <p>{`Contributions: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

// ContributionHeatmap component
const ContributionHeatmap = () => {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart
                data={commitsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barCategoryGap={1}
                barGap={1}
            >
                <XAxis dataKey="day" />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" shape={<CustomCell />} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ContributionHeatmap;