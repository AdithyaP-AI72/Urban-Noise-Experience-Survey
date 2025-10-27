// FILE: components/survey/steps/Step4_Locations.tsx

"use client";

import SurveyStep from '../SurveyStep';
import { FormData } from '../data';

type Props = {
    formData: FormData;
    handleAnswer: (key: keyof FormData, value: any, autoAdvance?: boolean) => void;
    onNextStep: () => void;
    error: string | null;
    setError: (error: string | null) => void;
};

export default function Step4_Locations({ formData, handleAnswer, onNextStep, error, setError }: Props) {
    const handleNext = async () => {
        if (formData.noiseSourceLocations.length === 0) {
            setError('Please select at least one location.');
            return;
        }
        setError(null);
        await onNextStep();
    };

    return (
        <SurveyStep stepKey="step-4">
            <div className="w-full space-y-6">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
                    🔊 Where do you experience the most noise?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Tap all the noisy spots on your daily map:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { label: 'Home', icon: '🏠' },
                        { label: 'Commute', icon: '🚗' },
                        { label: 'College/Work', icon: '🏢' },
                        { label: 'Metro/Bus Stop', icon: '🚇' },
                        { label: 'Construction', icon: '🏗️' },
                    ].map(({ label, icon }) => {
                        const selected = formData.noiseSourceLocations.includes(label);
                        return (
                            <button
                                key={label}
                                onClick={(e) => {
                                    if (error) setError(null);
                                    const updated = selected
                                        ? formData.noiseSourceLocations.filter((l) => l !== label)
                                        : [...formData.noiseSourceLocations, label];
                                    handleAnswer('noiseSourceLocations', updated, false);
                                    const el = e.currentTarget;
                                    el.classList.remove('animate-bounceOnce');
                                    void el.offsetWidth;
                                    el.classList.add('animate-bounceOnce');
                                }}
                                className={`flex items-start justify-start gap-3 p-4 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer w-full max-w-md ${selected
                                    ? 'bg-green-200 border-green-500 text-green-800'
                                    : 'bg-gray-100 dark:bg-gray-800 hover:border-green-400'
                                    }`}
                            >
                                <span className="text-2xl mt-1 flex-shrink-0">{icon}</span>
                                <span className="text-lg font-medium text-left flex-1 break-words whitespace-normal">
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                <button
                    onClick={handleNext}
                    className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
                >
                    Next
                </button>
            </div>
        </SurveyStep>
    );
}