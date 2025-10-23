import mongoose, { Document, Schema } from 'mongoose';

// Define the structure of the survey data
export interface ISubmission extends Document {
    name?: string; // Added optional name field
    ageGroup?: string;
    occupation?: string;
    noiseExposureFreq?: string;
    noiseSourceLocations?: string[];
    commonNoiseSources?: string[];
    focusDisturbance?: string;
    sleepEffect?: string;
    stressEffect?: string;
    headphoneFreq?: number;
    botherLevel?: number;
    botherLabel?: string;
    communitySeriousness?: string;
    mapInterest?: string;
    citizenScientist?: string;
    featurePriorities?: string[];
    createdAt: Date;
}

// Create the Mongoose Schema
const SubmissionSchema: Schema = new Schema({
    name: { type: String }, // Added name field
    ageGroup: { type: String },
    occupation: { type: String },
    noiseExposureFreq: { type: String },
    noiseSourceLocations: { type: [String] },
    commonNoiseSources: { type: [String] },
    focusDisturbance: { type: String },
    sleepEffect: { type: String }, // Ensure these are in your schema if in FormData
    stressEffect: { type: String }, // Ensure these are in your schema if in FormData
    headphoneFreq: { type: Number },
    botherLevel: { type: Number },
    botherLabel: { type: String },
    communitySeriousness: { type: String },
    mapInterest: { type: String },
    citizenScientist: { type: String },
    featurePriorities: { type: [String] },
    createdAt: { type: Date, default: Date.now },
});

// Prevent model re-compilation in Next.js dev mode
export default mongoose.models.Submission ||
    mongoose.model<ISubmission>('Submission', SubmissionSchema);
