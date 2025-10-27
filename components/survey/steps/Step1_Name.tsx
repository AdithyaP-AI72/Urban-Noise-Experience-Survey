// FILE: components/survey/steps/Step1_Name.tsx

"use client";

import React from 'react';
import SurveyStep from '../SurveyStep';
import { FormData } from '../data';

type Props = {
    formData: FormData;
    handleAnswer: (key: keyof FormData, value: any, autoAdvance?: boolean) => void;
    handleNameSubmit: (e: React.FormEvent) => void;
    nameInputRef: React.RefObject<HTMLInputElement>;
    error: string | null;
    setError: (error: string | null) => void;
};

export default function Step1_Name({ formData, handleAnswer, handleNameSubmit, nameInputRef, error, setError }: Props) {
    return (
        <SurveyStep stepKey="step-1">
            <div className="w-full max-w-md mx-auto">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
                    👋 Let's start with your name
                </h2>
                <form onSubmit={handleNameSubmit} className="flex flex-col items-center gap-4">
                    <input
                        ref={nameInputRef}
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                            handleAnswer('name', e.target.value, false);
                            if (error) setError(null);
                        }}
                        placeholder="Please enter your name"
                        className={`w-full p-4 text-lg border rounded-lg shadow-sm focus:ring-2 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'}`}
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <button
                        type="submit"
                        className="px-8 py-3 mt-2 text-lg font-bold bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition cursor-pointer"
                    >
                        Next
                    </button>
                </form>
            </div>
        </SurveyStep>
    );
}