// FILE: components/survey/steps/Step0_Start.tsx

"use client";

import SurveyStep from '../SurveyStep';

type Props = {
    onNextStep: () => void;
};

export default function Step0_Start({ onNextStep }: Props) {
    return (
        <SurveyStep stepKey="step-0" animation="fade">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4"> How does your city sound? 🔊 </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8"> Help us build a 'Noise Profile' of our community.<br /> It's fast, interactive, and makes a real difference. </p>
            <button onClick={onNextStep} className="px-10 py-4 text-xl font-bold bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 cursor-pointer">
                Start the Survey
            </button>
        </SurveyStep>
    );
}