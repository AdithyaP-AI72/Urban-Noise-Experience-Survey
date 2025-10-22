// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
    try {
        await dbConnect();
        return NextResponse.json({ message: 'Success: Connected to MongoDB!' });
    } catch (error) {
        console.error('Connection error:', error);
        return NextResponse.json(
            { error: 'Error: Could not connect to MongoDB.' },
            { status: 500 }
        );
    }
}