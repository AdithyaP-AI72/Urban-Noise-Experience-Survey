import mongoose, { Document, Schema, Types } from 'mongoose';

// Define the structure of the survey data
export interface ISubmission extends Document {
    name?: string; // Optional
    ageGroup: string; // Required by form
    occupation: string; // Required by form
    noiseExposureFreq: string; // Required by form
    noiseSourceLocations: string[]; // Required (can be empty array if validated)
    commonNoiseSources: string[]; // Required (can be empty array if validated)
    focusDisturbance: string; // Required by form
    sleepEffect: string; // Add if you have this question
    stressEffect: string; // Add if you have this question
    headphoneFreq: number; // Required by form
    botherLevel: number; // Required by form
    botherLabel: string; // Required by form
    communitySeriousness: string; // Required by form
    mapInterest: string; // Required by form
    citizenScientist: string; // Required by form
    featurePriorities: string[]; // Required by form
    createdAt: Date;
    _id: Types.ObjectId;
}

// Create the Mongoose Schema - align 'required' with Zod schema
const SubmissionSchema: Schema = new Schema({
    name: { type: String }, // Name is optional
    ageGroup: { type: String, required: true },
    occupation: { type: String, required: true },
    noiseExposureFreq: { type: String, required: true },
    noiseSourceLocations: { type: [String], default: [] }, // Default to empty array
    commonNoiseSources: { type: [String], default: [] }, // Default to empty array
    focusDisturbance: { type: String, required: true },
    sleepEffect: { type: String }, // Add if present
    stressEffect: { type: String }, // Add if present
    headphoneFreq: { type: Number, required: true },
    botherLevel: { type: Number, required: true },
    botherLabel: { type: String, required: true },
    communitySeriousness: { type: String, required: true },
    mapInterest: { type: String, required: true },
    citizenScientist: { type: String, required: true },
    featurePriorities: { type: [String], required: true }, // Should always have 4 items
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Submission ||
    mongoose.model<ISubmission>('Submission', SubmissionSchema);