"use client"; // Needs to be a client component for state and interaction

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BarChartDisplay from '@/components/BarChartDisplay'; // Assuming you have these
import PieChartDisplay from '@/components/PieChartDisplay'; // Assuming you have these
// Import ISubmission if it's defined in your model file
// Adjust path as necessary
// import { ISubmission } from '@/models/Submission';

// Define structure for the summary data fetched client-side
interface SubmissionSummary {
    _id: string;
    name?: string; // Name is optional
    createdAt: string; // Use string for date from API
}

// Define structure for the detailed data fetched client-side
interface SubmissionDetail {
    _id: string;
    name?: string;
    createdAt: string;
    ageGroup?: string;
    occupation?: string;
    noiseExposureFreq?: string;
    noiseSourceLocations?: string[];
    commonNoiseSources?: string[];
    focusDisturbance?: string;
    sleepEffect?: string;
    stressEffect?: string;
    headphoneFreq?: number;
    botherLevel?: number;
    botherLabel?: string;
    communitySeriousness?: string;
    mapInterest?: string;
    citizenScientist?: string;
    featurePriorities?: string[];
    // Add any other fields your Submission model has
}

// Define structure for the aggregated stats data
interface AggregatedStats {
    averageHeadphoneFreq: string | number;
    topOccupation: string;
    ageGroupData: any[];
    occupationData: any[];
    noiseLocationData: any[];
    noiseExposureFreqData: any[];
    commonSoundsData: any[];
    focusData: any[];
    headphoneFreqDistribution: any[];
    botherLevelData: any[];
    seriousnessData: any[];
    mapInterestData: any[];
    citizenScientistData: any[];
    topFeatureData: any[];
}


