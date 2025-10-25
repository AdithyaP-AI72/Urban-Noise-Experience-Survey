import { NextResponse } from 'next/server';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z, ZodError } from 'zod'; // Import Zod
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission';
import { headers } from "next/headers"; // To get IP address on Vercel Edge

// --- Define Allowed Values ---
const ageGroups = ['Below 18', '18-22', '23-30', '31-45', '45+'] as const;
const occupations = ['Student', 'Working professional', 'Homemaker', 'Other'] as const;
const noiseLocations = ['Home', 'Commute', 'College/Work', 'Metro/Bus Stop', 'Construction'] as const;
const noiseExposureFreqs = ['Rarely', 'Sometimes', 'Often', 'Very Often', 'Constantly'] as const;
const commonSounds = ['Traffic', 'Construction', 'Loudspeakers', 'Neighbours', 'Metro/Trains', 'Others (listen at your own risk)'] as const;
const focusDisturbances = ['Rarely', 'Sometimes', 'Often', 'Almost Always'] as const;
// Add sleepEffect and stressEffect options if you have those questions
const botherLabels = [
    'Library quiet (40dB)', 'Conversation (50dB)', 'Busy café (60dB)',
    'Street traffic (70dB)', 'Honking (80dB)', 'Construction (90dB)',
    'Loud music (100dB)', 'Jackhammer (110dB)'
] as const;
const communitySeriousnessOptions = ['Yes, definitely', 'Somewhat', 'Not really', 'Not sure'] as const;
const mapInterestOptions = ['Yes, very useful', 'Maybe', 'Not really useful', 'No, not at all'] as const;
const citizenScientistOptions = ['Yes, definitely', 'Maybe, occasionally', 'Unlikely', 'No, not interested'] as const;
const featureNames = ['Noise Heatmaps', 'Quieter Routes', 'Noise Forecasts', 'Report & Learn Tool'] as const;

// --- Zod Schema Definition ---
// This defines the expected structure and allowed values for the submission data
const submissionSchema = z.object({
    name: z.string().max(100).optional(), // Optional, max 100 chars
    ageGroup: z.enum(ageGroups),
    occupation: z.enum(occupations),
    noiseExposureFreq: z.enum(noiseExposureFreqs),
    noiseSourceLocations: z.array(z.enum(noiseLocations)).default([]), // Allow empty array
    commonNoiseSources: z.array(z.enum(commonSounds)).default([]), // Allow empty array
    focusDisturbance: z.enum(focusDisturbances),
    // sleepEffect: z.enum(['Yes, significantly', 'Slightly', 'Not much', 'Not at all']), // Example
    // stressEffect: z.enum(['Yes, frequently', 'Occasionally', 'Never']), // Example
    headphoneFreq: z.number().min(1).max(10),
    botherLevel: z.number().min(40).max(110), // Ensure level matches label range
    botherLabel: z.enum(botherLabels),
    communitySeriousness: z.enum(communitySeriousnessOptions),
    mapInterest: z.enum(mapInterestOptions),
    citizenScientist: z.enum(citizenScientistOptions),
    // Ensure exactly 4 features are present and they are the correct ones
    featurePriorities: z.array(z.enum(featureNames))
        .length(4, { message: "Must include exactly 4 features." })
        .refine((items) => new Set(items).size === items.length, {
            message: 'Feature priorities must be unique.',
        }),
});

// --- Rate Limiting Setup (Upstash) ---
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(5, "15 s"), // Allow 5 requests per 15 seconds per IP
        analytics: true,
        prefix: "@upstash/ratelimit",
    });
} else {
    console.warn("Upstash Redis environment variables not set. Rate limiting disabled.");
}

// --- API Route Handler ---
export async function POST(req: Request) {
    // --- Rate Limiting Check ---
    if (ratelimit) {
        const ip = headers().get("x-forwarded-for") ?? headers().get("x-real-ip") ?? "unknown";
        try {
            const { success, limit, remaining, reset } = await ratelimit.limit(ip);
            console.log("Rate limit check for IP:", ip, { success, remaining });

            if (!success) {
                return NextResponse.json(
                    { success: false, message: "Too many requests. Please try again later." },
                    { status: 429 } // 429 Too Many Requests
                );
            }
        } catch (error) {
            console.error("Rate limiting error:", error);
            // Decide if you want to block or allow if rate limiter fails
            // return NextResponse.json({ success: false, message: "Rate limiter error." }, { status: 500 });
        }
    } else {
        console.log("Rate limiting skipped (not configured).");
    }

    // --- Input Validation ---
    let validatedData;
    try {
        const body = await req.json();
        // Validate the request body against the Zod schema
        validatedData = submissionSchema.parse(body);
        console.log("Submission data passed validation.");

    } catch (error) {
        console.error('Validation error:', error);
        if (error instanceof ZodError) {
            // Return detailed validation errors
            return NextResponse.json(
                { success: false, message: "Invalid submission data.", errors: error.errors },
                { status: 400 } // 400 Bad Request
            );
        }
        // Handle other errors during body parsing
        return NextResponse.json(
            { success: false, message: "Error parsing request body." },
            { status: 400 }
        );
    }

    // --- Database Insertion ---
    try {
        await dbConnect();
        // Create a new submission document using the *validated* data
        await Submission.create(validatedData);
        console.log("Submission saved successfully.");

        return NextResponse.json(
            { success: true, message: 'Submission received!' },
            { status: 201 } // 201 Created
        );
    } catch (error) {
        console.error('Error saving submission to DB:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred during saving.';
        return NextResponse.json(
            { success: false, message: `Database error: ${message}` },
            { status: 500 } // 500 Internal Server Error
        );
    }
}

// Optional: Add basic error handling for non-POST methods
export async function fallback(req: Request) {
    const headersList = new Headers();
    headersList.set('Allow', 'POST');
    return NextResponse.json(
        { success: false, message: `Method ${req.method} Not Allowed` },
        { status: 405, headers: headersList }
    );
}
export { fallback as GET, fallback as PUT, fallback as DELETE, fallback as PATCH };