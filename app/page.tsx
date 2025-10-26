"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Tone from 'tone';

// Import the new components
import CompassDial from '@/components/CompassDial';
import SwipeQuestion from '@/components/SwipeQuestion';
import DraggableList, { FeatureItem } from '@/components/DraggableList'; // Import the DraggableList

// --- Sound Generators (Tone.js) ---
if (typeof (globalThis as any).knobOsc === 'undefined') {
    (globalThis as any).knobOsc = null;
    (globalThis as any).zapSynth = null;
    (globalThis as any).lockSynth = null;
    (globalThis as any).swooshSynth = null; // *** ADDED SWOOSH SYNTH ***
}
declare global {
    var knobOsc: Tone.Oscillator | null;
    var zapSynth: Tone.Synth | null;
    var lockSynth: Tone.MembraneSynth | null;
    var swooshSynth: Tone.NoiseSynth | null; // *** ADDED SWOOSH SYNTH ***
}

// *** NEW: Helper function to start audio context on demand ***
const ensureAudioContextStarted = async () => {
  if (Tone.context.state !== 'running') {
    try {
      await Tone.start();
      console.log("Audio context started by user interaction.");
    } catch (e) {
      console.error("Failed to start AudioContext:", e);
    }
  }
};



// --- Persona Logic Based on Bother Level ---
function getNoisePersona(botherLevel: number) {
  if (botherLevel <= 40) {
    return {
      name: '🧘 Zen Seeker',
      description: 'You crave tranquility and notice even the faintest disruptions. Silence isn’t just golden—it’s essential.',
    };
  } else if (botherLevel <= 50) {
    return {
      name: '🎨 Mindful Listener',
      description: 'You appreciate soft, balanced soundscapes and prefer ambient environments over noisy ones.',
    };
  } else if (botherLevel <= 70) {
    return {
      name: '🚶 Urban Tuner',
      description: 'You’re comfortable with city sounds but still value occasional quiet. You adapt easily.',
    };
  } else if (botherLevel <= 90) {
    return {
      name: '🔧 Noise Resistor',
      description: 'You tolerate high noise levels and rarely flinch at honking or construction. You’re resilient.',
    };
  } else {
    return {
      name: '🛠️ Sonic Tank',
      description: 'You’re nearly impervious to noise. Jackhammers and chaos barely faze you—you thrive in urban energy.',
    };
  }
}


const initializeSounds = () => {
    // This function now *only* sets up the synths
    // Tone.start() is handled by ensureAudioContextStarted()
    const startAudioContext = async () => {
        // We still need Tone.start() here in case the first interaction
        // isn't a button press (e.g., a background click)
        await ensureAudioContextStarted(); 

        if (!globalThis.knobOsc) {
            globalThis.knobOsc = new Tone.Oscillator({
                type: 'triangle', frequency: 40, volume: -30,
            }).toDestination();
            if (globalThis.knobOsc.state === 'stopped') {
                try {
                    globalThis.knobOsc.start();
                    globalThis.knobOsc.volume.value = -Infinity;
                } catch (e) {
                    console.error("Error starting knob oscillator:", e);
                }
            }
        }
        if (!globalThis.zapSynth) {
            globalThis.zapSynth = new Tone.Synth({
                oscillator: { type: 'sine' },
                envelope: { attack: 0.001, decay: 0.05, sustain: 0.01, release: 0.05 },
                volume: -15,
            }).toDestination();
        }
        if (!globalThis.lockSynth) {
            globalThis.lockSynth = new Tone.MembraneSynth({
                octaves: 4, pitchDecay: 0.1,
                envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
                volume: -10,
            }).toDestination();
        }
        // *** ADDED SWOOSH SYNTH SETUP ***
        if (!globalThis.swooshSynth) {
            const swooshFilter = new Tone.AutoFilter('4n').toDestination().start();
            swooshFilter.filter.type = 'lowpass';
            swooshFilter.baseFrequency = 500;
            swooshFilter.octaves = 3;

            globalThis.swooshSynth = new Tone.NoiseSynth({
                noise: { type: 'pink' },
                envelope: { attack: 0.01, decay: 0.15, sustain: 0.01, release: 0.1 },
                volume: -5,
            }).connect(swooshFilter);
        }
    };

    // Keep the pointerdown listener as a fallback
    const eventType = 'pointerdown';
    const initHandler = () => {
        startAudioContext();
        document.body.removeEventListener(eventType, initHandler);
    };
    document.body.addEventListener(eventType, initHandler, { once: true, passive: true });

    return () => {
        document.body.removeEventListener(eventType, initHandler);
        globalThis.knobOsc?.stop();
    };
};


