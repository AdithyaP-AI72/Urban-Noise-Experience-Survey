"use client"; // Needs to be a client component for state and interaction

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BarChartDisplay from '@/components/BarChartDisplay'; // Assuming you have these
import PieChartDisplay from '@/components/PieChartDisplay'; // Assuming you have these
// Import ISubmission if it's defined in your model file and needed for typing
// import { ISubmission } from '@/models/Submission';

// --- Interfaces ---
interface SubmissionSummary {
    _id: string;
    name?: string;
    createdAt: string; // Expect ISO string from API
}
interface SubmissionDetail { // Define structure based on what your API returns
    _id: string;
    name?: string;
    createdAt: string; // Expect ISO string
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
    // Add any other fields from your model/API
}
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
// For chart click modal
interface ChartModalContent {
    title: string;
    label: string;
    value: number | string;
    details?: string;
}

// --- Component ---
export default function StatsPageClient() {
    // --- State Variables ---
    const [loadingSummaries, setLoadingSummaries] = useState(true);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [summaries, setSummaries] = useState<SubmissionSummary[]>([]);

    const [loadingAggregated, setLoadingAggregated] = useState(true);
    const [aggregatedError, setAggregatedError] = useState<string | null>(null);
    const [aggregatedStats, setAggregatedStats] = useState<AggregatedStats | null>(null);

    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    const [isChartModalOpen, setIsChartModalOpen] = useState(false);
    const [chartModalContent, setChartModalContent] = useState<ChartModalContent | null>(null);

    // --- Data Fetching Effects ---
    useEffect(() => {
        const fetchSummaries = async () => {
            setLoadingSummaries(true);
            setSummaryError(null);
            try {
                const response = await fetch('/api/submissions/summary');
                if (!response.ok) {
                    const errorBody = await response.text(); throw new Error(`Summaries (${response.status}): ${errorBody || response.statusText}`);
                }
                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
                    const validSummaries = result.data.filter((sub: any) => sub && typeof sub._id === 'string' && /^[0-9a-fA-F]{24}$/.test(sub._id));
                    setSummaries(validSummaries);
                } else { throw new Error(result.message || 'Invalid summary data'); }
            } catch (err) {
                console.error("Error fetching summaries:", err); setSummaryError(err instanceof Error ? err.message : 'Unknown error');
            } finally { setLoadingSummaries(false); }
        };
        fetchSummaries();
    }, []);

    useEffect(() => {
        const fetchAggregatedStats = async () => {
            setLoadingAggregated(true);
            setAggregatedError(null);
            try {
                const response = await fetch('/api/stats/aggregate');
                if (!response.ok) {
                    const errorBody = await response.text(); throw new Error(`Aggregates (${response.status}): ${errorBody || response.statusText}`);
                }
                const result = await response.json();
                if (result.success) { setAggregatedStats(result.data); }
                else { throw new Error(result.message || 'Invalid aggregate data'); }
            } catch (err) {
                console.error("Error fetching aggregated stats:", err); setAggregatedError(err instanceof Error ? err.message : 'Unknown error');
            } finally { setLoadingAggregated(false); }
        };
        fetchAggregatedStats();
    }, []);

    // --- Modal Handlers ---
    const viewDetails = async (id: string) => {
        // Basic ID format check (client side)
        if (!id || typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
            const errorMsg = `Invalid ID format clicked: "${id}"`;
            console.error(errorMsg);
            setDetailError(errorMsg); // Show error in modal
            setIsDetailModalOpen(true);
            setSelectedSubmission(null);
            setLoadingDetails(false);
            return;
        }

        setIsDetailModalOpen(true);
        setLoadingDetails(true);
        setSelectedSubmission(null);
        setDetailError(null);
        try {
            console.log(`Fetching details for: /api/submissions/${id}`);
            const response = await fetch(`/api/submissions/${id}`); // Fetch from the specific ID route
            console.log(`Response status for ${id}: ${response.status}`);
            if (!response.ok) {
                let errorMsg = `Failed to fetch submission (${response.status})`;
                try { // Try to parse JSON error message from API
                    const errData = await response.json();
                    errorMsg = errData.message || errorMsg;
                } catch { /* Ignore if response is not JSON */ }
                throw new Error(errorMsg);
            }
            const result = await response.json();
            if (result.success && result.data) {
                console.log("Submission data received:", result.data);
                setSelectedSubmission(result.data);
            } else {
                throw new Error(result.message || `Could not find or parse submission ${id}`);
            }
        } catch (err) {
            console.error("Error in viewDetails fetch:", err);
            setDetailError(err instanceof Error ? err.message : 'Could not load submission details.');
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeDetailModal = () => { setIsDetailModalOpen(false); setSelectedSubmission(null); setDetailError(null); };

    // Chart click handler
    const handleChartItemClick = (chartTitle: string, itemData: { name: string; value?: number | string; count?: number; details?: string }) => {
        setChartModalContent({
            title: chartTitle,
            label: itemData.name,
            value: itemData.value ?? itemData.count ?? 'N/A',
            details: itemData.details
        });
        setIsChartModalOpen(true);
    };
    const closeChartModal = () => { setIsChartModalOpen(false); setChartModalContent(null); };

    // --- Render Logic ---
    if (loadingSummaries || loadingAggregated) { return <main className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900"><p className="text-gray-600 dark:text-gray-300 animate-pulse">Loading dashboard...</p></main>; }
    const displayError = summaryError || aggregatedError;
    if (displayError) { return <main className="min-h-screen flex items-center justify-center p-4 bg-red-50 text-red-700"><p>Error: {displayError}</p></main>; }

    // Format chart data (ensure aggregatedStats exists)
    const formatChartData = (dataArray: any[] | undefined | null, nameKey = '_id', valueKey = 'count') => { /* ... (keep as before) ... */
        if (!dataArray || !Array.isArray(dataArray)) return [];
        return dataArray.map((item: any) => ({
            name: item?.[nameKey] || 'Not Specified',
            value: typeof item?.[valueKey] === 'number' ? item[valueKey] : 0,
            count: typeof item?.[valueKey] === 'number' ? item[valueKey] : 0,
        }));
    };
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

    return (
        <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    📊 SoundScape Stats Dashboard
                </h1>

                {/* Top Stat Cards */}
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
                                            onClick={() => viewDetails(sub._id)}
                                            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded shadow transition flex-shrink-0 disabled:opacity-50"
                                            disabled={loadingDetails} // Disable button while loading details
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
                                    <PieChartDisplay data={ageGroupChartData} title="Age Group Distribution" onItemClick={(item) => handleChartItemClick("Age Group", { label: item.name, value: item.value })} />
                                </StatsChartCard>
                                <StatsChartCard title="Current Role">
                                    <PieChartDisplay data={occupationChartData} title="Current Role Distribution" onItemClick={(item) => handleChartItemClick("Current Role", { label: item.name, value: item.value })} />
                                </StatsChartCard>
                            </div>
                        </section>
                        {/* Noise Exposure */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Noise Exposure</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <StatsChartCard title="Most Common Noise Locations">
                                    <BarChartDisplay data={noiseLocationChartData} title="Noise Locations" options={{ indexAxis: 'y', maintainAspectRatio: false }} onItemClick={(item) => handleChartItemClick("Noise Locations", { label: item.name, value: item.count })} />
                                </StatsChartCard>
                                <StatsChartCard title="Frequency of Unwanted Noise">
                                    <BarChartDisplay data={noiseExposureFreqChartData} title="Unwanted Noise Frequency" options={{ maintainAspectRatio: false }} onItemClick={(item) => handleChartItemClick("Unwanted Noise Frequency", { label: item.name, value: item.count })} />
                                </StatsChartCard>
                                <StatsChartCard title="Most Common Sounds Heard">
                                    <BarChartDisplay data={commonSoundsChartData} title="Common Sounds" options={{ indexAxis: 'y', maintainAspectRatio: false }} onItemClick={(item) => handleChartItemClick("Common Sounds", { label: item.name, value: item.count })} />
                                </StatsChartCard>
                            </div>
                        </section>
                        {/* Noise Impact */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Noise Impact</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <StatsChartCard title="Focus/Sleep Disturbance Freq.">
                                    <BarChartDisplay data={focusChartData} title="Focus/Sleep Disturbance" options={{ maintainAspectRatio: false }} onItemClick={(item) => handleChartItemClick("Focus/Sleep Disturbance", { label: item.name, value: item.count })} />
                                </StatsChartCard>
                                <StatsChartCard title="Headphone Use Frequency (1-10)">
                                    <BarChartDisplay data={headphoneFreqChartData} title="Headphone Use (1-10)" options={{ maintainAspectRatio: false }} onItemClick={(item) => handleChartItemClick("Headphone Use", { label: item.name, value: item.count })} />
                                </StatsChartCard>
                                <StatsChartCard title="Noise Annoyance Threshold">
                                    <BarChartDisplay data={botherLevelChartData} title="Annoyance Threshold" options={{ maintainAspectRatio: false }} onItemClick={(item) => handleChartItemClick("Annoyance Threshold", { label: item.name, value: item.count })} />
                                </StatsChartCard>
                            </div>
                        </section>
                        {/* Community Opinion */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Community Opinion</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatsChartCard title="Is Noise Pollution Taken Seriously?">
                                    <PieChartDisplay data={seriousnessChartData} title="Seriousness View" onItemClick={(item) => handleChartItemClick("Seriousness View", { label: item.name, value: item.value })} />
                                </StatsChartCard>
                                <StatsChartCard title="Interest in Real-time Noise Map">
                                    <PieChartDisplay data={mapInterestChartData} title="Map Interest" onItemClick={(item) => handleChartItemClick("Map Interest", { label: item.name, value: item.value })} />
                                </StatsChartCard>
                                <StatsChartCard title="Willingness to Contribute Data">
                                    <PieChartDisplay data={citizenScientistChartData} title="Contribution Willingness" onItemClick={(item) => handleChartItemClick("Contribution Willingness", { label: item.name, value: item.value })} />
                                </StatsChartCard>
                            </div>
                        </section>
                        {/* Feature Preferences */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Feature Preferences</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <StatsChartCard title="Most Preferred Feature (Ranked #1)">
                                    <BarChartDisplay data={topFeatureChartData} title="Top Ranked Feature" options={{ indexAxis: 'y', maintainAspectRatio: false }} onItemClick={(item) => handleChartItemClick("Top Ranked Feature", { label: item.name, value: item.count })} />
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
                        ) : selectedSubmission ? (
                            <div className="space-y-3 text-sm sm:text-base">
                                {Object.entries(selectedSubmission).map(([key, value]) => {
                                    if (key === '__v') return null;
                                    let displayValue: React.ReactNode = '';
                                    if (key === 'createdAt' || key === 'updatedAt') { displayValue = new Date(value as string).toLocaleString(); }
                                    else if (Array.isArray(value)) { displayValue = value.length > 0 ? value.join(', ') : <span className="text-gray-400 italic">None selected</span>; }
                                    else if (value === '' || value === null || typeof value === 'undefined') { displayValue = <span className="text-gray-400 italic">Not answered</span>; }
                                    else { displayValue = String(value); }
                                    const formatKey = (s: string) => s.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    return (<div key={key} className="grid grid-cols-3 gap-2 border-b border-gray-200 dark:border-gray-700 py-2 last:border-b-0"> <dt className="font-medium text-gray-600 dark:text-gray-400 capitalize col-span-1">{formatKey(key)}:</dt> <dd className="text-gray-800 dark:text-gray-200 col-span-2 break-words">{displayValue}</dd> </div>);
                                })}
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
                            {/* Optionally display extra details if provided */}
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

// Helper components remain defined outside
// function StatCard...
// function StatsChartCard...


// --- Helper Components ---
// --- Helper Components ---
// Defined at the bottom of app/stats/page.tsx

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

function StatsChartCard({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                {title}
            </h2>
            {/* Adjust height as needed */}
            <div className="h-64 sm:h-80 relative">
                {children || <div className="flex items-center justify-center h-full text-gray-400">Loading chart...</div>}
            </div>
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

