import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
// Keep imports for potential future use, but comment out DB ones if not needed now
// import dbConnect from '@/lib/dbConnect';
// import Submission, { ISubmission } from '@/models/Submission';

interface Context {
    params: Promise<{ id: string; }> | { id: string; };
}

// GET handler - Temporarily simplified
export async function GET(req: Request, context: Context) {
    let id: string | undefined;

    try {
        const resolvedParams = context.params instanceof Promise ? await context.params : context.params;
        id = resolvedParams.id;

        console.log(`[TEMP GET /api/submissions/${id || 'undefined'}] Received request`);

        // --- Basic Validation ---
        if (!id || typeof id !== 'string') {
            console.error(`[TEMP GET /api/submissions/] Error: ID is missing or invalid. Received:`, id);
            return NextResponse.json({ success: false, message: 'Submission ID is missing or invalid' }, { status: 400 });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error(`[TEMP GET /api/submissions/${id}] Error: Invalid ObjectId format: ${id}`);
            return NextResponse.json({ success: false, message: 'Invalid submission ID format' }, { status: 400 });
        }
        // --- End Validation ---

        // --- Temporarily Commented Out Database Logic ---
        /*
        await dbConnect();
        console.log(`[GET /api/submissions/${id}] Database connected. Searching...`);

        const submission = await Submission.findById(id).lean();

        if (!submission || typeof submission !== 'object' || Array.isArray(submission) || !submission._id || !submission.createdAt) {
            console.log(`[GET /api/submissions/${id}] Submission not found or invalid structure.`);
            const status = submission === null ? 404 : 500;
            const message = submission === null ? 'Submission not found' : 'Invalid submission data structure retrieved';
            return NextResponse.json({ success: false, message }, { status });
        }
        console.log(`[GET /api/submissions/${id}] Submission found.`);

        const safeSubmission = submission as (ISubmission & { _id: mongoose.Types.ObjectId | string, createdAt: Date | string });

        const submissionObject = {
            ...safeSubmission,
            _id: safeSubmission._id.toString(),
            createdAt: safeSubmission.createdAt instanceof Date ? safeSubmission.createdAt.toISOString() : String(safeSubmission.createdAt),
        };

        return NextResponse.json({ success: true, data: submissionObject }, { status: 200 });
        */
        // --- End Commented Out Logic ---

        // --- Return Placeholder Response ---
        console.warn(`[TEMP GET /api/submissions/${id}] Database logic is commented out. Returning placeholder.`);
        // Return a 501 Not Implemented or a dummy success=false
         return NextResponse.json({ success: false, message: 'Fetching details is temporarily disabled.' }, { status: 501 });
        // Or return dummy data if your frontend expects it:
        // return NextResponse.json({
        //     success: true,
        //     data: { _id: id, name: "Placeholder", createdAt: new Date().toISOString() /* add other fields as needed */ }
        // }, { status: 200 });
        // --- End Placeholder ---

    } catch (error) {
        // Log errors during parameter resolution or validation
        const errorId = typeof id === 'string' ? id : 'unknown';
        console.error(`[TEMP GET /api/submissions/${errorId}] Server error:`, error);
        const message = error instanceof Error ? error.message : 'An unknown server error occurred';
        return NextResponse.json({ success: false, message: 'Server error in submission detail route' }, { status: 500 });
    }
}

// Fallback for other methods remains the same
export async function fallback(req: Request) {
    const headers = new Headers();
    headers.set('Allow', 'GET');
    return NextResponse.json(
        { success: false, message: `Method ${req.method} Not Allowed` },
        { status: 405, headers }
    );
}
export { fallback as POST, fallback as PUT, fallback as DELETE, fallback as PATCH };

