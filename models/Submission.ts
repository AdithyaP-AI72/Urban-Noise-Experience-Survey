import mongoose, { Document, Schema, Types } from 'mongoose';

// Define the structure of the survey data
export interface ISubmission extends Document {
    name?: string; // Optional
    ageGroup: string;
    occupation: string;
    noiseExposureFreq: string;
    noiseSourceLocations: string[];
    commonNoiseSources: string[];
    focusDisturbance: string; // This is the correct field
    headphoneFreq: number;
    botherLevel: number;
    botherLabel: string;
    communitySeriousness: string;
    mapInterest: string;
    citizenScientist: string;
    featurePriorities: string[];
    createdAt: Date;
    _id: Types.ObjectId; // Explicitly adding for clarity
    isDuplicate?: boolean; // *** ADD isDuplicate field ***
}

// Create the Mongoose Schema
const SubmissionSchema: Schema = new Schema({
    name: { type: String }, // Name is optional
    ageGroup: { type: String, required: true },
    occupation: { type: String, required: true },
    noiseExposureFreq: { type: String, required: true },
    noiseSourceLocations: { type: [String], default: [] },
    commonNoiseSources: { type: [String], default: [] },
    focusDisturbance: { type: String, required: true }, // Correct field
    headphoneFreq: { type: Number, required: true },
    botherLevel: { type: Number, required: true },
    botherLabel: { type: String, required: true },
    communitySeriousness: { type: String, required: true },
    mapInterest: { type: String, required: true },
    citizenScientist: { type: String, required: true },
    featurePriorities: { type: [String], required: true },
    createdAt: { type: Date, default: Date.now },
    // *** ADD isDuplicate schema field ***
    // Default to false if not provided, don't hide it by default
    isDuplicate: { type: Boolean, default: false },
});

export default mongoose.models.Submission ||
    mongoose.model<ISubmission>('Submission', SubmissionSchema);