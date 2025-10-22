import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission';

export async function POST(req: Request) {
    try {
        // 1. Get the survey data from the request
        const body = await req.json();

        // 2. Connect to the database
        await dbConnect();

        // 3. Create a new submission document
        await Submission.create(body);

        // 4. Send a success response
        return NextResponse.json(
            { success: true, message: 'Submission received!' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error in submission API:', error);
        // Send an error response
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { success: false, message: 'An unknown error occurred' },
            { status: 500 }
        );
    }
}