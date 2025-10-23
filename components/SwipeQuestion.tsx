"use client";

import { useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';

const SwipeQuestion = ({
    question,
    options,
    onAnswer,
}: {
    question: string,
    options: { [key: string]: string }, // { direction: label }
    onAnswer: (answer: string) => void,
}) => {
    const controls = useAnimation();
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const { offset, velocity } = info;
        const threshold = 80; // Min drag distance
        const velocityThreshold = 500;

        let direction: string | null = null;

        // Check for swipe direction
        if (Math.abs(offset.x) > Math.abs(offset.y)) { // Horizontal swipe
            if (offset.x > threshold || velocity.x > velocityThreshold) direction = 'right';
            else if (offset.x < -threshold || velocity.x < -velocityThreshold) direction = 'left';
        } else { // Vertical swipe
            if (offset.y > threshold || velocity.y > velocityThreshold) direction = 'down';
            else if (offset.y < -threshold || velocity.y < -velocityThreshold) direction = 'up';
        }

        if (direction && options[direction]) {
            // Animate card out
            controls.start({
                x: direction === 'left' ? -500 : (direction === 'right' ? 500 : 0),
                y: direction === 'up' ? -500 : (direction === 'down' ? 500 : 0),
                opacity: 0,
                transition: { duration: 0.3 },
            });
            // Call handler after animation
            setTimeout(() => onAnswer(options[direction]), 300);
        } else {
            // Snap back to center
            controls.start({ x: 0, y: 0, rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
        }
    };

    return (
        <div className="w-full animate-fadeIn flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center">
                {question}
            </h2>

            {/* Helper Arrows */}
            <div className="relative w-full h-72 flex items-center justify-center">
                <div className="absolute top-0 flex flex-col items-center text-gray-400">
                    <span className="text-2xl">↑</span>
                    <span className="text-sm font-medium">{options['up']}</span>
                </div>
                <div className="absolute bottom-0 flex flex-col items-center text-gray-400">
                    <span className="text-sm font-medium">{options['down']}</span>
                    <span className="text-2xl">↓</span>
                </div>
                <div className="absolute left-0 flex items-center text-gray-400">
                    <span className="text-2xl">←</span>
                    <span className="text-sm font-medium">{options['left']}</span>
                </div>
                <div className="absolute right-0 flex items-center text-gray-400">
                    <span className="text-sm font-medium">{options['right']}</span>
                    <span className="text-2xl">→</span>
                </div>

                {/* The Swipeable Card */}
                <motion.div
                    ref={cardRef}
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    onDragEnd={handleDragEnd}
                    animate={controls}
                    whileTap={{ scale: 1.05 }}
                    className="absolute w-48 h-48 bg-green-600 rounded-2xl shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
                >
                    <span className="text-white text-5xl font-bold">👋</span>
                </motion.div>
            </div>
            <p className="mt-8 text-gray-500">Swipe the card to answer</p>
        </div>
    );
};

export default SwipeQuestion;
