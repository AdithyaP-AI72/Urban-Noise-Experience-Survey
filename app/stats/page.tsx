// app/stats/page.tsx
import dbConnect from '@/lib/dbConnect';
// We will create this model in the next step
// import Submission from '@/models/Submission';

async function getStats() {
    // --- THIS IS A PLACEHOLDER ---
    // We'll add the real database logic here later
    // For now, let's just pretend we fetched some data.
    const submissionCount = 150;
    const averageRating = 4.2;

    // Example of what you WILL do:
    // await dbConnect();
    // const submissionCount = await Submission.countDocuments();

    return { submissionCount, averageRating };
}


export default async function StatsPage() {
    const { submissionCount, averageRating } = await getStats();

    return (
        <main className="flex min-h-screen flex-col items-center p-24">
            <h1 className="text-4xl font-bold mb-8">SoundScape Stats Dashboard</h1>

            <div className="text-left p-6 border rounded-lg">
                <h2 className="text-2xl mb-4">Live Data</h2>
                <p className="text-lg">
                    <strong>Total Submissions:</strong> {submissionCount}
                </p>
                <p className="text-lg">
                    <strong>Average Noise Rating:</strong> {averageRating} / 5
                </p>
            </div>

            <p className="mt-8 text-sm text-gray-400">
                Only you and your team can see this page.
            </p>
        </main>
    );
}

// This tells Next.js not to cache this page, so the data is always fresh.
export const revalidate = 0;