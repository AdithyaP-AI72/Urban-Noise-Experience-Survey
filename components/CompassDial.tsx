"use client";

import { useRef, useEffect } from "react";
import { motion, PanInfo, useMotionValue, animate } from "framer-motion";
import * as Tone from "tone";

// Re-declare global vars
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
    const startAngleRef = useRef(0);
    const startRotationRef = useRef(0);

    const numOptions = options.length;
    const anglePerOption = 360 / numOptions;
    const radius = size / 2.2;

    // ✅ FIXED: Set initial rotation (no more mirrored indexing)
    useEffect(() => {
        const initialIndex = options.indexOf(value);
        if (initialIndex !== -1) {
            const initialRotation = initialIndex * anglePerOption; // Fixed direction
            rotation.set(initialRotation);
        }
    }, [value, options, anglePerOption, rotation]);

    // Handle rotation start
    const handlePanStart = (e: MouseEvent | TouchEvent | PointerEvent) => {
        stopCurrentSound();

        if (knobOsc?.state === "stopped") knobOsc.start();
        knobOsc?.volume.rampTo(-25, 0.1);

        if (!knobRef.current) return;
        const rect = knobRef.current.getBoundingClientRect();
        centerRef.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };

        let clientX, clientY;
        if ("touches" in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }

        startAngleRef.current = Math.atan2(
            clientY - centerRef.current.y,
            clientX - centerRef.current.x
        );
        startRotationRef.current = rotation.get();
    };

    // Handle rotation drag
    const handlePan = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        let clientX, clientY;
        if ("touches" in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }

        const currentAngle = Math.atan2(
            clientY - centerRef.current.y,
            clientX - centerRef.current.x
        );

        let deltaAngle = currentAngle - startAngleRef.current;
        if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
        if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

        const newRotation = startRotationRef.current + deltaAngle * (180 / Math.PI);
        rotation.set(newRotation);

        // Sound modulation
        const velocity = Math.hypot(info.velocity.x, info.velocity.y);
        const volume = Math.min(-15, -30 + velocity / 50);
        const freq = Math.min(120, 40 + velocity / 20);
        knobOsc?.volume.rampTo(volume, 0.01);
        knobOsc?.frequency.rampTo(freq, 0.01);
    };

    // Handle rotation end + snapping
    const handlePanEnd = () => {
        knobOsc?.volume.rampTo(-Infinity, 0.1);

        const currentRotation = rotation.get();
        const closestSnapRotation = Math.round(currentRotation / anglePerOption) * anglePerOption;

        // ✅ FIXED: remove mirrored indexing logic
        const snapIndex = Math.round(closestSnapRotation / anglePerOption);
        const finalIndex = (snapIndex % numOptions + numOptions) % numOptions;
        const selectedOption = options[finalIndex];

        animate(rotation, closestSnapRotation, {
            type: "spring",
            stiffness: 400,
            damping: 30,
            onComplete: () => {
                if (selectedOption !== value) onChange(selectedOption);
                const note = 200 + finalIndex * 50;
                zapSynth?.triggerAttackRelease(note, "16n");
            },
        });
    };

    return (
        <div className="flex flex-col items-center select-none" style={{ height: size + 40 }}>
            <div
                className="relative rounded-full bg-gray-200 dark:bg-gray-800 shadow-inner select-none"
                style={{ width: size, height: size, touchAction: "none" }}
            >
                {/* Labels around the knob */}
                {options.map((option, index) => {
                    const angle = (index / numOptions) * 360;
                    return (
                        <div
                            key={option}
                            className="absolute w-24 text-center text-xs sm:text-sm select-none"
                            style={{
                                top: "50%",
                                left: "50%",
                                transform: `translate(-50%, -50%) rotate(${angle}deg) translate(0, -${radius}px) rotate(-${angle}deg)`,
                                color: value === option ? "var(--tw-color-green-500)" : "inherit",
                                fontWeight: value === option ? "bold" : "normal",
                                backgroundColor:
                                    value === option
                                        ? "rgba(52, 211, 153, 0.15)"
                                        : "transparent",
                                borderRadius: "6px",
                                padding: "2px 0",
                                transition: "color 0.2s, background-color 0.2s",
                                pointerEvents: "none",
                            }}
                        >
                            {option}
                        </div>
                    );
                })}

                {/* Knob + indicator */}
                <motion.div
                    ref={knobRef}
                    className="absolute w-3/5 h-3/5 rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
                    style={{
                        top: "20%",
                        left: "20%",
                        rotate: rotation,
                        touchAction: "none",
                    }}
                    onPanStart={handlePanStart}
                    onPan={handlePan}
                    onPanEnd={handlePanEnd}
                >
                    {/* Knob top-view image */}
                    <img
                        src="/images/knob-top-view.png"
                        alt="Dial Knob"
                        className="w-full h-full rounded-full pointer-events-none"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                    />

                    {/* Indicator dot */}
                    <div
                        className="absolute top-4 w-2 h-2 bg-green-500 rounded-full shadow-md"
                        style={{
                            pointerEvents: "none",
                            boxShadow:
                                "0 0 5px var(--tw-color-green-500), 0 0 8px var(--tw-color-green-500)",
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default CompassDial;
