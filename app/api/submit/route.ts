// FILE: app/api/submit/route.ts

import { NextResponse } from 'next/server';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z, ZodError } from 'zod';
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission';

// --- Define Allowed Values (keep as before) ---
const ageGroups = ['Below 18', '18-22', '23-30', '31-45', '45+'] as const;
const occupations = ['Student', 'Working professional', 'Homemaker', 'Other'] as const;
const noiseLocations = ['Home', 'Commute', 'College/Work', 'Metro/Bus Stop', 'Construction'] as const;
const noiseExposureFreqs = ['Rarely', 'Sometimes', 'Often', 'Very Often', 'Constantly'] as const;
const commonSounds = ['Traffic', 'Construction', 'Loudspeakers', 'Neighbours', 'Metro/Trains', 'Others (listen at your own risk)'] as const;
const focusDisturbances = ['Rarely', 'Sometimes', 'Often', 'Almost Always'] as const;
const botherLabels = [ 'Library quiet (40dB)', 'Conversation (50dB)', 'Busy café (60dB)', 'Street traffic (70dB)', 'Honking (80dB)', 'Construction (90dB)', 'Loud music (100dB)', 'Jackhammer (110dB)' ] as const;
const communitySeriousnessOptions = ['Yes, definitely', 'Somewhat', 'Not really', 'Not sure'] as const;
const mapInterestOptions = ['Yes, very useful', 'Maybe', 'Not really useful', 'No, not at all'] as const;
const citizenScientistOptions = ['Yes, definitely', 'Maybe, occasionally', 'Unlikely', 'No, not interested'] as const;
const featureNames = ['Noise Heatmaps', 'Quieter Routes', 'Noise Forecasts', 'Report & Learn Tool'] as const;

// --- Zod Schema Definition ---
const submissionSchema = z.object({
    name: z.string().max(100).optional(),
    ageGroup: z.enum(ageGroups),
    occupation: z.enum(occupations),
    noiseExposureFreq: z.enum(noiseExposureFreqs),
    noiseSourceLocations: z.array(z.enum(noiseLocations)).default([]),
    commonNoiseSources: z.array(z.enum(commonSounds)).default([]),
    focusDisturbance: z.enum(focusDisturbances),
    sleepEffect: z.string().optional(), // Keep if needed, or remove if truly unused
    stressEffect: z.string().optional(),// Keep if needed, or remove if truly unused
    headphoneFreq: z.number().min(1).max(10),
    botherLevel: z.number().min(40).max(110),
    botherLabel: z.enum(botherLabels),
    communitySeriousness: z.enum(communitySeriousnessOptions),
    mapInterest: z.enum(mapInterestOptions),
    citizenScientist: z.enum(citizenScientistOptions),
    featurePriorities: z.array(z.enum(featureNames))
        .length(4, { message: "Must include exactly 4 features." })
        .refine((items) => new Set(items).size === items.length, {
            message: 'Feature priorities must be unique.',
        }),
    // *** FIX: Add isDuplicate to the Zod schema ***
    isDuplicate: z.boolean().optional(), // Allow boolean, make it optional
});

// --- Rate Limiting Setup (keep as before) ---
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(5, "15 s"), // Allow 5 requests per 15 seconds
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
        const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown_ip";
        const identifier = typeof ip === 'string' ? ip : 'unknown_ip_source';

        try {
            const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
            console.log("Rate limit check for IP:", identifier, { success, remaining });

            if (!success) {
                return NextResponse.json(
                    { success: false, message: "Too many requests. Please try again later." },
                    { status: 429 }
                );
            }
        } catch (error) {
            console.error("Rate limiting error:", error);
            // Allow request if rate limiter fails, but log it
        }
    } else {
        console.log("Rate limiting skipped (not configured).");
    }

    // --- Input Validation ---
    let validatedData;
    let rawBody; // Keep raw body for logging
    try {
        rawBody = await req.json(); // Read body first
        console.log("[POST /api/submit] Received Raw Body:", rawBody); // Log raw body
        validatedData = submissionSchema.parse(rawBody); // Then validate
        // Log validated data, especially isDuplicate
        console.log("[POST /api/submit] Validated Data (includes isDuplicate?):", validatedData);

    } catch (error) {
        console.error('[POST /api/submit] Validation error:', error);
        if (error instanceof ZodError) {
            return NextResponse.json(
                { success: false, message: "Invalid submission data.", errors: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, message: "Error parsing request body." },
            { status: 400 }
        );
    }

    // --- Database Insertion ---
    try {
        await dbConnect();
        // validatedData now includes isDuplicate (if it was sent and is boolean)
        const newSubmission = await Submission.create(validatedData);
        console.log("[POST /api/submit] Submission saved successfully. ID:", newSubmission._id, "Is Duplicate:", newSubmission.isDuplicate);

        return NextResponse.json(
            { success: true, message: 'Submission received!', data: { id: newSubmission._id } }, // Optionally return ID
            { status: 201 }
        );
    } catch (error) {
        console.error('[POST /api/submit] Error saving submission to DB:', error);
        const message = error instanceof Error ? error.message : 'Unknown DB error.';
        return NextResponse.json(
            { success: false, message: `Database error: ${message}` },
            { status: 500 }
        );
    }
}

// --- Fallback Methods (keep as before) ---
export async function fallback(req: Request) {
    const headersList = new Headers();
    headersList.set('Allow', 'POST');
    return NextResponse.json(
        { success: false, message: `Method ${req.method} Not Allowed` },
        { status: 405, headers: headersList }
    );
}
export { fallback as GET, fallback as PUT, fallback as DELETE, fallback as PATCH };