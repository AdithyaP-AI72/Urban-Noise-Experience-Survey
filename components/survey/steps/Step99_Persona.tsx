// FILE: components/survey/steps/Step99_Persona.tsx

"use client";

import { motion } from 'framer-motion';
import { FormData } from '../data';

type Props = {
    formData: FormData;
    onShare: () => void;
    copyMessage: string;
};

// --- Persona Logic Based on Bother Level ---
function getNoisePersona(botherLevel: number) {
    // Based on "At what point does noise start to bother you?"
    // botherLevel is the dB value (40, 50, 60, 70, 80, 90, 100, 110)

    if (botherLevel <= 50) { // 40 or 50 dB
        return {
            name: '😴 Light Sleeper',
            description: '“I notice everything, even a whisper. Quiet is my sanctuary.”',
        };
    } else if (botherLevel <= 70) { // 60 or 70 dB
        return {
            name: '🏙️ City Wanderer',
            description: '“Life is a constant hum. I blend with chatter and engines, comfortably distracted.”',
        };
    } else if (botherLevel <= 90) { // 80 or 90 dB
        return {
            name: '🎖️ Noise Veteran',
            description: '“I’ve survived honks and drills. Loud but not reckless — I know my limits.”',
        };
    } else { // 100 or 110 dB
        return {
            name: '🤘 I\'m Deaf',
            description: '“Why would anyone choose this willingly? I thrive in chaos and ignore pain… mostly.”',
        };
    }
}

export default function Step99_Persona({ formData, onShare, copyMessage }: Props) {
    const persona = getNoisePersona(formData.botherLevel);
    const topFeature = formData.featurePriorities?.[0];

    return (
        <motion.div
            key="step-99"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
        >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-green-600">🎉 Thank You!</h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
                Your submission has been recorded.
            </p>

            {/* 🎭 Dynamic Persona */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-green-500">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
                    Your Noise Persona: {persona.name}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
                    {persona.description}
                </p>

                {/* 🎯 Contextual Tip */}
                {topFeature && (
                    <div className="mt-4 text-sm text-green-700 dark:text-green-300 italic">
                        Tip: Based on your preferences, try exploring <strong>{topFeature}</strong> to match your soundscape needs.
                    </div>
                )}
            </div>

            {/* --- SHARE SECTION --- */}
            <div className="mt-10">
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                    Enjoyed the experience? Share it with friends!
                </p>
                <button
                    onClick={onShare}
                    className="inline-flex items-center gap-3 px-6 py-3 font-bold bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    SHARE SOUNDSCAPE
                </button>
                {copyMessage && (
                    <p className="text-sm text-green-500 mt-3">{copyMessage}</p>
                )}
            </div>
        </motion.div>
    );
}