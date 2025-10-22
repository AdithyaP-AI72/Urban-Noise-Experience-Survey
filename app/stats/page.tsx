import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission';

// This forces the page to be dynamic and fetch new data on every visit
export const revalidate = 0;

// Helper function to get stats from the DB
async function getStats() {
    try {
        await dbConnect();

        // 1. Get total submission count
        const submissionCount = await Submission.countDocuments();

        // 2. Get stats by occupation
        const occupationData = await Submission.aggregate([
            { $group: { _id: '$occupation', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        // 3. Get average noise rating
        const avgNoiseResult = await Submission.aggregate([
            { $group: { _id: null, avgRating: { $avg: '$noiseRating' } } },
        ]);

        const averageNoiseRating = avgNoiseResult[0]?.avgRating.toFixed(1) || 'N/A';

        return {
            submissionCount,
            occupationData,
            averageNoiseRating,
            error: null,
        };
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        if (error instanceof Error) {
            return { error: error.message, submissionCount: 0, occupationData: [], averageNoiseRating: 'N/A' };
        }
        return { error: 'An unknown error occurred', submissionCount: 0, occupationData: [], averageNoiseRating: 'N/A' };
    }
}

// Reusable Stat Card Component
function StatCard({ title, value }: { title: string, value: string | number }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {title}
            </h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {value}
            </p>
        </div>
    );
}

// The main stats page
export default async function StatsPage() {
    const { submissionCount, occupationData, averageNoiseRating, error } =
        await getStats();

    if (error) {
        return (
            <main className="flex min-h-screen flex-col items-center p-24 bg-red-50 text-red-700">
                <h1 className="text-4xl font-bold mb-8">Error Loading Stats</h1>
                <p>{error}</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 sm:p-12">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
                    📊 SoundScape Stats Dashboard
                </h1>

                {/* Top-level stat cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Total Submissions" value={submissionCount} />
                    <StatCard title="Avg. Noise Rating" value={`${averageNoiseRating} / 5`} />

                    {/* ----- THIS IS THE FIXED LINE ----- */}
                    <StatCard title="Top Occupation" value={occupationData?.[0]?._id || 'N/A'} />

                </div>

                {/* Detailed breakdown */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                        Submissions by Occupation
                    </h2>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {/* This map function is already safe because of the 'occupationData &&' check */}
                        {occupationData && occupationData.map((item: any) => (
                            <li key={item._id} className="flex justify-between items-center py-4">
                                <span className="text-lg text-gray-700 dark:text-gray-300">{item._id}</span>
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">{item.count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </main>
    );
}