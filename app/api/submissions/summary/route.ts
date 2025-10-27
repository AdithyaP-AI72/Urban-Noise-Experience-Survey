import { NextRequest, NextResponse } from 'next/server'; // Import NextRequest
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission'; // Adjust path if needed

// GET handler to fetch summaries (_id, name, createdAt, isDuplicate)
export async function GET(request: NextRequest) { // Use NextRequest to access URL parameters
    try {
        await dbConnect();

        // --- Read query parameter ---
        const { searchParams } = new URL(request.url);
        // Default to true if parameter is missing or not explicitly 'false'
        const includeDuplicates = searchParams.get('includeDuplicates') !== 'false';

        console.log(`[GET /api/submissions/summary] Fetching summaries. Include duplicates: ${includeDuplicates}`);

        // --- Build filter based on query parameter ---
        const filter = includeDuplicates ? {} : { isDuplicate: { $ne: true } };

        // Fetch only the necessary fields, sort by newest first
        // *** FIX: Select isDuplicate field ***
        const summaries = await Submission.find(filter, '_id name createdAt isDuplicate')
            .sort({ createdAt: -1 }) // Show newest first
            .limit(200); // Limit results for performance

        // Ensure createdAt is sent as a string (JSON compatible)
        const formattedSummaries = summaries.map(doc => ({
            _id: doc._id.toString(),
            name: doc.name,
            createdAt: doc.createdAt.toISOString(), // Convert Date to ISO string
            isDuplicate: doc.isDuplicate, // *** Include isDuplicate ***
        }));

        console.log(`[GET /api/submissions/summary] Found ${formattedSummaries.length} summaries.`);
        return NextResponse.json({ success: true, data: formattedSummaries });

    } catch (error) {
        console.error('[GET /api/submissions/summary] Error fetching summaries:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch summaries';
        // Ensure a JSON response even on error
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}

// Optional: Add basic error handling for non-GET methods if needed
export async function fallback(req: Request) {
    const headers = new Headers();
    headers.set('Allow', 'GET');
    return NextResponse.json(
        { success: false, message: `Method ${req.method} Not Allowed` },
        { status: 405, headers }
    );
}

export { fallback as POST, fallback as PUT, fallback as DELETE, fallback as PATCH };