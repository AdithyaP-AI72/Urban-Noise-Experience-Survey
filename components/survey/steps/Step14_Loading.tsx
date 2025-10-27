// FILE: components/survey/steps/Step14_Loading.tsx

"use client";

import { motion } from 'framer-motion';

type Props = {
    loadingMessage: string | null;
    onCancelClick: () => void; // *** ADDED: New prop for the handler ***
};

export default function Step14_Loading({ loadingMessage, onCancelClick }: Props) { // *** ADDED: Destructure prop ***
    return (
        <motion.div
            key="step-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center flex flex-col items-center justify-center h-96"
        >
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-4">
                {loadingMessage}
            </p>
            <button
                onClick={onCancelClick} // *** CHANGED: Use the prop handler ***
                className="w-full max-w-xs sm:max-w-sm px-4 py-2 text-sm sm:text-base font-semibold bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition break-words whitespace-normal text-center"
            >
                Cancel Upload (click if you dare!)
            </button>
        </motion.div>
    );
}