import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission'; // Adjust path if needed

// Define context type for route segment parameters
// The params object within the context might be a Promise
interface Context {
    params: Promise<{ // <<<--- Indicate params might be a Promise
        id: string;
    }> | { // Or a plain object
        id: string;
    };
}

// GET handler to fetch a single submission by ID
export async function GET(req: Request, context: Context) {
    let id: string;

    try {
        // *** FIX: Await the params object if it's a Promise ***
        // Check if params is a Promise (common in newer App Router patterns)
        const resolvedParams = context.params instanceof Promise ? await context.params : context.params;
        id = resolvedParams.id; // Extract id after potentially awaiting

        console.log(`[GET /api/submissions/${id || 'undefined'}] Received request`); // Log entry, handle potential undefined id early

        // --- Validation ---
        // 1. Check if ID exists and is a string AFTER awaiting
        if (!id || typeof id !== 'string') {
            console.error(`[GET /api/submissions/] Error: ID is missing or not a string after resolving params. Received:`, id);
            return NextResponse.json({ success: false, message: 'Submission ID is missing or invalid' }, { status: 400 });
        }
        // 2. Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error(`[GET /api/submissions/${id}] Error: Invalid ObjectId format: ${id}`);
            return NextResponse.json({ success: false, message: 'Invalid submission ID format' }, { status: 400 });
        }
        // --- End Validation ---

        await dbConnect();
        console.log(`[GET /api/submissions/${id}] Database connected. Searching...`);

        const submission = await Submission.findById(id).lean();

        if (!submission) {
            console.log(`[GET /api/submissions/${id}] Submission not found.`);
            return NextResponse.json({ success: false, message: 'Submission not found' }, { status: 404 });
        }
        console.log(`[GET /api/submissions/${id}] Submission found.`);


        // Prepare the data for JSON response
        const submissionObject = {
            ...submission,
            _id: submission._id.toString(),
            createdAt: submission.createdAt instanceof Date ? submission.createdAt.toISOString() : submission.createdAt,
            // Add transformations for other Date fields if necessary
        };

        return NextResponse.json({ success: true, data: submissionObject }, { status: 200 });

    } catch (error) {
        // Log error with potential ID value if available
        const errorId = typeof id === 'string' ? id : 'unknown';
        console.error(`[GET /api/submissions/${errorId}] Server error:`, error);
        const message = error instanceof Error ? error.message : 'An unknown server error occurred';
        return NextResponse.json({ success: false, message: 'Server error while fetching submission' }, { status: 500 });
    }
}

// Fallback for other methods
export async function fallback(req: Request) {
    const headers = new Headers();
    headers.set('Allow', 'GET');
    return NextResponse.json(
        { success: false, message: `Method ${req.method} Not Allowed` },
        { status: 405, headers }
    );
}
export { fallback as POST, fallback as PUT, fallback as DELETE, fallback as PATCH };