// --- Client-Side Data Fetching and State ---
export default function StatsPageClient() {
    // State for summaries (list of submissions)
    const [loadingSummaries, setLoadingSummaries] = useState(true);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [summaries, setSummaries] = useState<SubmissionSummary[]>([]);

    // State for aggregated stats (for charts)
    const [loadingAggregated, setLoadingAggregated] = useState(true);
    const [aggregatedError, setAggregatedError] = useState<string | null>(null);
    const [aggregatedStats, setAggregatedStats] = useState<AggregatedStats | null>(null);

    // State for modal
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    // Fetch summary data on initial load
    useEffect(() => {
        const fetchSummaries = async () => {
            setLoadingSummaries(true);
            setSummaryError(null);
            try {
                // **IMPORTANT**: You need an API route at '/api/submissions/summary'
                // that returns data matching the SubmissionSummary interface.
                const response = await fetch('/api/submissions/summary');
                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error("Summary fetch failed:", errorBody);
                    throw new Error(`Failed to fetch submission summaries (${response.status})`);
                }
                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
                    // Filter out any potential summaries with missing/invalid IDs before setting state
                    const validSummaries = result.data.filter((sub: any) => sub && typeof sub._id === 'string' && /^[0-9a-fA-F]{24}$/.test(sub._id));
                    if (validSummaries.length !== result.data.length) {
                        console.warn("Filtered out some summaries with invalid IDs from API response.");
                    }
                    setSummaries(validSummaries);
                } else {
                    throw new Error(result.message || 'Invalid summary data format received');
                }
            } catch (err) {
                console.error("Error fetching summaries:", err);
                setSummaryError(err instanceof Error ? err.message : 'Could not load submission list.');
            } finally {
                setLoadingSummaries(false);
            }
        };
        fetchSummaries();
    }, []);

    // Fetch aggregated data on initial load
    useEffect(() => {
        const fetchAggregatedStats = async () => {
            setLoadingAggregated(true);
            setAggregatedError(null);
            try {
                const response = await fetch('/api/stats/aggregate'); // Fetch from the new route
                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error("Aggregated stats fetch failed:", errorBody);
                    throw new Error(`Failed to fetch aggregated stats (${response.status})`);
                }
                const result = await response.json();
                if (result.success) {
                    setAggregatedStats(result.data);
                } else {
                    throw new Error(result.message || 'Invalid aggregated data format received');
                }
            } catch (err) {
                console.error("Error fetching aggregated stats:", err);
                setAggregatedError(err instanceof Error ? err.message : 'Could not load overall statistics.');
            } finally {
                setLoadingAggregated(false);
            }
        };
        fetchAggregatedStats();
    }, []);


    // Function to fetch and display details for a selected submission
    const viewDetails = async (id: string) => {
        // --- Enhanced Validation and Logging ---
        console.log("Attempting to view details for ID:", id, "(Type:", typeof id, ")"); // Log ID value and type

        // 1. Check if ID is provided and is a non-empty string
        if (!id || typeof id !== 'string' || id.trim() === '') {
            const errorMsg = `Invalid ID provided: ${id}`;
            console.error("View Details Error:", errorMsg);
            setDetailError(errorMsg);
            setIsModalOpen(true);
            setSelectedSubmission(null);
            setLoadingDetails(false);
            return;
        }

        // 2. Check the specific MongoDB ObjectId format (24 hex characters)
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(id)) {
            const errorMsg = `Invalid submission ID format: "${id}" is not a 24-char hex string.`;
            console.error("View Details Error:", errorMsg);
            setDetailError(errorMsg);
            setIsModalOpen(true);
            setSelectedSubmission(null);
            setLoadingDetails(false);
            return;
        }
        // --- End Enhanced Validation ---

        console.log(`ID "${id}" passed validation. Fetching details...`);

        setIsModalOpen(true);
        setLoadingDetails(true);
        setSelectedSubmission(null);
        setDetailError(null);
        try {
            const response = await fetch(`/api/submissions/${id}`);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `Failed to fetch submission ${id} (${response.status})`);
            }
            const result = await response.json();
            if (result.success) {
                setSelectedSubmission(result.data);
            } else {
                throw new Error(result.message || `Could not find submission ${id}`);
            }
        } catch (err) {
            console.error("Error fetching details:", err);
            setDetailError(err instanceof Error ? err.message : 'Could not load submission details.');
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSubmission(null);
        setDetailError(null);
    };

    // ----- Render Logic -----

    // Combined loading state
    if (loadingSummaries || loadingAggregated) {
        return <main className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900"><p className="text-gray-600 dark:text-gray-300 animate-pulse">Loading dashboard...</p></main>;
    }

    // Combined error state - Show summary error preferentially if both exist
    const displayError = summaryError || aggregatedError;
    if (displayError) {
        return <main className="min-h-screen flex items-center justify-center p-4 bg-red-50 text-red-700"><p>Error: {displayError}</p></main>;
    }

    // Helper function to format data for charts - ensures data exists before mapping
    const formatChartData = (dataArray: any[] | undefined | null, nameKey = '_id', valueKey = 'count') => {
        if (!dataArray || !Array.isArray(dataArray)) return [];
        return dataArray.map((item: any) => ({
            name: item?.[nameKey] || 'Not Specified', // Safer access
            value: typeof item?.[valueKey] === 'number' ? item[valueKey] : 0, // Safer access and type check
            count: typeof item?.[valueKey] === 'number' ? item[valueKey] : 0, // Keep count if needed
        }));
    };

    // Prepare chart data (only if aggregatedStats is loaded and valid)
    const ageGroupChartData = formatChartData(aggregatedStats?.ageGroupData);
    const occupationChartData = formatChartData(aggregatedStats?.occupationData);
    const noiseLocationChartData = formatChartData(aggregatedStats?.noiseLocationData);
    const noiseExposureFreqChartData = formatChartData(aggregatedStats?.noiseExposureFreqData);
    const commonSoundsChartData = formatChartData(aggregatedStats?.commonSoundsData);
    const focusChartData = formatChartData(aggregatedStats?.focusData);
    const headphoneFreqChartData = formatChartData(aggregatedStats?.headphoneFreqDistribution);
    const botherLevelChartData = formatChartData(aggregatedStats?.botherLevelData);
    const seriousnessChartData = formatChartData(aggregatedStats?.seriousnessData);
    const mapInterestChartData = formatChartData(aggregatedStats?.mapInterestData);
    const citizenScientistChartData = formatChartData(aggregatedStats?.citizenScientistData);
    const topFeatureChartData = formatChartData(aggregatedStats?.topFeatureData);

    // ----- Render the actual dashboard -----
    return (
        // Entire page scrolls
        <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    📊 SoundScape Stats Dashboard
                </h1>

                {/* Top Stat Cards - Use fetched aggregated data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <StatCard title="Total Submissions" value={summaries.length} />
                    <StatCard title="Avg. Headphone Use" value={`${aggregatedStats?.averageHeadphoneFreq || 'N/A'} / 10`} />
                    <StatCard title="Top Occupation" value={aggregatedStats?.topOccupation || 'N/A'} />
                </div>

                {/* --- Submission List Section --- */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                        Recent Submissions ({summaries.length})
                    </h2>
                    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md max-h-96 overflow-y-auto">
                        {summaries.length > 0 ? (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {summaries.map((sub) => (
                                    <li key={sub._id} className="py-3 flex justify-between items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <span className="text-lg font-medium text-gray-900 dark:text-white truncate block">
                                                {sub.name?.trim() || 'Anonymous'}
                                            </span>
                                            <span className="block text-sm text-gray-500 dark:text-gray-400">
                                                Submitted: {new Date(sub.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => viewDetails(sub._id)} // Ensure sub._id is passed
                                            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded shadow transition flex-shrink-0"
                                        >
                                            View Details
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No submissions yet.</p>
                        )}
                    </div>
                </section>

                {/* --- Aggregated Stats Sections --- */}

                {/* Demographics */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Demographics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ChartCard title="Age Group">
                            <PieChartDisplay data={ageGroupChartData} />
                        </ChartCard>
                        <ChartCard title="Current Role">
                            <PieChartDisplay data={occupationChartData} />
                        </ChartCard>
                    </div>
                </section>

                {/* Noise Exposure */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Noise Exposure</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ChartCard title="Most Common Noise Locations">
                            {/* Assuming BarChartDisplay supports horizontal via options */}
                            <BarChartDisplay data={noiseLocationChartData} options={{ indexAxis: 'y', maintainAspectRatio: false }} />
                        </ChartCard>
                        <ChartCard title="Frequency of Unwanted Noise">
                            <BarChartDisplay data={noiseExposureFreqChartData} options={{ maintainAspectRatio: false }} />
                        </ChartCard>
                        <ChartCard title="Most Common Sounds Heard">
                            <BarChartDisplay data={commonSoundsChartData} options={{ indexAxis: 'y', maintainAspectRatio: false }} />
                        </ChartCard>
                    </div>
                </section>

                {/* Noise Impact */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Noise Impact</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ChartCard title="Focus/Sleep Disturbance Freq.">
                            <BarChartDisplay data={focusChartData} options={{ maintainAspectRatio: false }} />
                        </ChartCard>
                        <ChartCard title="Headphone Use Frequency (1-10)">
                            <BarChartDisplay data={headphoneFreqChartData} options={{ maintainAspectRatio: false }} />
                        </ChartCard>
                        <ChartCard title="Noise Annoyance Threshold">
                            <BarChartDisplay data={botherLevelChartData} options={{ maintainAspectRatio: false }} />
                        </ChartCard>
                    </div>
                </section>

                {/* Community Opinion */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Community Opinion</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ChartCard title="Is Noise Pollution Taken Seriously?">
                            <PieChartDisplay data={seriousnessChartData} />
                        </ChartCard>
                        <ChartCard title="Interest in Real-time Noise Map">
                            <PieChartDisplay data={mapInterestChartData} />
                        </ChartCard>
                        <ChartCard title="Willingness to Contribute Data">
                            <PieChartDisplay data={citizenScientistChartData} />
                        </ChartCard>
                    </div>
                </section>

                {/* Feature Preferences */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Feature Preferences</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ChartCard title="Most Preferred Feature (Ranked #1)">
                            <BarChartDisplay data={topFeatureChartData} options={{ indexAxis: 'y', maintainAspectRatio: false }} />
                        </ChartCard>
                        {/* Optional: Add another chart here if desired */}
                    </div>
                </section>

            </div>

            {/* --- Modal for Submission Details --- */}
            {isModalOpen && (
                // Backdrop
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
                    onClick={closeModal}
                >
                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-3xl leading-none" aria-label="Close modal" > &times; </button>
                        {/* Modal Header */}
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white pr-8">
                            Submission: {selectedSubmission?.name?.trim() || 'Anonymous'}
                            {selectedSubmission && (<span className="block text-sm font-normal text-gray-500 dark:text-gray-400 mt-1"> {new Date(selectedSubmission.createdAt).toLocaleString()} </span>)}
                        </h2>
                        {/* Modal Body */}
                        {loadingDetails ? (
                            <div className="flex justify-center items-center h-32"> <p className="text-gray-600 dark:text-gray-300 animate-pulse">Loading details...</p> </div>
                        ) : detailError ? (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"> <strong className="font-bold">Error:</strong> <span className="block sm:inline"> {detailError}</span> </div>
                        ) : selectedSubmission ? (
                            <div className="space-y-3 text-sm sm:text-base">
                                {Object.entries(selectedSubmission).map(([key, value]) => {
                                    if (key === '__v') return null; // Skip Mongoose version key
                                    let displayValue: React.ReactNode = '';
                                    if (key === 'createdAt' || key === 'updatedAt') { displayValue = new Date(value as string).toLocaleString(); }
                                    else if (Array.isArray(value)) { displayValue = value.length > 0 ? value.join(', ') : <span className="text-gray-400 italic">None selected</span>; }
                                    else if (value === '' || value === null || typeof value === 'undefined') { displayValue = <span className="text-gray-400 italic">Not answered</span>; }
                                    else { displayValue = String(value); }
                                    const formatKey = (s: string) => s.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    return (<div key={key} className="grid grid-cols-3 gap-2 border-b border-gray-200 dark:border-gray-700 py-2 last:border-b-0"> <dt className="font-medium text-gray-600 dark:text-gray-400 capitalize col-span-1">{formatKey(key)}:</dt> <dd className="text-gray-800 dark:text-gray-200 col-span-2 break-words">{displayValue}</dd> </div>);
                                })}
                            </div>
                        ) : (
                            <p className="text-yellow-500">Could not load submission details.</p>
                        )}
                    </motion.div>
                </div>
            )}
        </main>
    );
}


// --- Helper Components ---
function StatCard({ title, value }: { title: string, value: string | number }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
                {title}
            </h3>
            <p className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
                {value}
            </p>
        </div>
    );
}
function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                {title}
            </h2>
            <div className="h-64 sm:h-80 relative">
                {children}
            </div>
        </div>
    );
}

