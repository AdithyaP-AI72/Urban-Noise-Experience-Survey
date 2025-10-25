"use client"; // Needs to be a client component

import React from 'react';
// Example using Recharts - replace with your actual library if different
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Define expected props, including the optional onItemClick handler
interface BarChartProps {
    data: { name: string, count: number, value?: number }[]; // Allow count or value
    title: string;
    options?: { indexAxis?: 'x' | 'y', maintainAspectRatio?: boolean }; // Simplified options example
    // Function to call when a bar is clicked (optional)
    onItemClick?: (item: { name: string; count: number; value?: number; }) => void;
}

// Simple contrasting colors
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#d0ed57", "#a4de6c", "#d84b2a", "#5f78d8", "#ff8a80", "#ea80fc", "#f48fb1", "#90caf9", "#a5d6a7"]; // Added more colors


const BarChartDisplay: React.FC<BarChartProps> = ({ data, title, options, onItemClick }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500 flex items-center justify-center h-full">No data available for {title}.</p>;
    }

    // Determine layout based on options
    const layout = options?.indexAxis === 'y' ? 'vertical' : 'horizontal';
    const dataKeyForAxis = layout === 'vertical' ? 'name' : 'count'; // Which key goes on which axis
    const dataKeyForBar = layout === 'vertical' ? 'count' : 'name';

    // Handler for clicking a bar
    const handleBarClick = (payload: any) => {
        // Recharts payload structure for Bar click is often the raw data item
        // console.log("Bar clicked, payload:", payload);
        const clickedData = payload; // Direct payload might be the data item

        // Call the passed-in handler if it exists and we have valid data
        if (onItemClick && clickedData && typeof clickedData.name === 'string' && typeof clickedData.count === 'number') {
            onItemClick({
                name: clickedData.name,
                count: clickedData.count,
                value: clickedData.value // Include value if it exists
            });
        }
    };


    return (
        // ResponsiveContainer needs a parent with a defined height (set in ChartCard)
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                layout={layout}
                margin={{
                    top: 5, right: 20, left: layout === 'vertical' ? 40 : 5, bottom: layout === 'horizontal' ? 30 : 5, // Adjust margins based on layout
                }}
            >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} stroke="#4B5563" />
                {/* Configure axes based on layout */}
                {layout === 'horizontal' ? (
                    <>
                        {/* Adjustments for better label visibility */}
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} interval={0} angle={-45} textAnchor="end" height={50} />
                        <YAxis allowDecimals={false} stroke="#9CA3AF" fontSize={10} />
                    </>
                ) : (
                    <>
                        {/* Ensure X axis is numerical for vertical bar chart */}
                        <XAxis type="number" allowDecimals={false} stroke="#9CA3AF" fontSize={10} />
                        {/* Ensure Y axis is categorical, increase width */}
                        <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={10} width={120} interval={0} />
                    </>
                )}

                <Tooltip
                    cursor={{ fill: 'rgba(100,100,100,0.1)' }}
                    contentStyle={{ backgroundColor: 'rgba(55, 65, 81, 0.9)', border: 'none', borderRadius: '4px' }}
                    labelStyle={{ color: '#E5E7EB' }}
                    itemStyle={{ color: '#E5E7EB' }}
                />
                {/* <Legend /> */}
                <Bar
                    dataKey="count" // Key for the value of the bar
                    onClick={handleBarClick} // *** ADDED CLICK HANDLER TO BAR ***
                    radius={[4, 4, 0, 0]} // Optional: rounded tops
                    maxBarSize={50} // Optional: limit bar width
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className="cursor-pointer outline-none focus:outline-none hover:opacity-80 transition-opacity" // Add cursor and hover
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default BarChartDisplay;

