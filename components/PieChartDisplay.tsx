"use client"; // Needs to be a client component for recharts

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define expected props, including the optional onItemClick handler
interface PieChartProps {
    data: { name: string, value: number, count?: number }[]; // Allow value or count
    title: string;
    // Function to call when a slice is clicked (optional)
    onItemClick?: (item: { name: string; value: number; count?: number }) => void;
}

// Simple contrasting colors - expand if more needed
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d84b2a'];

// Custom label component if needed (Recharts example)
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6; // Adjust label position
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const labelThreshold = 0.03; // Don't show labels for very small slices

    if (percent < labelThreshold) return null;

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight="bold">
            {`${(percent * 100).toFixed(0)}%`}
            {/* Optionally add name: {`${name} (${(percent * 100).toFixed(0)}%)`} */}
        </text>
    );
};


const PieChartDisplay: React.FC<PieChartProps> = ({ data, title, onItemClick }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500 flex items-center justify-center h-full">No data available for {title}.</p>;
    }

    // Handler for clicking a slice
    const handlePieClick = (payload: any, index: number) => {
        // Recharts click payload often has the original data item in `payload.payload`
        const clickedData = payload?.payload;
        console.log("Pie slice clicked:", clickedData); // Log to inspect

        // Call the passed-in handler if it exists and we have valid data
        if (onItemClick && clickedData && typeof clickedData.name === 'string' && typeof clickedData.value === 'number') {
            onItemClick({
                name: clickedData.name,
                value: clickedData.value,
                count: clickedData.count // Include count if it was part of the formatted data
            });
        }
    };

    return (
        // ResponsiveContainer needs a parent with a defined height (set in ChartCard)
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel} // Use custom label
                    outerRadius="80%" // Use percentage for better responsiveness
                    fill="#8884d8"
                    dataKey="value" // Use 'value' from our formatted data
                    stroke="none"
                    onClick={handlePieClick} // *** ADDED CLICK HANDLER TO PIE ***
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className="cursor-pointer outline-none focus:outline-none hover:opacity-80 transition-opacity" // Add cursor and hover effect
                        />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(55, 65, 81, 0.9)', border: 'none', borderRadius: '4px' }}
                    labelStyle={{ color: '#E5E7EB' }}
                    itemStyle={{ color: '#E5E7EB' }}
                />
                <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px', color: '#9CA3AF' }} // Style legend text
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default PieChartDisplay;

