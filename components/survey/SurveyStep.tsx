// FILE: components/survey/SurveyStep.tsx

"use client";

import { motion, Variants } from 'framer-motion';
import React from 'react';

type SurveyStepProps = {
    children: React.ReactNode;
    stepKey: string;
    animation?: 'slide' | 'fade' | 'swipe';
};

const animations: Record<string, Variants> = {
    slide: {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
    },
    fade: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    },
    swipe: {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -50 },
    }
};

const SurveyStep = ({ children, stepKey, animation = 'slide' }: SurveyStepProps) => {
    const selectedAnimation = animations[animation] || animations.slide;

    return (
        <motion.div
            key={stepKey}
            initial={selectedAnimation.initial}
            animate={selectedAnimation.animate}
            exit={selectedAnimation.exit}
            transition={{ duration: 0.3 }}
            className="w-full"
        >
            {children}
        </motion.div>
    );
};

export default SurveyStep;