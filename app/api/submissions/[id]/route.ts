import { NextResponse } from 'next/server';
import mongoose, { Types } from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Submission, { ISubmission } from '@/models/Submission'; // Import ISubmission interface

interface Context {
    params: Promise<{ id: string; }> | { id: string; };
}

// GET handler to fetch a single submission by ID
export async function GET(req: Request, context: Context) {
    let id: string | undefined; // Initialize id as potentially undefined

    try {
        // Await the params object if it's a Promise
        const resolvedParams = context.params instanceof Promise ? await context.params : context.params;
        id = resolvedParams.id; // Assign id here

        console.log(`[GET /api/submissions/${id || 'undefined'}] Received request`);

        // --- Validation ---
        // Now id is guaranteed to be assigned (or undefined if params didn't resolve correctly)
        if (!id || typeof id !== 'string') {
            console.error(`[GET /api/submissions/] Error: ID is missing or invalid after resolving params. Received:`, id);
            return NextResponse.json({ success: false, message: 'Submission ID is missing or invalid' }, { status: 400 });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error(`[GET /api/submissions/${id}] Error: Invalid ObjectId format: ${id}`);
            return NextResponse.json({ success: false, message: 'Invalid submission ID format' }, { status: 400 });
        }
        // --- End Validation ---

        await dbConnect();
        console.log(`[GET /api/submissions/${id}] Database connected. Searching...`);

        // Use .lean() to get a plain JS object
        const submission = await Submission.findById(id).lean();

        // --- Robust Check ---
        // Use type guards and checks that work with the inferred type from .lean()
        if (!submission || typeof submission !== 'object' || Array.isArray(submission) || !submission._id || !submission.createdAt) {
            console.log(`[GET /api/submissions/${id}] Submission not found or invalid structure.`);
            const status = submission === null ? 404 : 500;
            const message = submission === null ? 'Submission not found' : 'Invalid submission data structure retrieved';
            return NextResponse.json({ success: false, message }, { status });
        }
        console.log(`[GET /api/submissions/${id}] Submission found.`);

        // Type assertion is less critical now due to runtime checks, but helps guide TS slightly
        // Note: .lean() returns plain JS objects, _id might be ObjectId or string depending on version/config
        const safeSubmission = submission as any; // Use 'any' or a looser type after runtime checks

        // Prepare the data for JSON response
        const submissionObject = {
            ...safeSubmission,
            // Ensure _id is converted to string consistently
            _id: typeof safeSubmission._id === 'object' && safeSubmission._id.toString ? safeSubmission._id.toString() : String(safeSubmission._id),
            // Ensure createdAt is converted to ISO string consistently
            createdAt: safeSubmission.createdAt instanceof Date ? safeSubmission.createdAt.toISOString() : String(safeSubmission.createdAt),
            // Add transformations for other Date fields if necessary
        };

        return NextResponse.json({ success: true, data: submissionObject }, { status: 200 });

    } catch (error) {
        // Use the id variable which is now in scope
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