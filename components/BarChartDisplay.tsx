"use client"; // Needs to be a client component for recharts

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
    data: { name: string, count: number }[];
    title: string;
}

const BarChartDisplay: React.FC<BarChartProps> = ({ data, title }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500">No data available for {title}.</p>;
    }
    // Simple contrasting colors
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#d0ed57", "#a4de6c"];

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={data}
                    margin={{
                        top: 5, right: 30, left: 0, bottom: 5, // Adjusted left margin
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" /> {/* Darker grid for dark mode */}
                    <XAxis dataKey="name" stroke="#9CA3AF" /> {/* Axis color */}
                    <YAxis allowDecimals={false} stroke="#9CA3AF" />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(55, 65, 81, 0.9)', border: 'none', borderRadius: '4px' }} // Dark tooltip
                        labelStyle={{ color: '#E5E7EB' }} // Light label text
                        itemStyle={{ color: '#E5E7EB' }} // Light item text
                    />
                    {/* <Legend /> */} {/* Legend often not needed for single bar */}
                    <Bar dataKey="count" fill={colors[0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChartDisplay;
