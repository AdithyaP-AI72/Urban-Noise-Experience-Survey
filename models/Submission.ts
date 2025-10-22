import mongoose, { Document, Schema } from 'mongoose';

// Define the structure of the survey data
export interface ISubmission extends Document {
    ageGroup: string;
    occupation: string;
    noiseExposureFreq: string;
    noiseSourceLocations: string[];
    noiseRating: number;
    commonNoiseSources: string[];
    focusDisturbance: string;
    sleepEffect: string;
    stressEffect: string;
    headphoneFreq: number;
    botherLevel: number;
    botherLabel: string;
    communitySeriousness: string;
    mapInterest: string;
    citizenScientist: string;
    featurePriorities: string[];
    createdAt: Date;
}

// Create the Mongoose Schema
const SubmissionSchema: Schema = new Schema({
    ageGroup: { type: String, required: true },
    occupation: { type: String, required: true },
    noiseExposureFreq: { type: String, required: true },
    noiseSourceLocations: { type: [String], required: true },
    noiseRating: { type: Number, required: true },
    commonNoiseSources: { type: [String], required: true },
    focusDisturbance: { type: String, required: true },
    sleepEffect: { type: String, required: true },
    stressEffect: { type: String, required: true },
    headphoneFreq: { type: Number, required: true },
    botherLevel: { type: Number, required: true },
    botherLabel: { type: String, required: true },
    communitySeriousness: { type: String, required: true },
    mapInterest: { type: String, required: true },
    citizenScientist: { type: String, required: true },
    featurePriorities: { type: [String], required: true },
    createdAt: { type: Date, default: Date.now },
});

// Prevent model re-compilation in Next.js dev mode
export default mongoose.models.Submission ||
    mongoose.model<ISubmission>('Submission', SubmissionSchema);