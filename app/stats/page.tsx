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
// *** FIX: Removed sleepEffect and stressEffect ***
interface SubmissionDetail {
    _id: string;
    name?: string;
    createdAt: string;
    ageGroup?: string;
    occupation?: string;
    noiseExposureFreq?: string;
    noiseSourceLocations?: string[];
    commonNoiseSources?: string[];
    focusDisturbance?: string; // This is the correct field
    headphoneFreq?: number;
    botherLevel?: number;
    botherLabel?: string;
    communitySeriousness?: string;
    mapInterest?: string;
    citizenScientist?: string;
    featurePriorities?: string[];
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

// New interface for chart modal content
interface ChartModalContent {
    title: string; // e.g., "Age Group"
    label: string; // e.g., "18-22"
    value: number | string; // e.g., 15 or "15 submissions"
    details?: string; // Optional longer description
}

// --- Helper Component for displaying a detail row in the modal ---
const DetailRow = ({ label, value }: { label: string, value: any }) => {
    let displayValue: React.ReactNode = '';

    if (Array.isArray(value)) {
        displayValue = value.length > 0 ? value.join(', ') : <span className="text-gray-400 italic">None selected</span>;
    } else if (value === '' || value === null || typeof value === 'undefined') {
        displayValue = <span className="text-gray-400 italic">Not answered</span>;
    } else {
        displayValue = String(value);
    }

    return (
        <div className="grid grid-cols-3 gap-2 border-b border-gray-200 dark:border-gray-700 py-2 last:border-b-0">
            <dt className="font-medium text-gray-600 dark:text-gray-400 capitalize col-span-1">{label}:</dt>
            <dd className="text-gray-800 dark:text-gray-200 col-span-2 break-words">{displayValue}</dd>
        </div>
    );
};


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
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // Renamed for clarity
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    // *** NEW State for Chart Modal ***
    const [isChartModalOpen, setIsChartModalOpen] = useState(false);
    const [chartModalContent, setChartModalContent] = useState<ChartModalContent | null>(null);

