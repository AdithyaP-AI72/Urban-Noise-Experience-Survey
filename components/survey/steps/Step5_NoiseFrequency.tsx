// FILE: components/survey/steps/Step5_NoiseFrequency.tsx

"use client";

import SurveyStep from '../SurveyStep';
import CompassDial from '@/components/CompassDial'; // Assuming this path is correct
import { FormData } from '../data';

type Props = {
    formData: FormData;
    handleAnswer: (key: keyof FormData, value: any, autoAdvance?: boolean) => void;
    onNextStep: () => void;
    stopCurrentSound: () => void;
};

export default function Step5_NoiseFrequency({ formData, handleAnswer, onNextStep, stopCurrentSound }: Props) {
    return (
        <SurveyStep stepKey="step-5">
            <div className="w-full space-y-6 flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4"> 📊 How often do you experience unwanted noise around you? </h2>
                <CompassDial
                    options={['Rarely', 'Sometimes', 'Often', 'Very Often', 'Constantly']}
                    value={formData.noiseExposureFreq}
                    onChange={(val) => handleAnswer('noiseExposureFreq', val, false)}
                    stopCurrentSound={stopCurrentSound}
                />
                <button onClick={onNextStep} className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">
                    Next
                </button>
            </div>
        </SurveyStep>
    );
}