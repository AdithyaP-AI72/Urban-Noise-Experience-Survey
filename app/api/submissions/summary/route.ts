import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission'; // Adjust path if needed

// GET handler to fetch summaries (_id, name, createdAt)
export async function GET() {
    try {
        await dbConnect();

        // Fetch only the necessary fields, sort by newest first
        const summaries = await Submission.find({}, '_id name createdAt')
                                          .sort({ createdAt: -1 }) // Show newest first
                                          .limit(200); // Limit results for performance

        // Ensure createdAt is sent as a string (JSON compatible)
        const formattedSummaries = summaries.map(doc => ({
            _id: doc._id.toString(),
            name: doc.name,
            createdAt: doc.createdAt.toISOString(), // Convert Date to ISO string
        }));

        return NextResponse.json({ success: true, data: formattedSummaries });

    } catch (error) {
        console.error('Error fetching summaries:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch summaries';
        // Ensure a JSON response even on error
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}

// Optional: Add basic error handling for non-GET methods if needed
export async function fallback(req: Request) {
    return NextResponse.json({ success: false, message: `Method ${req.method} Not Allowed` }, { status: 405 });
}

export { fallback as POST, fallback as PUT, fallback as DELETE, fallback as PATCH };