    // Fetch summary data on initial load
    useEffect(() => {
        const fetchSummaries = async () => {
            setLoadingSummaries(true);
            setSummaryError(null);
            try {
                const response = await fetch('/api/submissions/summary');
                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error("Summary fetch failed:", errorBody);
                    throw new Error(`Failed to fetch submission summaries (${response.status})`);
                }
                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
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
            setIsDetailModalOpen(true);
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
            setIsDetailModalOpen(true);
            setSelectedSubmission(null);
            setLoadingDetails(false);
            return;
        }
        // --- End Enhanced Validation ---

        console.log(`ID "${id}" passed validation. Fetching details...`);

        setIsDetailModalOpen(true);
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

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedSubmission(null);
        setDetailError(null);
    };

    // *** NEW Chart Click Handler ***
    const handleChartItemClick = (chartTitle: string, itemData: { name: string; value?: number; count?: number; details?: string }) => {
        console.log("Chart item clicked:", chartTitle, itemData);
        setChartModalContent({
            title: chartTitle,
            label: itemData.name, // Use 'name' from formatted data
            value: itemData.value ?? itemData.count ?? 'N/A', // Use 'value' or 'count'
            details: itemData.details
        });
        setIsChartModalOpen(true);
    };

    const closeChartModal = () => {
        setIsChartModalOpen(false);
        setChartModalContent(null);
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
    const ageGroupChartData = aggregatedStats ? formatChartData(aggregatedStats.ageGroupData) : [];
    const occupationChartData = aggregatedStats ? formatChartData(aggregatedStats.occupationData) : [];
    const noiseLocationChartData = aggregatedStats ? formatChartData(aggregatedStats.noiseLocationData) : [];
    const noiseExposureFreqChartData = aggregatedStats ? formatChartData(aggregatedStats.noiseExposureFreqData) : [];
    const commonSoundsChartData = aggregatedStats ? formatChartData(aggregatedStats.commonSoundsData) : [];
    const focusChartData = aggregatedStats ? formatChartData(aggregatedStats.focusData) : [];
    const headphoneFreqChartData = aggregatedStats ? formatChartData(aggregatedStats.headphoneFreqDistribution) : [];
    const botherLevelChartData = aggregatedStats ? formatChartData(aggregatedStats.botherLevelData) : [];
    const seriousnessChartData = aggregatedStats ? formatChartData(aggregatedStats.seriousnessData) : [];
    const mapInterestChartData = aggregatedStats ? formatChartData(aggregatedStats.mapInterestData) : [];
    const citizenScientistChartData = aggregatedStats ? formatChartData(aggregatedStats.citizenScientistData) : [];
    const topFeatureChartData = aggregatedStats ? formatChartData(aggregatedStats.topFeatureData) : [];

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
                    <StatCard title="Avg. Headphone Use" value={`${aggregatedStats?.averageHeadphoneFreq ?? 'N/A'} / 10`} />
                    <StatCard title="Top Occupation" value={aggregatedStats?.topOccupation ?? 'N/A'} />
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
                {aggregatedStats && (
                    <>
                        {/* Demographics */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Demographics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <StatsChartCard title="Age Group">
                                    <PieChartDisplay
                                        data={ageGroupChartData}
                                        title="Age Group Distribution"
                                        onItemClick={(item: { name: string; value: number }) => handleChartItemClick("Age Group", { label: item.name, value: item.value })}
                                    />
                                </StatsChartCard>
                                <StatsChartCard title="Current Role">
                                    <PieChartDisplay
                                        data={occupationChartData}
                                        title="Current Role Distribution"
                                        onItemClick={(item: { name: string; value: number }) => handleChartItemClick("Current Role", { label: item.name, value: item.value })}
                                    />
                                </StatsChartCard>
                            </div>
                        </section>
                        {/* Noise Exposure */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Noise Exposure</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <StatsChartCard title="Most Common Noise Locations">
                                    <BarChartDisplay
                                        data={noiseLocationChartData}
                                        title="Noise Locations" options={{ indexAxis: 'y', maintainAspectRatio: false }}
                                        onItemClick={(item: { name: string; count: number }) => handleChartItemClick("Noise Locations", { label: item.name, value: item.count })}
                                    />
                                </StatsChartCard>
                                <StatsChartCard title="Frequency of Unwanted Noise">
                                    <BarChartDisplay
                                        data={noiseExposureFreqChartData}
                                        title="Unwanted Noise Frequency" options={{ maintainAspectRatio: false }}
                                        onItemClick={(item: { name: string; count: number }) => handleChartItemClick("Unwanted Noise Frequency", { label: item.name, value: item.count })}
                                    />
                                </StatsChartCard>
                                <StatsChartCard title="Most Common Sounds Heard">
                                    <BarChartDisplay
                                        data={commonSoundsChartData}
                                        title="Common Sounds" options={{ indexAxis: 'y', maintainAspectRatio: false }}
                                        onItemClick={(item: { name: string; count: number }) => handleChartItemClick("Common Sounds", { label: item.name, value: item.count })}
                                    />
                                </StatsChartCard>
                            </div>
                        </section>
                        {/* Noise Impact */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Noise Impact</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <StatsChartCard title="Focus/Sleep Disturbance Freq.">
                                    <BarChartDisplay
                                        data={focusChartData}
                                        title="Focus/Sleep Disturbance" options={{ maintainAspectRatio: false }}
                                        onItemClick={(item: { name: string; count: number }) => handleChartItemClick("Focus/Sleep Disturbance", { label: item.name, value: item.count })}
                                    />
                                </StatsChartCard>
                                <StatsChartCard title="Headphone Use Frequency (1-10)">
                                    <BarChartDisplay
                                        data={headphoneFreqChartData}
                                        title="Headphone Use (1-10)" options={{ maintainAspectRatio: false }}
                                        onItemClick={(item: { name: string; count: number }) => handleChartItemClick("Headphone Use", { label: item.name, value: item.count })}
                                    />
                                </StatsChartCard>
                                <StatsChartCard title="Noise Annoyance Threshold">
                                    <BarChartDisplay
                                        data={botherLevelChartData}
                                        title="Annoyance Threshold" options={{ maintainAspectRatio: false }}
                                        onItemClick={(item: { name: string; count: number }) => handleChartItemClick("Annoyance Threshold", { label: item.name, value: item.count })}
                                    />
                                </StatsChartCard>
                            </div>
                        </section>
                        {/* Community Opinion */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Community Opinion</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatsChartCard title="Is Noise Pollution Taken Seriously?">
                                    <PieChartDisplay
                                        data={seriousnessChartData}
                                        title="Seriousness View"
                                        onItemClick={(item: { name: string; value: number }) => handleChartItemClick("Seriousness View", { label: item.name, value: item.value })}
                                    />
                                </StatsChartCard>
                                <StatsChartCard title="Interest in Real-time Noise Map">
                                    <PieChartDisplay
                                        data={mapInterestChartData}
                                        title="Map Interest"
                                        onItemClick={(item: { name: string; value: number }) => handleChartItemClick("Map Interest", { label: item.name, value: item.value })}
                                    />
                                </StatsChartCard>
                                <StatsChartCard title="Willingness to Contribute Data">
                                    <PieChartDisplay
                                        data={citizenScientistChartData}
                                        title="Contribution Willingness"
                                        onItemClick={(item: { name: string; value: number }) => handleChartItemClick("Contribution Willingness", { label: item.name, value: item.value })}
                                    />
                                </StatsChartCard>
                            </div>
                        </section>
                        {/* Feature Preferences */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Feature Preferences</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <StatsChartCard title="Most Preferred Feature (Ranked #1)">
                                    <BarChartDisplay
                                        data={topFeatureChartData}
                                        title="Top Ranked Feature" options={{ indexAxis: 'y', maintainAspectRatio: false }}
                                        onItemClick={(item: { name: string; count: number }) => handleChartItemClick("Top Ranked Feature", { label: item.name, value: item.count })}
                                    />
                                </StatsChartCard>
                            </div>
                        </section>
                    </>
                )}
            </div>

            {/* --- Submission Detail Modal --- */}
            {isDetailModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300" onClick={closeDetailModal} >
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 relative" onClick={(e) => e.stopPropagation()} >
                        <button onClick={closeDetailModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-3xl leading-none" aria-label="Close modal" > &times; </button>
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white pr-8">
                            Submission: {selectedSubmission?.name?.trim() || 'Anonymous'}
                            {selectedSubmission && (<span className="block text-sm font-normal text-gray-500 dark:text-gray-400 mt-1"> {new Date(selectedSubmission.createdAt).toLocaleString()} </span>)}
                        </h2>
                        {loadingDetails ? (
                            <div className="flex justify-center items-center h-32"> <p className="text-gray-600 dark:text-gray-300 animate-pulse">Loading details...</p> </div>
                        ) : detailError ? (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"> <strong className="font-bold">Error:</strong> <span className="block sm:inline"> {detailError}</span> </div>

                            // *** FIX: Manually render the fields you care about ***
                        ) : selectedSubmission ? (
                            <div className="space-y-3 text-sm sm:text-base">
                                <DetailRow label="Name" value={selectedSubmission.name} />
                                <DetailRow label="Submitted At" value={new Date(selectedSubmission.createdAt).toLocaleString()} />
                                <DetailRow label="Age Group" value={selectedSubmission.ageGroup} />
                                <DetailRow label="Occupation" value={selectedSubmission.occupation} />
                                <DetailRow label="Noise Exposure Freq." value={selectedSubmission.noiseExposureFreq} />
                                <DetailRow label="Noise Locations" value={selectedSubmission.noiseSourceLocations} />
                                <DetailRow label="Common Sounds" value={selectedSubmission.commonNoiseSources} />
                                {/* *** FIX: Use correct field name and label *** */}
                                <DetailRow label="Focus/Sleep Disturbance" value={selectedSubmission.focusDisturbance} />
                                <DetailRow label="Headphone Freq." value={selectedSubmission.headphoneFreq ? `${selectedSubmission.headphoneFreq} / 10` : 'N/A'} />
                                <DetailRow label="Bother Level" value={selectedSubmission.botherLabel ? `${selectedSubmission.botherLabel} (${selectedSubmission.botherLevel}dB)` : (selectedSubmission.botherLevel || 'N/A')} />
                                <DetailRow label="Community Seriousness" value={selectedSubmission.communitySeriousness} />
                                <DetailRow label="Map Interest" value={selectedSubmission.mapInterest} />
                                <DetailRow label="Will Contribute" value={selectedSubmission.citizenScientist} />
                                <DetailRow label="Feature Priorities" value={selectedSubmission.featurePriorities} />
                            </div>
                        ) : (<p className="text-yellow-500">Could not load submission details.</p>)}
                    </motion.div>
                </div>
            )}

            {/* --- NEW Chart Detail Modal --- */}
            {isChartModalOpen && chartModalContent && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4 transition-opacity duration-300" onClick={closeChartModal} >
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()} >
                        <button onClick={closeChartModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-3xl leading-none" aria-label="Close modal" > &times; </button>
                        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white pr-8">
                            {chartModalContent.title}
                        </h2>
                        <div className="mt-4 space-y-2 text-gray-800 dark:text-gray-200">
                            <p>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Option:</span>
                                {/* Apply line clamp for potentially long labels/details */}
                                <span className="block mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded line-clamp-5">
                                    {chartModalContent.label || 'N/A'}
                                </span>
                            </p>
                            <p>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Value:</span>
                                <span className="ml-2 font-semibold">{String(chartModalContent.value)}</span>
                                {/* You might add units like ' submissions' here */}
                            </p>
                            {chartModalContent.details && (
                                <p>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Details:</span>
                                    <span className="block mt-1 text-sm text-gray-500 dark:text-gray-300 line-clamp-5">{chartModalContent.details}</span>
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

        </main>
    );
}


// --- Helper Components ---
// Defined outside the default export
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
// Renamed ChartCard to avoid conflict
function StatsChartCard({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                {title}
            </h2>
            <div className="h-64 sm:h-80 relative">
                {children || <div className="flex items-center justify-center h-full text-gray-400">Loading chart...</div>}
            </div>
        </div>
    );
}

