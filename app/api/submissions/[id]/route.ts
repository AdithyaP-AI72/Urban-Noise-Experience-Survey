import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission'; // Adjust path if needed

// Define context type for route segment parameters
// In newer Next.js versions, context itself might not directly contain params
// Instead, the params are often passed as the second argument directly.
// Let's adjust the signature slightly for clarity, though `context.params` might still work if awaited.
interface RouteParams {
    id: string;
}

// GET handler to fetch a single submission by ID
// The context object contains the params property which might be a promise.
// Or sometimes the params object is passed directly as the second argument.
// We will access context.params and await it if necessary,
// or adjust if the signature differs in your specific Next.js setup.
export async function GET(req: Request, { params }: { params: RouteParams }) {
    // Directly access id from the destructured params argument
    const { id } = params; // No need to await here if destructured correctly

    // --- Validation remains the same ---
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error(`Invalid ID format received: ${id}`); // Log the invalid ID
        return NextResponse.json({ success: false, message: 'Invalid submission ID format' }, { status: 400 });
    }

    try {
        await dbConnect(); // Connect to the database

        // Find the submission by its MongoDB ObjectId
        const submission = await Submission.findById(id).lean(); // Use .lean() for a plain JS object

        if (!submission) {
            return NextResponse.json({ success: false, message: 'Submission not found' }, { status: 404 });
        }

        // Prepare the data for JSON response (convert ObjectId, Dates)
        const submissionObject = {
            ...submission,
            _id: submission._id.toString(), // Ensure _id is a string
            // Ensure createdAt exists and is a Date before calling toISOString
            createdAt: submission.createdAt instanceof Date ? submission.createdAt.toISOString() : submission.createdAt,
            // Add any other necessary transformations here if needed
        };


        // Return the found submission data
        return NextResponse.json({ success: true, data: submissionObject }, { status: 200 });

    } catch (error) {
        console.error('Error fetching submission:', error);
        const message = error instanceof Error ? error.message : 'An unknown server error occurred';
        // Provide a generic server error message
        return NextResponse.json({ success: false, message: 'Server error while fetching submission' }, { status: 500 });
    }
}

// Optional: Add basic error handling for non-GET methods if needed
export async function fallback(req: Request) {
    // Set appropriate headers for method not allowed
    const headers = new Headers();
    headers.set('Allow', 'GET'); // Specify allowed method(s)
    return NextResponse.json(
        { success: false, message: `Method ${req.method} Not Allowed` },
        { status: 405, headers }
    );
}

// Export fallback handlers for other methods
export { fallback as POST, fallback as PUT, fallback as DELETE, fallback as PATCH };

