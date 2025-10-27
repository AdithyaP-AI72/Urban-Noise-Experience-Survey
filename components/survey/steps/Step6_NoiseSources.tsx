// FILE: components/survey/steps/Step6_NoiseSources.tsx

"use client";

import React from 'react';
import SurveyStep from '../SurveyStep';
import { FormData } from '../data';

type Props = {
    formData: FormData;
    handleAnswer: (key: keyof FormData, value: any, autoAdvance?: boolean) => void;
    onNextStep: () => void;
    error: string | null;
    setError: (error: string | null) => void;
    stopCurrentSound: () => void;
    audioRef: React.MutableRefObject<HTMLAudioElement | null>;
};

export default function Step6_NoiseSources({ formData, handleAnswer, onNextStep, error, setError, stopCurrentSound, audioRef }: Props) {

    const handleNext = async () => {
        if (formData.commonNoiseSources.length === 0) {
            setError('Please select at least one sound source.');
            return;
        }
        setError(null);
        await onNextStep();
    };

    return (
        <SurveyStep stepKey="step-6">
            <div className="w-full space-y-6">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
                    🔉 What are the most common sounds around you?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Tap to hear and select the sounds you encounter most.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { label: 'Traffic', icon: '🚗', audio: '/sounds/traffic.mp3' },
                        { label: 'Construction', icon: '🏗️', audio: '/sounds/construction.mp3' },
                        { label: 'Loudspeakers', icon: '📢', audio: '/sounds/loudspeaker.mp3' },
                        { label: 'Neighbours', icon: '🏘️', audio: '/sounds/neighbours.mp3' },
                        { label: 'Metro/Trains', icon: '🚇', audio: '/sounds/train.mp3' },
                        { label: 'Others (listen at your own risk)', icon: '🎶', audio: '/sounds/rickroll.mp3' },
                    ].map(({ label, icon, audio }) => {
                        const selected = formData.commonNoiseSources.includes(label);
                        return (
                            <button
                                key={label}
                                onClick={() => {
                                    if (error) setError(null);
                                    stopCurrentSound();
                                    const updated = selected
                                        ? formData.commonNoiseSources.filter((s) => s !== label)
                                        : [...formData.commonNoiseSources, label];
                                    handleAnswer('commonNoiseSources', updated, false);
                                    if (!selected) {
                                        try {
                                            const sound = new Audio(audio);
                                            sound.play().catch((e) =>
                                                console.error('Error playing sound:', audio, e)
                                            );
                                            audioRef.current = sound;
                                        } catch (e) {
                                            console.error('Error creating Audio object:', audio, e);
                                        }
                                    }
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