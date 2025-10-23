"use client";

import { useRef, useEffect } from 'react';
import {
    motion,
    PanInfo,
    useMotionValue,
    animate,
} from 'framer-motion';
import * as Tone from 'tone';

// Tone.js sound instances (assuming initialized elsewhere)
declare var knobOsc: Tone.Oscillator | null;
declare var zapSynth: Tone.Synth | null;
declare var lockSynth: Tone.MembraneSynth | null;

const CompassDial = ({
    options,
    value,
    onChange,
    stopCurrentSound,
    size = 300,
}: {
    options: string[];
    value: string;
    onChange: (newValue: string) => void;
    stopCurrentSound: () => void;
    size?: number;
}) => {
    const rotation = useMotionValue(0);
    const knobRef = useRef<HTMLDivElement>(null);
    const centerRef = useRef({ x: 0, y: 0 });
    const startAngleRef = useRef(0); // Angle of the pointer relative to center at drag start
    const startRotationRef = useRef(0); // Rotation value of the dial at drag start

    const numOptions = options.length;
    const anglePerOption = 360 / numOptions;
    const radius = size / 2.2; // Pushed labels out

    // Set initial rotation based on the current value
    useEffect(() => {
        const initialIndex = options.indexOf(value);
        if (initialIndex !== -1) {
            const initialRotation = -initialIndex * anglePerOption;
            rotation.set(initialRotation);
        }
    }, [value, options, anglePerOption, rotation]); // Added dependency array check


    const handlePanStart = (e: MouseEvent | TouchEvent | PointerEvent) => {
        // initializeSounds(); // Sounds should be initialized on first page interaction
        stopCurrentSound();

        // Start buzz sound
        if (knobOsc?.state === 'stopped') {
            knobOsc.start();
        }
        knobOsc?.volume.rampTo(-25, 0.1);

        // Calculate center of the knob element
        if (!knobRef.current) return;
        const rect = knobRef.current.getBoundingClientRect();
        centerRef.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };

        // Determine pointer position
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }

        // Calculate the angle of the pointer relative to the center
        startAngleRef.current = Math.atan2(
            clientY - centerRef.current.y,
            clientX - centerRef.current.x
        );
        // Store the dial's rotation when the drag starts
        startRotationRef.current = rotation.get();
    };

    const handlePan = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // Determine current pointer position
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }

        // Calculate the current angle of the pointer relative to the center
        const currentAngle = Math.atan2(
            clientY - centerRef.current.y,
            clientX - centerRef.current.x
        );
        // Calculate the change in angle since the drag started
        const deltaAngle = currentAngle - startAngleRef.current;

        // Calculate the new rotation based on the initial rotation and the angle change
        // This prevents the jump by starting from the dial's actual position
        const newRotation = startRotationRef.current + deltaAngle * (180 / Math.PI);

        rotation.set(newRotation);

        // Modulate buzz sound based on velocity
        const velocity = Math.hypot(info.velocity.x, info.velocity.y);
        const volume = Math.min(-15, -30 + velocity / 50);
        const freq = Math.min(120, 40 + velocity / 20);
        knobOsc?.volume.rampTo(volume, 0.01);
        knobOsc?.frequency.rampTo(freq, 0.01);
    };

    const handlePanEnd = () => {
        // Stop buzz sound smoothly
        knobOsc?.volume.rampTo(-Infinity, 0.1);

        const currentRotation = rotation.get();

        // Calculate the rotation of the closest option
        const closestSnapRotation = Math.round(currentRotation / anglePerOption) * anglePerOption;

        // Find the index corresponding to that rotation
        const snapIndex = Math.round(closestSnapRotation / -anglePerOption);
        // Ensure the index wraps around correctly (handles negative modulo)
        const finalIndex = (snapIndex % numOptions + numOptions) % numOptions;

        const selectedOption = options[finalIndex];

        // Animate the dial smoothly to the closest snap rotation
        animate(rotation, closestSnapRotation, {
            type: 'spring',
            stiffness: 400,
            damping: 30,
            onComplete: () => {
                // Update the form state if the option changed
                if (selectedOption !== value) {
                    onChange(selectedOption);
                }
                // Play "zap" sound when it snaps into place
                const note = 200 + finalIndex * 50; // Vary pitch based on option
                zapSynth?.triggerAttackRelease(note, "16n");
            },
        });
    };

    return (
        <div className="flex flex-col items-center select-none" style={{ height: size + 40 }}> {/* Added select-none */}
            {/* Compass Base with Options */}
            <div
                className="relative rounded-full bg-gray-200 dark:bg-gray-800 shadow-inner select-none" // Added select-none
                style={{ width: size, height: size }}
            >
                {options.map((option, index) => {
                    const angle = (index / numOptions) * 360;
                    return (
                        <div
                            key={option}
                            className="absolute w-24 text-center text-xs sm:text-sm select-none" // Added select-none
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, -${radius}px) rotate(-${angle}deg)`,
                                color: value === option ? 'var(--tw-color-green-500)' : 'inherit',
                                fontWeight: value === option ? 'bold' : 'normal',
                                transition: 'color 0.2s',
                                pointerEvents: 'none', // Prevent text interaction during drag
                            }}
                        >
                            {option}
                        </div>
                    );
                })}

                {/* The Draggable Knob */}
                <motion.div
                    ref={knobRef}
                    className="absolute w-3/5 h-3/5 bg-gray-100 dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
                    style={{
                        top: '20%',
                        left: '20%',
                        rotate: rotation, // Bind motion value to rotation
                    }}
                    onPanStart={handlePanStart}
                    onPan={handlePan}
                    onPanEnd={handlePanEnd}
                >
                    {/* The Arrow */}
                    <div
                        className="absolute top-2 w-0 h-0 
            border-l-[10px] border-l-transparent
            border-r-[10px] border-r-transparent
            border-b-[16px] border-b-green-500"
                        style={{ pointerEvents: 'none' }} // Ensure arrow doesn't interfere
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default CompassDial;
