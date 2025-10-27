// FILE: components/survey/steps/Step9_BotherLevel.tsx

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

export default function Step9_BotherLevel({ formData, handleAnswer, onNextStep, stopCurrentSound }: Props) {
    const options = [
        'Library quiet (40dB)', 'Conversation (50dB)', 'Busy café (60dB)',
        'Street traffic (70dB)', 'Honking (80dB)', 'Construction (90dB)',
        'Loud music (100dB)', 'Jackhammer (110dB)'
    ];

    const botherMap: { [key: string]: number } = {
        'Library quiet (40dB)': 40, 'Conversation (50dB)': 50, 'Busy café (60dB)': 60,
        'Street traffic (70dB)': 70, 'Honking (80dB)': 80, 'Construction (90dB)': 90,
        'Loud music (100dB)': 100, 'Jackhammer (110dB)': 110,
    };

    const handleChange = (label: string) => {
        handleAnswer('botherLabel', label, false);
        handleAnswer('botherLevel', botherMap[label] || 40, false);
    };

    return (
        <SurveyStep stepKey="step-9">
            <div className="w-full space-y-6 flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4"> 📶 At what point does noise start to bother you? </h2>
                <CompassDial
                    options={options}
                    value={formData.botherLabel}
                    onChange={handleChange}
                    stopCurrentSound={stopCurrentSound}
                />
                <button onClick={onNextStep} className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">
                    Next
                </button>
            </div>
        </SurveyStep>
    );
}