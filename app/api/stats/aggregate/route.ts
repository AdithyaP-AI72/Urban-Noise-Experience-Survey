import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission'; // Adjust path if needed

// Helper function to run aggregation and handle potential errors
async function runAggregation(pipeline: any[], description: string) {
    try {
        const result = await Submission.aggregate(pipeline);
        return result;
    } catch (error) {
        console.error(`Error aggregating ${description}:`, error);
        // Return empty array or throw, depending on how you want to handle partial failures
        return []; // Return empty on error for this example
    }
}


// GET handler to fetch all aggregated stats
export async function GET() {
    try {
        await dbConnect();

        // --- Fetch all aggregations concurrently ---
        const [
            avgHeadphoneResult,
            occupationData,
            ageGroupData,
            noiseLocationData,
            noiseExposureFreqData,
            commonSoundsData,
            focusData,
            headphoneFreqDistribution,
            botherLevelData,
            seriousnessData,
            mapInterestData,
            citizenScientistData,
            topFeatureData,
        ] = await Promise.all([
            // Average Headphone Use
            runAggregation([{ $group: { _id: null, avgValue: { $avg: '$headphoneFreq' } } }], 'Avg Headphone Use'),
            // Occupation Counts
            runAggregation([
                { $group: { _id: '$occupation', count: { $sum: 1 } } },
                // *** FIX: Use $nin to check for null AND empty string ***
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { count: -1 } },
            ], 'Occupation'),
            // Age Group Counts
            runAggregation([
                { $group: { _id: '$ageGroup', count: { $sum: 1 } } },
                // *** FIX: Use $nin ***
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { _id: 1 } },
            ], 'Age Group'),
            // Noise Locations (Unwind)
            runAggregation([
                { $match: { noiseSourceLocations: { $exists: true, $ne: null, $not: { $size: 0 } } } },
                { $unwind: '$noiseSourceLocations' },
                { $group: { _id: '$noiseSourceLocations', count: { $sum: 1 } } },
                // *** FIX: Use $nin ***
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { count: -1 } },
            ], 'Noise Locations'),
            // Noise Exposure Frequency Counts (with custom sort)
            runAggregation([
                { $group: { _id: '$noiseExposureFreq', count: { $sum: 1 } } },
                // *** FIX: Use $nin ***
                { $match: { _id: { $nin: [null, ''] } } },
                { $addFields: { order: { $switch: { branches: [{ case: { $eq: ["$_id", "Rarely"] }, then: 1 }, { case: { $eq: ["$_id", "Sometimes"] }, then: 2 }, { case: { $eq: ["$_id", "Often"] }, then: 3 }, { case: { $eq: ["$_id", "Very Often"] }, then: 4 }, { case: { $eq: ["$_id", "Constantly"] }, then: 5 },], default: 99 } } } },
                { $sort: { order: 1 } },
            ], 'Noise Exposure Freq'),
            // Common Sounds (Unwind)
            runAggregation([
                { $match: { commonNoiseSources: { $exists: true, $ne: null, $not: { $size: 0 } } } },
                { $unwind: '$commonNoiseSources' },
                { $group: { _id: '$commonNoiseSources', count: { $sum: 1 } } },
                // *** FIX: Use $nin ***
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { count: -1 } },
            ], 'Common Sounds'),
            // Focus Disturbance Counts (with custom sort)
            runAggregation([
                { $group: { _id: '$focusDisturbance', count: { $sum: 1 } } },
                // *** FIX: Use $nin ***
                { $match: { _id: { $nin: [null, ''] } } },
                { $addFields: { order: { $switch: { branches: [{ case: { $eq: ["$_id", "Rarely"] }, then: 1 }, { case: { $eq: ["$_id", "Sometimes"] }, then: 2 }, { case: { $eq: ["$_id", "Often"] }, then: 3 }, { case: { $eq: ["$_id", "Almost Always"] }, then: 4 },], default: 99 } } } },
                { $sort: { order: 1 } },
            ], 'Focus Disturbance'),
            // Headphone Frequency Distribution
            runAggregation([
                { $group: { _id: '$headphoneFreq', count: { $sum: 1 } } },
                // $nin can check for null numbers too
                { $match: { _id: { $nin: [null] } } },
                { $sort: { _id: 1 } },
            ], 'Headphone Freq Dist'),
            // Bother Level Counts (group by label, sort by level)
            runAggregation([
                { $group: { _id: '$botherLabel', level: { $first: '$botherLevel' }, count: { $sum: 1 } } },
                // *** FIX: Use $nin ***
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { level: 1 } },
            ], 'Bother Level'),
            // Community Seriousness Counts
            runAggregation([
                { $group: { _id: '$communitySeriousness', count: { $sum: 1 } } },
                // *** FIX: Use $nin ***
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { count: -1 } },
            ], 'Community Seriousness'),
            // Map Interest Counts
            runAggregation([
                { $group: { _id: '$mapInterest', count: { $sum: 1 } } },
                // *** FIX: Use $nin ***
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { count: -1 } },
            ], 'Map Interest'),
            // Citizen Scientist Counts
            runAggregation([
                { $group: { _id: '$citizenScientist', count: { $sum: 1 } } },
                // *** FIX: Use $nin ***
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { count: -1 } },
            ], 'Citizen Scientist'),
            // Top Feature Preference (#1 Rank) Counts
            runAggregation([
                { $match: { featurePriorities: { $exists: true, $ne: null, $not: { $size: 0 } } } },
                { $group: { _id: { $first: '$featurePriorities' }, count: { $sum: 1 } } },
                // *** FIX: Use $nin ***
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { count: -1 } },
            ], 'Top Feature'),
        ]);

        // --- Format results ---
        const averageHeadphoneFreq = avgHeadphoneResult[0]?.avgValue?.toFixed(1) || 'N/A';
        const topOccupation = occupationData[0]?._id || 'N/A';

        // Structure data for easy consumption on the client
        const aggregatedData = {
            averageHeadphoneFreq,
            topOccupation,
            ageGroupData,
            occupationData, // Include full occupation data for list/chart
            noiseLocationData,
            noiseExposureFreqData,
            commonSoundsData,
            focusData,
            headphoneFreqDistribution,
            botherLevelData,
            seriousnessData,
            mapInterestData,
            citizenScientistData,
            topFeatureData,
        };

        return NextResponse.json({ success: true, data: aggregatedData });

    } catch (error) {
        console.error('Error fetching aggregated stats:', error);
        const message = error instanceof Error ? error.message : 'An unknown server error occurred';
        return NextResponse.json({ success: false, message: 'Server error while fetching aggregated stats' }, { status: 500 });
    }
}