// --- Form Data & Types ---
type FormData = {
    name: string; // Added name field
    ageGroup: string;
    occupation: string;
    noiseExposureFreq: string;
    noiseSourceLocations: string[];
    commonNoiseSources: string[];
    focusDisturbance: string;
    sleepEffect: string; // Keep this as it's in your provided code
    stressEffect: string; // Keep this as it's in your provided code
    headphoneFreq: number;
    botherLevel: number;
    botherLabel: string;
    communitySeriousness: string;
    mapInterest: string;
    citizenScientist: string;
    featurePriorities: string[];
};

const defaultFormData: FormData = {
    name: '', // Added default for name
    ageGroup: '',
    occupation: '',
    noiseExposureFreq: 'Rarely',
    noiseSourceLocations: [],
    commonNoiseSources: [],
    focusDisturbance: '',
    sleepEffect: '', // Keep this
    stressEffect: '', // Keep this
    headphoneFreq: 1,
    botherLevel: 40,
    botherLabel: 'Library quiet (40dB)',
    communitySeriousness: '',
    mapInterest: '',
    citizenScientist: '',
    featurePriorities: ['Noise Heatmaps', 'Quieter Routes', 'Noise Forecasts', 'Report & Learn Tool'],
};

const allFeatures: FeatureItem[] = [
    { id: 'feat-1', name: 'Noise Heatmaps', description: 'Visualizes current levels using KSPCB data', icon: '' },
    { id: 'feat-2', name: 'Quieter Routes', description: 'Suggests low-noise travel paths', icon: '' },
    { id: 'feat-3', name: 'Noise Forecasts', description: 'Predicts future levels by time & traffic', icon: '' },
    { id: 'feat-4', name: 'Report & Learn Tool', description: 'Lets users report noise and learn health impacts', icon: '' },
];


