// FILE: components/survey/steps/Step15_Sus.tsx

"use client";

import { motion } from 'framer-motion';

export default function Step15_Sus() {
    return (
        <motion.div
            key="step-15"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-center flex flex-col items-center justify-center h-96 w-full"
        >
            <img
                src="/images/sus.png" // Make sure this path is correct
                alt="Suspicious"
                className="w-48 h-48 sm:w-64 sm:h-64 object-contain"
            />
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mt-6">
                Submitting again eh? Looks like you loved our survey! 😄
            </p>
        </motion.div>
    );
}