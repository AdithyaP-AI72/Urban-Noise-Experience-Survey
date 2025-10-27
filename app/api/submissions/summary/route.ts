// FILE: app/api/submissions/summary/route.ts

import { NextRequest, NextResponse } from 'next/server'; // Import NextRequest
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission'; // Adjust path if needed

export async function GET(request: NextRequest) { // Use NextRequest
    try {
        await dbConnect();

        // --- Read query parameter ---
        const { searchParams } = new URL(request.url);
        const includeDuplicates = searchParams.get('includeDuplicates') !== 'false'; // Defaults to true

        console.log(`[GET /api/submissions/summary] Include duplicates: ${includeDuplicates}`);

        // --- Build filter based on query parameter ---
        const filter = includeDuplicates ? {} : { isDuplicate: { $ne: true } }; // <-- APPLY FILTER

        // --- Select isDuplicate field ---
        const summaries = await Submission.find(
            filter, // <-- Use the filter here
            '_id name createdAt isDuplicate' // <-- Select isDuplicate
        )
            .sort({ createdAt: -1 })
            .limit(200);

        const formattedSummaries = summaries.map(doc => ({
            _id: doc._id.toString(),
            name: doc.name,
            createdAt: doc.createdAt.toISOString(),
            isDuplicate: doc.isDuplicate, // <-- Include isDuplicate in response
        }));

        console.log(`[GET /api/submissions/summary] Found ${formattedSummaries.length} summaries.`);
        return NextResponse.json({ success: true, data: formattedSummaries });

    } catch (error) {
        console.error('[GET /api/submissions/summary] Error fetching summaries:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch summaries';
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}

// Fallback methods...
export async function fallback(req: Request) {
    const headers = new Headers();
    headers.set('Allow', 'GET');
    return NextResponse.json(
        { success: false, message: `Method ${req.method} Not Allowed` },
        { status: 405, headers }
    );
}
export { fallback as POST, fallback as PUT, fallback as DELETE, fallback as PATCH };