// --- Main Survey Component ---
export default function SurveyHome() {
    const [step, setStep] = useState(0); // Step 0 is still the intro
    const [formData, setFormData] = useState<FormData>(defaultFormData);
    const [loading, setLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const nameInputRef = useRef<HTMLInputElement>(null); // Ref for the name input
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
    const prankAudioRef = useRef<HTMLAudioElement | null>(null);
    const bgmAudioRef = useRef<HTMLAudioElement | null>(null);

    const [error, setError] = useState<string | null>(null);

    const [draggableFeatures, setDraggableFeatures] = useState<FeatureItem[]>(() => {
        return formData.featurePriorities.map(name => {
            const feature = allFeatures.find(f => f.name === name);
            if (!feature) {
                console.warn(`Feature ${name} not found in allFeatures during initialization.`);
                return { id: `missing-${name}`, name: name, description: 'Feature data missing', icon: '' };
            }
            return feature;
        });
    });

    const [alreadySubmitted, setAlreadySubmitted] = useState<boolean | null>(null);

    const totalSteps = 13;
    const progress = step > 0 ? ((step - 1) / totalSteps) * 100 : 0;

    const resumeBGM = () => {
        setTimeout(() => {
            if (bgmAudioRef.current && bgmAudioRef.current.paused) {
            bgmAudioRef.current.play().catch((e) => console.error("Failed to resume BGM:", e));
            }
        }, 1000); // Delay to avoid overlap
        };


    useEffect(() => {
        if (step === 1) {
            nameInputRef.current?.focus();
        }
    }, [step]);


    useEffect(() => {
    if (typeof window !== 'undefined') {
        const submitted = localStorage.getItem('surveySubmitted') === 'true';
        if (submitted) {
            setAlreadySubmitted(true);
            setStep(100);
        } else {
            setAlreadySubmitted(false);
        }
    } else {
        setAlreadySubmitted(false);
    }

    const cleanupSounds = initializeSounds();

    // 🎵 Start background music once
    if (!bgmAudioRef.current) {
        try {
            const bgm = new Audio("/sounds/clair-de-lune-bgm.mp3"); 
            bgm.loop = true;
            bgm.volume = 0.3;
            bgm.play().catch((e) => console.error("BGM failed to play:", e));
            bgmAudioRef.current = bgm;
        } catch (e) {
            console.error("Error creating BGM audio:", e);
        }
    }

    // 🎶 Rickroll prank at step 14
    if (step === 14) {
        // Pause BGM while Rickroll plays
        bgmAudioRef.current?.pause();

        try {
            const audio = new Audio("/sounds/rickroll.mp3");
            audio.loop = true;
            audio.volume = 0.4;
            audio.play().catch((e) => console.error("Rickroll failed:", e));
            prankAudioRef.current = audio;
        } catch (e) {
            console.error("Error creating Rickroll audio:", e);
        }
    } else {
        // Resume BGM if Rickroll ends
        if (bgmAudioRef.current && bgmAudioRef.current.paused) {
            bgmAudioRef.current.play().catch((e) => console.error("Failed to resume BGM:", e));
        }

        // Stop Rickroll if leaving step 14
        prankAudioRef.current?.pause();
        prankAudioRef.current = null;
    }

    return () => {
        cleanupSounds?.();
        prankAudioRef.current?.pause();
        prankAudioRef.current = null;
        bgmAudioRef.current?.pause();
        bgmAudioRef.current = null;
    };
}, [step]);



    const stopCurrentSound = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        if (globalThis.knobOsc && globalThis.knobOsc.volume.value > -Infinity) {
            globalThis.knobOsc.volume.rampTo(-Infinity, 0.05);
        }
        if (bgmAudioRef.current && !bgmAudioRef.current.paused) {
            bgmAudioRef.current.pause();
}

    };

    useEffect(() => {
        return () => {
            stopCurrentSound();
            globalThis.knobOsc?.stop();
        };
    }, []);

    // *** FIX: Make handleAnswer async ***
    const handleAnswer = async (key: keyof FormData, value: any, autoAdvance: boolean = true) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        if (autoAdvance) {
            await nextStep(key); // *** FIX: Await and pass key ***
            resumeBGM();
        }
    };

    const handleFeatureOrderChange = (newOrderNames: string[]) => {
        setTimeout(() => {
            setFormData(prev => {
                if (JSON.stringify(prev.featurePriorities) !== JSON.stringify(newOrderNames)) {
                    return { ...prev, featurePriorities: newOrderNames };
                }
                return prev;
            });
            setDraggableFeatures(currentDraggableFeatures => {
                const featureMap = new Map<string, FeatureItem>();
                currentDraggableFeatures.forEach(f => featureMap.set(f.name, f));
                allFeatures.forEach(f => {
                    if (!featureMap.has(f.name)) {
                        console.warn(`Feature "${f.name}" from allFeatures was not in current draggable state, adding.`);
                        featureMap.set(f.name, f);
                    }
                });
                const newOrderedFeatures = newOrderNames.map(name => {
                    const feature = featureMap.get(name);
                    if (!feature) {
                        console.error(`Feature named "${name}" could not be found in map during reorder.`);
                        return null;
                    }
                    return feature;
                }).filter(Boolean) as FeatureItem[];
                const currentIds = currentDraggableFeatures.map(f => f.id).join(',');
                const newIds = newOrderedFeatures.map(f => f.id).join(',');
                if (newIds !== currentIds) {
                   return newOrderedFeatures;
                }
                return currentDraggableFeatures;
            });
        }, 0);
    };

    // *** FIX: Make nextStep async and accept optional key ***
    const nextStep = async (key?: keyof FormData) => {
        await ensureAudioContextStarted(); // Ensure audio is ready
        stopCurrentSound();
        setError(null);

        // Check if it's a swipe question
        const swipeQuestions: (keyof FormData)[] = ['communitySeriousness', 'mapInterest', 'citizenScientist'];
        
        // Play thud sound only for NON-swipe questions
        if (!key || !swipeQuestions.includes(key)) {
            globalThis.lockSynth?.triggerAttackRelease("C1", "8n", Tone.now());
        }
        // The swoosh sound will be played inside the SwipeQuestion component

        setStep((prev) => prev + 1);
        resumeBGM();

    };

    // *** FIX: Make prevStep async ***
    const prevStep = async () => {
        await ensureAudioContextStarted(); // Ensure audio is ready
        stopCurrentSound();
        setError(null);
        setStep((prev) => prev - 1);
    };

    // *** FIX: Make handleNameSubmit async ***
    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name.trim() === "") {
            setError("Please enter your name to continue.");
            return;
        }
        setError(null);
        await nextStep(); // *** FIX: Await nextStep ***
    }

    // *** FIX: Make handleSubmit async ***
   const handleSubmit = async () => {
    await ensureAudioContextStarted(); // Ensure audio is ready
    stopCurrentSound();

    if (formData.featurePriorities.length < 4) {
        setError("Please rank all features before submitting.");
        return;
    }

    setError(null);
    globalThis.lockSynth?.triggerAttackRelease("C1", "4n", Tone.now());

    // 🃏 Prank step 14
    setStep(14);
    const messages = [
        "Encrypting your thoughts...",
        "Uploading to Noise Surveillance HQ...",
        "Analyzing your vibe...",
        "Detecting sarcasm...",
        "Just kidding 😄 — submission complete!",
    ];
    for (let i = 0; i < messages.length; i++) {
        setLoadingMessage(messages[i]);
        await new Promise((res) => setTimeout(res, 1000));
    }
    resumeBGM();

    setLoading(true);
    try {
        const currentFormData = { ...formData };

        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentFormData),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('API Error Response:', errorBody);
            throw new Error(`Network response was not ok: ${response.statusText} - ${errorBody}`);
        }
        if (typeof window !== 'undefined') {
            localStorage.setItem('surveySubmitted', 'true');
        }
        setStep(99);
    } catch (error) {
        console.error('Failed to submit survey:', error);
        alert(`There was an error submitting your survey. ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
        setLoading(false);
    }
};


    // --- Reusable Button Component ---
    const SectionButton = ({ text, onClick }: { text: string, onClick: () => void }) => (
        <button
            onClick={onClick}
            className="w-full max-w-md p-4 mb-3 text-left text-lg font-medium bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm hover:bg-green-100 dark:hover:bg-green-900 border border-transparent hover:border-green-500 transition-all duration-200 cursor-pointer"
        >
            {text}
        </button>
    );

    // --- Main Render Logic ---
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 lg:p-24 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden relative">

            {/* --- PROGRESS BAR --- */}
            {step > 0 && step < 99 && !alreadySubmitted && (
                <div className="fixed top-0 left-0 w-full h-2 bg-gray-200 dark:bg-gray-700 z-50">
                    <motion.div
                        className="h-2 bg-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    />
                </div>
            )}

            <div className="w-full max-w-2xl text-center pt-12 relative">

                {/* --- Back Button --- */}
                {step > 0 && step < 99 && !alreadySubmitted && (
                    <button
                        onClick={prevStep} // *** FIX: Calls async prevStep ***
                        className="absolute top-4 left-0 sm:left-[-4rem] text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer z-20 p-2 rounded-full bg-gray-100 dark:bg-gray-800 shadow"
                        aria-label="Go back"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}


                {/* Render steps based on 'step' and 'alreadySubmitted' state */}

                {alreadySubmitted === true && (
                    <motion.div key="step-100" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-orange-500">✋ Hold Up!</h1>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
                            Looks like you've already submitted the survey from this browser.
                            <br/>Thank you for your contribution!
                        </p>
                         <a href="/stats" className="text-green-500 hover:text-green-400 underline mt-4 inline-block">View Current Stats (if available)</a>
                    </motion.div>
                )}
                
                {alreadySubmitted === null && (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}


                {alreadySubmitted === false && (
                    <>
                        {/* Step 0: Start Screen */}
                        {step === 0 && (
                            <motion.div key="step-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} >
                                <h1 className="text-4xl sm:text-5xl font-bold mb-4"> How does your city sound? 🔊 </h1>
                                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8"> Help us build a 'Noise Profile' of our community.<br /> It's fast, interactive, and makes a real difference. </p>
                                <button onClick={(e) => nextStep()} className="px-10 py-4 text-xl font-bold bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 cursor-pointer"> Start the Survey </button>
                            </motion.div>
                        )}

                        {/* Step 1: Name Input (NEW) */}
                        {step === 1 && (
                            <motion.div key="step-1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full max-w-md mx-auto">
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
                            </motion.div>
                        )}

                        {/* Step 2: Age Group (Was 1) */}
                        {step === 2 && (
                            <motion.div key="step-2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full">
                                <h2 className="text-2xl sm:text-3xl font-semibold mb-6"> 🧠 What's your age group? </h2>
                                {/* *** FIX: Await handleAnswer *** */}
                                <SectionButton text="☐ Below 18" onClick={async () => await handleAnswer('ageGroup', 'Below 18')} />
                                <SectionButton text="☐ 18–22 (College Student)" onClick={async () => await handleAnswer('ageGroup', '18-22')} />
                                <SectionButton text="☐ 23–30" onClick={async () => await handleAnswer('ageGroup', '23-30')} />
                                <SectionButton text="☐ 31–45" onClick={async () => await handleAnswer('ageGroup', '31-45')} />
                                <SectionButton text="☐ 45+" onClick={async () => await handleAnswer('ageGroup', '45+')} />
                            </motion.div>
                        )}

                        {/* Step 3: Occupation (Was 2) */}
                        {step === 3 && (
                            <motion.div key="step-3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full">
                                <h2 className="text-2xl sm:text-3xl font-semibold mb-6"> And what's your current role? </h2>
                                {/* *** FIX: Await handleAnswer *** */}
                                <SectionButton text="🎓 Student" onClick={async () => await handleAnswer('occupation', 'Student')} />
                                <SectionButton text="💼 Working professional" onClick={async () => await handleAnswer('occupation', 'Working professional')} />
                                <SectionButton text="🏠 Homemaker" onClick={async () => await handleAnswer('occupation', 'Homemaker')} />
                                <SectionButton text="🧐 Other" onClick={async () => await handleAnswer('occupation', 'Other')} />
                            </motion.div>
                        )}

                        {/* Step 4: Noise Locations (Was 3) */}
                        {step === 4 && (
                            <motion.div
                                key="step-4"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                className="w-full space-y-6"
                            >
                                <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
                                🔊 Where do you experience the most noise?
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Tap all the noisy spots on your daily map:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Home', icon: '🏠' },
                                    { label: 'Commute', icon: '🚗' },
                                    { label: 'College/Work', icon: '🏢' },
                                    { label: 'Metro/Bus Stop', icon: '🚇' },
                                    { label: 'Construction', icon: '🏗️' },
                                ].map(({ label, icon }) => {
                                    const selected = formData.noiseSourceLocations.includes(label);
                                    return (
                                    <button
                                        key={label}
                                        onClick={(e) => {
                                        if (error) setError(null);
                                        const updated = selected
                                            ? formData.noiseSourceLocations.filter((l) => l !== label)
                                            : [...formData.noiseSourceLocations, label];
                                        handleAnswer('noiseSourceLocations', updated, false);
                                        const el = e.currentTarget;
                                        el.classList.remove('animate-bounceOnce');
                                        void el.offsetWidth;
                                        el.classList.add('animate-bounceOnce');
                                        }}
                                        className={`flex items-start justify-start gap-3 p-4 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer w-full max-w-md ${
                                        selected
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
                                onClick={async () => {
                                    if (formData.noiseSourceLocations.length === 0) {
                                    setError('Please select at least one location.');
                                    return;
                                    }
                                    setError(null);
                                    await nextStep();
                                }}
                                className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
                                >
                                Next
                                </button>
                            </motion.div>
                            )}


                        {/* Step 5: Noise Frequency (Was 4) */}
                        {step === 5 && (
                            <motion.div key="step-5" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full space-y-6 flex flex-col items-center">
                                <h2 className="text-2xl sm:text-3xl font-semibold mb-4"> 📊 How often do you experience unwanted noise around you? </h2>
                                <CompassDial
                                options={['Rarely', 'Sometimes', 'Often', 'Very Often', 'Constantly']}
                                value={formData.noiseExposureFreq}
                                onChange={(val) => handleAnswer('noiseExposureFreq', val, false)}
                                stopCurrentSound={stopCurrentSound}
                                resumeBGM={resumeBGM} // ✅ Add this
                                />                                <button onClick={(e) => nextStep()} className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"> Next </button>
                            </motion.div>
                        )}

                        {/* Step 6: Noise Sources (Was 5) */}
                       {step === 6 && (
                            <motion.div
                                key="step-6"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                className="w-full space-y-6"
                            >
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
                                            resumeBGM();
                                            } catch (e) {
                                            console.error('Error creating Audio object:', audio, e);
                                            }
                                        }
                                        }}
                                        className={`flex items-start justify-start gap-3 p-4 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer w-full max-w-md ${
                                        selected
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
                                onClick={async () => {
                                    if (formData.commonNoiseSources.length === 0) {
                                    setError('Please select at least one sound source.');
                                    return;
                                    }
                                    setError(null);
                                    await nextStep();
                                }}
                                className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
                                >
                                Next
                                </button>
                            </motion.div>
                            )}


                        {/* Step 7: Focus Disturbance (Was 6) */}
                        {step === 7 && (
                            <motion.div key="step-7" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full space-y-6">
                                <h2 className="text-2xl sm:text-3xl font-semibold mb-4"> 😣 How often does noise disturb your focus or sleep? </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* *** FIX: Await handleAnswer *** */}
                                    {['Rarely', 'Sometimes', 'Often', 'Almost Always'].map((option) => ( <button key={option} onClick={async () => await handleAnswer('focusDisturbance', option, true)} className={`p-4 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer ${ formData.focusDisturbance === option ? 'bg-green-200 border-green-500 text-green-800' : 'bg-gray-100 dark:bg-gray-800 hover:border-green-400' }`} > {option} </button> ))}
                                </div>
                            </motion.div>
                        )}


                        {/* Step 8: Headphone Frequency (Was 7) */}
                        {step === 8 && (
                            <motion.div key="step-8" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full space-y-6 flex flex-col items-center">
                                <h2 className="text-2xl sm:text-3xl font-semibold mb-4"> 🎧 How often do you use headphones to block out city noise? </h2>
                                <CompassDial options={Array.from({ length: 10 }, (_, i) => String(i + 1))} value={String(formData.headphoneFreq)} onChange={(val) => handleAnswer('headphoneFreq', parseInt(val), false)} stopCurrentSound={stopCurrentSound} />
                                <button onClick={(e) => nextStep()} className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"> Next </button>
                            </motion.div>
                        )}

                        {/* Step 9: Bother Level (Was 8) */}
                        {step === 9 && (
                            <motion.div key="step-9" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full space-y-6 flex flex-col items-center">
                                <h2 className="text-2xl sm:text-3xl font-semibold mb-4"> 📶 At what point does noise start to bother you? </h2>
                                <CompassDial options={[ 'Library quiet (40dB)', 'Conversation (50dB)', 'Busy café (60dB)', 'Street traffic (70dB)', 'Honking (80dB)', 'Construction (90dB)', 'Loud music (100dB)', 'Jackhammer (110dB)' ]} value={formData.botherLabel} onChange={(label) => { const botherMap: { [key: string]: number } = { 'Library quiet (40dB)': 40, 'Conversation (50dB)': 50, 'Busy café (60dB)': 60, 'Street traffic (70dB)': 70, 'Honking (80dB)': 80, 'Construction (90dB)': 90, 'Loud music (100dB)': 100, 'Jackhammer (110dB)': 110, }; handleAnswer('botherLabel', label, false); handleAnswer('botherLevel', botherMap[label] || 40, false); }} stopCurrentSound={stopCurrentSound} />
                                <button onClick={(e: React.MouseEvent) => nextStep()} className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"> Next </button>
                            </motion.div>
                        )}

                        {/* --- SWIPE QUESTIONS --- */}

                        {/* Step 10: Community Seriousness (Was 9) */}
                        {step === 10 && (
                            <motion.div key="step-10" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.3 }} className="w-full">
                                {/* *** FIX: Await handleAnswer *** */}
                                <SwipeQuestion question="💡 Do you think noise pollution is taken seriously in your community?" options={{ up: 'Yes, definitely', right: 'Somewhat', down: 'Not really', left: 'Not sure' }} onAnswer={async (answer) => await handleAnswer('communitySeriousness', answer, true)} />
                            </motion.div>
                        )}

                        {/* Step 11: Map Interest (Was 10) */}
                        {step === 11 && (
                            <motion.div key="step-11" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.3 }} className="w-full">
                                {/* *** FIX: Await handleAnswer *** */}
                                <SwipeQuestion question="🗺️ Would a real-time city noise map help you?" options={{ up: 'Yes, very useful', right: 'Maybe', down: 'Not really useful', left: 'No, not at all' }} onAnswer={async (answer) => await handleAnswer('mapInterest', answer, true)} />
                            </motion.div>
                        )}


                        {/* Step 12: Citizen Scientist (Was 11) */}
                        {step === 12 && (
                            <motion.div key="step-12" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.3 }} className="w-full">
                                {/* *** FIX: Await handleAnswer *** */}
                                <SwipeQuestion question="🧪 Would you contribute by recording or reporting noise?" options={{ up: 'Yes, definitely', right: 'Maybe, occasionally', down: 'Unlikely', left: 'No, not interested' }} onAnswer={async (answer) => await handleAnswer('citizenScientist', answer, true)} />
                            </motion.div>
                        )}


                        {/* Step 13: Drag and Drop (Was 12) */}
                        {step === 13 && (
                            <motion.div key="step-13" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full">
                                <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
                                🧩 Last step! Drag your favorite features to the top.
                                </h2>
                                <DraggableList
                                    initialItems={draggableFeatures}
                                    onOrderChange={handleFeatureOrderChange}
                                />
                                <button
                                    onClick={handleSubmit} // *** FIX: Calls async handleSubmit ***
                                    disabled={loading}
                                    className="px-10 py-4 mt-4 text-xl font-bold bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {loading ? 'Submitting...' : 'Confirm Order & Submit'}
                                </button>
                            </motion.div>
                        )}
                    </>
                )}
                {/* Fake Loading Screen */}
                    {step === 14 && (
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
                            onClick={() => alert("You cannot cancel the upload!! 😈")}
                            className="w-full max-w-xs sm:max-w-sm px-4 py-2 text-sm sm:text-base font-semibold bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition break-words whitespace-normal text-center"                            >
                            Cancel Upload (click if you dare!)
                            </button>
                        </motion.div>
                        )}


                {/* Step 99: Final "Persona" Screen */}
                {step === 99 && (
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
                        {(() => {
                        const persona = getNoisePersona(formData.botherLevel);
                        const topFeature = formData.featurePriorities?.[0];

                        return (
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
                        );
                        })()}
                    </motion.div>
                    )}
            </div>
        </main>
    );
}