// FILE: components/survey/data.ts

// --- Form Data & Types ---
export type FeatureItem = {
    id: string;
    name: string;
    description: string;
    icon: string;
};

export type FormData = {
    name: string;
    ageGroup: string;
    occupation: string;
    noiseExposureFreq: string;
    noiseSourceLocations: string[];
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
    isDuplicate: boolean;
};

export const defaultFormData: FormData = {
    name: '',
    ageGroup: '',
    occupation: '',
    noiseExposureFreq: 'Rarely',
    noiseSourceLocations: [],
    commonNoiseSources: [],
    focusDisturbance: '',
    sleepEffect: '',
    stressEffect: '',
    headphoneFreq: 1,
    botherLevel: 40,
    botherLabel: 'Library quiet (40dB)',
    communitySeriousness: '',
    mapInterest: '',
    citizenScientist: '',
    featurePriorities: ['Noise Heatmaps', 'Quieter Routes', 'Noise Forecasts', 'Report & Learn Tool'],
    isDuplicate: false,
};

export const allFeatures: FeatureItem[] = [
    { id: 'feat-1', name: 'Noise Heatmaps', description: 'Visualizes current levels using KSPCB data', icon: '' },
    { id: 'feat-2', name: 'Quieter Routes', description: 'Suggests low-noise travel paths', icon: '' },
    { id: 'feat-3', name: 'Noise Forecasts', description: 'Predicts future levels by time & traffic', icon: '' },
    { id: 'feat-4', name: 'Report & Learn Tool', description: 'Lets users report noise and learn health impacts', icon: '' },
];