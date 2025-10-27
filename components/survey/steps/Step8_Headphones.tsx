// FILE: components/survey/steps/Step8_Headphones.tsx

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

export default function Step8_Headphones({ formData, handleAnswer, onNextStep, stopCurrentSound }: Props) {
    return (
        <SurveyStep stepKey="step-8">
            <div className="w-full space-y-6 flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4"> 🎧 How often do you use headphones to block out city noise? </h2>
                <CompassDial
                    options={Array.from({ length: 10 }, (_, i) => String(i + 1))}
                    value={String(formData.headphoneFreq)}
                    onChange={(val) => handleAnswer('headphoneFreq', parseInt(val), false)}
                    stopCurrentSound={stopCurrentSound}
                />
                <button onClick={onNextStep} className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">
                    Next
                </button>
            </div>
        </SurveyStep>
    );
}