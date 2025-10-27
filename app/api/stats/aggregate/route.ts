import { NextRequest, NextResponse } from 'next/server'; // Import NextRequest
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission'; // Adjust path if needed

// Helper function to run aggregation and handle potential errors
async function runAggregation(pipeline: any[], description: string) {
    try {
        console.log(`[AGGREGATE /api/stats/aggregate] Running aggregation for: ${description}`);
        const result = await Submission.aggregate(pipeline);
        console.log(`[AGGREGATE /api/stats/aggregate] Finished aggregation for: ${description}, results: ${result.length}`);
        return result;
    } catch (error) {
        console.error(`[AGGREGATE /api/stats/aggregate] Error aggregating ${description}:`, error);
        return []; // Return empty on error
    }
}


// GET handler to fetch all aggregated stats
export async function GET(request: NextRequest) { // Use NextRequest
    try {
        await dbConnect();

        // --- Read query parameter ---
        const { searchParams } = new URL(request.url);
        // Default to true if parameter is missing or not explicitly 'false'
        const includeDuplicates = searchParams.get('includeDuplicates') !== 'false';

        console.log(`[GET /api/stats/aggregate] Fetching stats. Include duplicates: ${includeDuplicates}`);

        // --- Define the base filter stage ---
        const initialMatchStage = includeDuplicates ? {} : { $match: { isDuplicate: { $ne: true } } };
        // Create an array for the initial match stage, empty if including duplicates
        const initialMatchPipeline = includeDuplicates ? [] : [initialMatchStage];

        // --- Fetch all aggregations concurrently, adding the initial match stage ---
        const [
            totalCountResult, // *** Fetch total count separately ***
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
            // *** Get Total Count based on filter ***
            Submission.countDocuments(initialMatchStage.$match || {}).catch(err => {
                console.error("Error counting documents:", err);
                return 0; // Default to 0 on error
            }),
            // Average Headphone Use
            runAggregation([...initialMatchPipeline, { $group: { _id: null, avgValue: { $avg: '$headphoneFreq' } } }], 'Avg Headphone Use'),
            // Occupation Counts
            runAggregation([
                ...initialMatchPipeline,
                { $group: { _id: '$occupation', count: { $sum: 1 } } },
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { count: -1 } },
            ], 'Occupation'),
            // Age Group Counts
            runAggregation([
                ...initialMatchPipeline,
                { $group: { _id: '$ageGroup', count: { $sum: 1 } } },
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { _id: 1 } },
            ], 'Age Group'),
            // Noise Locations (Unwind)
            runAggregation([
                ...initialMatchPipeline,
                { $match: { noiseSourceLocations: { $exists: true, $ne: null, $not: { $size: 0 } } } },
                { $unwind: '$noiseSourceLocations' },
                { $group: { _id: '$noiseSourceLocations', count: { $sum: 1 } } },
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { count: -1 } },
            ], 'Noise Locations'),
            // Noise Exposure Frequency Counts (with custom sort)
            runAggregation([
                ...initialMatchPipeline,
                { $group: { _id: '$noiseExposureFreq', count: { $sum: 1 } } },
                { $match: { _id: { $nin: [null, ''] } } },
                { $addFields: { order: { $switch: { branches: [{ case: { $eq: ["$_id", "Rarely"] }, then: 1 }, { case: { $eq: ["$_id", "Sometimes"] }, then: 2 }, { case: { $eq: ["$_id", "Often"] }, then: 3 }, { case: { $eq: ["$_id", "Very Often"] }, then: 4 }, { case: { $eq: ["$_id", "Constantly"] }, then: 5 },], default: 99 } } } },
                { $sort: { order: 1 } },
            ], 'Noise Exposure Freq'),
            // Common Sounds (Unwind)
            runAggregation([
                ...initialMatchPipeline,
                { $match: { commonNoiseSources: { $exists: true, $ne: null, $not: { $size: 0 } } } },
                { $unwind: '$commonNoiseSources' },
                { $group: { _id: '$commonNoiseSources', count: { $sum: 1 } } },
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { count: -1 } },
            ], 'Common Sounds'),
            // Focus Disturbance Counts (with custom sort)
            runAggregation([
                ...initialMatchPipeline,
                { $group: { _id: '$focusDisturbance', count: { $sum: 1 } } },
                { $match: { _id: { $nin: [null, ''] } } },
                { $addFields: { order: { $switch: { branches: [{ case: { $eq: ["$_id", "Rarely"] }, then: 1 }, { case: { $eq: ["$_id", "Sometimes"] }, then: 2 }, { case: { $eq: ["$_id", "Often"] }, then: 3 }, { case: { $eq: ["$_id", "Almost Always"] }, then: 4 },], default: 99 } } } },
                { $sort: { order: 1 } },
            ], 'Focus Disturbance'),
            // Headphone Frequency Distribution
            runAggregation([
                ...initialMatchPipeline,
                { $group: { _id: '$headphoneFreq', count: { $sum: 1 } } },
                { $match: { _id: { $nin: [null] } } },
                { $sort: { _id: 1 } },
            ], 'Headphone Freq Dist'),
            // Bother Level Counts (group by label, sort by level)
            runAggregation([
                ...initialMatchPipeline,
                { $group: { _id: '$botherLabel', level: { $first: '$botherLevel' }, count: { $sum: 1 } } },
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { level: 1 } },
            ], 'Bother Level'),
            // Community Seriousness Counts
            runAggregation([
                ...initialMatchPipeline,
                { $group: { _id: '$communitySeriousness', count: { $sum: 1 } } },
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { count: -1 } },
            ], 'Community Seriousness'),
            // Map Interest Counts
            runAggregation([
                ...initialMatchPipeline,
                { $group: { _id: '$mapInterest', count: { $sum: 1 } } },
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { count: -1 } },
            ], 'Map Interest'),
            // Citizen Scientist Counts
            runAggregation([
                ...initialMatchPipeline,
                { $group: { _id: '$citizenScientist', count: { $sum: 1 } } },
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { count: -1 } },
            ], 'Citizen Scientist'),
            // Top Feature Preference (#1 Rank) Counts
            runAggregation([
                ...initialMatchPipeline,
                { $match: { featurePriorities: { $exists: true, $ne: null, $not: { $size: 0 } } } },
                { $group: { _id: { $first: '$featurePriorities' }, count: { $sum: 1 } } },
                { $match: { _id: { $nin: [null, ''] } } },
                { $sort: { count: -1 } },
            ], 'Top Feature'),
        ]);

        // --- Format results ---
        const totalSubmissions = typeof totalCountResult === 'number' ? totalCountResult : 0; // Use fetched count
        const averageHeadphoneFreq = avgHeadphoneResult[0]?.avgValue?.toFixed(1) || 'N/A';
        const topOccupation = occupationData[0]?._id || 'N/A';

        // Structure data for easy consumption on the client
        const aggregatedData = {
            totalSubmissions, // *** Use fetched total count ***
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

        console.log(`[GET /api/stats/aggregate] Successfully aggregated data. Total submissions (filtered): ${totalSubmissions}`);
        return NextResponse.json({ success: true, data: aggregatedData });

    } catch (error) {
        console.error('[GET /api/stats/aggregate] Error fetching aggregated stats:', error);
        const message = error instanceof Error ? error.message : 'An unknown server error occurred';
        return NextResponse.json({ success: false, message: 'Server error while fetching aggregated stats' }, { status: 500 });
    }
}