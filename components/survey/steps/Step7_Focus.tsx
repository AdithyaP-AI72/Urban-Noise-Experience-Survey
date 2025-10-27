// FILE: components/survey/steps/Step7_Focus.tsx

"use client";

import SurveyStep from '../SurveyStep';
import { FormData } from '../data';

type Props = {
    formData: FormData;
    handleAnswer: (key: keyof FormData, value: any, autoAdvance?: boolean) => void;
};

export default function Step7_Focus({ formData, handleAnswer }: Props) {
    return (
        <SurveyStep stepKey="step-7">
            <div className="w-full space-y-6">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4"> 😣 How often does noise disturb your focus or sleep? </h2>
                <div className="grid grid-cols-2 gap-4">
                    {['Rarely', 'Sometimes', 'Often', 'Almost Always'].map((option) => (
                        <button
                            key={option}
                            onClick={async () => await handleAnswer('focusDisturbance', option, true)}
                            className={`p-4 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer ${formData.focusDisturbance === option ? 'bg-green-200 border-green-500 text-green-800' : 'bg-gray-100 dark:bg-gray-800 hover:border-green-400'}`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </SurveyStep>
    );
}