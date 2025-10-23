"use client"; // Needs to be a client component for recharts

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartProps {
    data: { name: string, value: number }[];
    title: string;
}

// Simple contrasting colors - expand if more needed
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const PieChartDisplay: React.FC<PieChartProps> = ({ data, title }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500">No data available for {title}.</p>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="none" // No border around slices
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(55, 65, 81, 0.9)', border: 'none', borderRadius: '4px' }}
                        labelStyle={{ color: '#E5E7EB' }}
                        itemStyle={{ color: '#E5E7EB' }}
                    />
                    {/* <Legend /> */} {/* Optional: Add legend if labels are too crowded */}
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PieChartDisplay;
