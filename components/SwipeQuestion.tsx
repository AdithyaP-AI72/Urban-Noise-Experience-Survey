"use client";

import { useState, useEffect } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import * as Tone from 'tone'; // Import Tone.js

// Re-declare global vars for type safety within this module
declare global {
    var swooshSynth: Tone.NoiseSynth | null;
}

// Interface for the component props
interface SwipeQuestionProps {
    question: string;
    options: { [key: string]: string }; // e.g., { up: 'Yes', down: 'No' }
    onAnswer: (answer: string) => void;
}

// --- Swipe Question Component ---
const SwipeQuestion: React.FC<SwipeQuestionProps> = ({ question, options, onAnswer }) => {
    const controls = useAnimation(); // Card animation controls
    const imageControls = useAnimation(); // Image animation controls

    // State to manage the highlight bars for each direction
    const [highlights, setHighlights] = useState<{
        up: { text: string, color: string, opacity: number },
        down: { text: string, color: string, opacity: number },
        left: { text: string, color: string, opacity: number },
        right: { text: string, color: string, opacity: number },
    }>({
        up: { text: '', color: 'bg-transparent', opacity: 0 },
        down: { text: '', color: 'bg-transparent', opacity: 0 },
        left: { text: '', color: 'bg-transparent', opacity: 0 },
        right: { text: '', color: 'bg-transparent', opacity: 0 },
    });

    // --- Define the idle animation ---
    const idleAnimation = {
        y: [0, -2, -2, -12, 0], // Tap, pause, swipe up, reset
        opacity: [1, 0.8, 1, 0, 1], // Fade out during swipe
        transition: {
            repeat: Infinity,
            duration: 2.5, // Slightly longer loop
            ease: "easeInOut",
            times: [0, 0.1, 0.3, 0.6, 1]
        }
    };

    // --- Start idle animation on mount ---
    useEffect(() => {
        imageControls.start(idleAnimation);
        // This empty dependency array is correct, we only want this to run once.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    // Function to play the swoosh sound
    const playSwoosh = () => {
        if (globalThis.swooshSynth) {
            globalThis.swooshSynth.triggerAttackRelease("8n", Tone.now());
        }
    };

    // This runs as the user is dragging
    const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const { offset } = info;
        const swipeThreshold = 30; // How far to drag to show the highlight

        // --- Stop idle animation on first drag ---
        imageControls.stop();

        let activeDirection: 'up' | 'down' | 'left' | 'right' | null = null;
        let activeColor = 'bg-transparent';
        let activeText = '';

        // Determine highlight based on drag direction
        if (Math.abs(offset.x) > Math.abs(offset.y)) { // Horizontal
            if (offset.x > swipeThreshold) { // Right
                activeDirection = 'right';
                activeColor = 'bg-yellow-500 bg-opacity-90';
                activeText = options['right'];
            } else if (offset.x < -swipeThreshold) { // Left
                activeDirection = 'left';
                activeColor = 'bg-yellow-500 bg-opacity-90';
                activeText = options['left'];
            }
        } else { // Vertical
            if (offset.y > swipeThreshold) { // Down
                activeDirection = 'down';
                activeColor = 'bg-red-500 bg-opacity-90';
                activeText = options['down'];
            } else if (offset.y < -swipeThreshold) { // Up
                activeDirection = 'up';
                activeColor = 'bg-green-500 bg-opacity-90';
                activeText = options['up'];
            }
        }

        // Reset all highlights and then set the active one
        setHighlights(prev => {
            const newHighlights = {
                up: { ...prev.up, opacity: 0 },
                down: { ...prev.down, opacity: 0 },
                left: { ...prev.left, opacity: 0 },
                right: { ...prev.right, opacity: 0 },
            };
            if (activeDirection && activeText) {
                newHighlights[activeDirection] = { text: activeText, color: activeColor, opacity: 1 };
            }
            return newHighlights;
        });

        // Animate the image to follow the drag
        const rotationFactor = 0.05;
        const maxRotation = 10;
        const currentRotation = Math.max(-maxRotation, Math.min(maxRotation, info.offset.x * rotationFactor));
        // Use `set` for immediate 1:1 drag following instead of `start`
        imageControls.set({ y: offset.y, x: offset.x, rotate: currentRotation, opacity: 1 });
    };

    // This runs when the user lets go
    const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const { offset, velocity } = info;
        const swipePowerThreshold = 800;
        const dragThreshold = 100;

        let direction: 'up' | 'down' | 'left' | 'right' | null = null;
        let finalColor = 'bg-transparent';

        // Check for swipe direction
        if (Math.abs(offset.x) > Math.abs(offset.y)) { // Horizontal swipe
            if (offset.x > dragThreshold || velocity.x > swipePowerThreshold) {
                direction = 'right';
                finalColor = 'bg-yellow-500';
            } else if (offset.x < -dragThreshold || velocity.x < -swipePowerThreshold) {
                direction = 'left';
                finalColor = 'bg-yellow-500';
            }
        } else { // Vertical swipe
            if (offset.y > dragThreshold || velocity.y > swipePowerThreshold) {
                direction = 'down';
                finalColor = 'bg-red-500';
            } else if (offset.y < -dragThreshold || velocity.y < -swipePowerThreshold) {
                direction = 'up';
                finalColor = 'bg-green-500';
            }
        }

        if (direction && options[direction]) {
            // A valid swipe happened!
            playSwoosh();

            // Animate card out
            controls.start({
                x: direction === 'left' ? -500 : (direction === 'right' ? 500 : 0),
                y: direction === 'up' ? -500 : (direction === 'down' ? 500 : 0),
                opacity: 0,
                transition: { duration: 0.3 },
            });
            // Animate image out with the card
            imageControls.start({
                x: direction === 'left' ? -500 : (direction === 'right' ? 500 : 0),
                y: direction === 'up' ? -500 : (direction === 'down' ? 500 : 0),
                opacity: 0,
                transition: { duration: 0.3 },
            });

            // Set the final highlight and keep it visible
            setHighlights(prev => ({
                ...prev,
                [direction]: { text: options[direction], color: finalColor, opacity: 1 }
            }));

            setTimeout(() => {
                onAnswer(options[direction]);
            }, 300);

        } else {
            // Not a valid swipe, snap back to center
            controls.start({ x: 0, y: 0, rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
            
            // Snap image back
            await imageControls.start({ x: 0, y: 0, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } });
            
            // *** Restart idle animation ***
            imageControls.start(idleAnimation);

            // Fade out all highlight bars
            setHighlights(prev => ({
                up: { ...prev.up, opacity: 0 },
                down: { ...prev.down, opacity: 0 },
                left: { ...prev.left, opacity: 0 },
                right: { ...prev.right, opacity: 0 },
            }));
        }
    };

    return (
        // Use a fixed height container to manage layout
        <div className="w-full animate-fadeIn flex flex-col items-center relative h-96">

            {/* Question Text */}
            <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center absolute top-16">
                {question}
            </h2>

            {/* Helper Arrows & Options */}
            <div className="absolute w-full h-72 top-32 flex items-center justify-center">

                {/* Up Option */}
                <div className="absolute top-0 flex flex-col items-center text-gray-400">
                    <motion.div
                        // *** FIX: Moved highlight up ***
                        className={`absolute -top-24 w-48 p-2 rounded-lg shadow-lg text-white text-base font-semibold ${highlights.up.color}`}
                        animate={{ opacity: highlights.up.opacity }}
                        transition={{ duration: 0.1 }}
                        style={{ zIndex: 20 }}
                    >
                        {highlights.up.text}
                    </motion.div>
                    <span className="text-2xl">↑</span>
                    <span className="text-sm font-medium">{options['up']}</span>
                </div>

                {/* Down Option */}
                <div className="absolute bottom-0 flex flex-col items-center text-gray-400">
                    <span className="text-sm font-medium">{options['down']}</span>
                    <span className="text-2xl">↓</span>
                     <motion.div
                        className={`absolute -bottom-12 w-48 p-2 rounded-lg shadow-lg text-white text-base font-semibold ${highlights.down.color}`}
                        animate={{ opacity: highlights.down.opacity }}
                        transition={{ duration: 0.1 }}
                        style={{ zIndex: 20 }}
                    >
                        {highlights.down.text}
                    </motion.div>
                </div>

                {/* Left Option */}
                <div className="absolute left-0 flex flex-row items-center text-gray-400 -translate-x-4 sm:-translate-x-6">
                    <motion.div
                        // *** FIX: Rotated highlight box ***
                        className={`absolute -left-32 top-1/2 -translate-y-1/2 h-36 p-3 flex items-center justify-center rounded-lg shadow-lg text-white text-base font-semibold [writing-mode:vertical-rl] rotate-180 ${highlights.left.color}`}
                        animate={{ opacity: highlights.left.opacity }}
                        transition={{ duration: 0.1 }}
                        style={{ zIndex: 20 }}
                    >
                        {/* Wrapper to center text in vertical box */}
                        <span className="block text-center">{highlights.left.text}</span>
                    </motion.div>
                    <span className="text-2xl">←</span>
                    <span className="text-sm font-medium ml-1">{options['left']}</span>
                </div>

                {/* Right Option */}
                <div className="absolute right-0 flex flex-row items-center text-gray-400 translate-x-4 sm:translate-x-6">
                    <span className="text-sm font-medium mr-1">{options['right']}</span>
                    <span className="text-2xl">→</span>
                    <motion.div
                        // *** FIX: Rotated highlight box ***
                        className={`absolute -right-32 top-1/2 -translate-y-1/2 h-36 p-3 flex items-center justify-center rounded-lg shadow-lg text-white text-base font-semibold [writing-mode:vertical-rl] rotate-180 ${highlights.right.color}`}
                        animate={{ opacity: highlights.right.opacity }}
                        transition={{ duration: 0.1 }}
                        style={{ zIndex: 20 }}
                    >
                        {/* Wrapper to center text in vertical box */}
                        <span className="block text-center">{highlights.right.text}</span>
                    </motion.div>
                </div>

                {/* --- The Swipeable Card --- */}
                <motion.div
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    animate={controls}
                    whileTap={{ scale: 1.05 }}
                    className="absolute w-48 h-48 bg-green-600 rounded-2xl shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
                    style={{ zIndex: 10 }}
                >
                    {/* Image with idle animation */}
                    <motion.img
                        src="/images/swipe.jpeg"
                        alt="Swipe instruction"
                        className="w-24 h-24 object-contain"
                        animate={imageControls} // Controlled by handleDrag/handleDragEnd
                        initial={false} // Animation starts in useEffect
                    />
                </motion.div>

            </div>
            <p className="absolute bottom-0 text-gray-500">Swipe the card to answer</p>
        </div>
    );
};

export default SwipeQuestion;

