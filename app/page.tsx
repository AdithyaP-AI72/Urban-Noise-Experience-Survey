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
}
declare global {
  var knobOsc: Tone.Oscillator | null;
  var zapSynth: Tone.Synth | null;
  var lockSynth: Tone.MembraneSynth | null;
}


const initializeSounds = () => {
  const startAudioContext = async () => {
    // Check if context is already running or suspended, try resuming
    if (Tone.context.state !== 'running') {
      try {
        await Tone.start();
        console.log("Audio context started or resumed");
      } catch (e) {
        console.error("Failed to start AudioContext:", e);
        // Fallback or user notification might be needed here
        return; // Exit if context cannot start
      }
    }


    // Initialize synths only after context is running
    if (!globalThis.knobOsc) {
      globalThis.knobOsc = new Tone.Oscillator({
        type: 'triangle', frequency: 40, volume: -30,
      }).toDestination();
      // Start oscillator immediately but keep volume low initially
      if (globalThis.knobOsc.state === 'stopped') {
        try {
          globalThis.knobOsc.start();
          globalThis.knobOsc.volume.value = -Infinity; // Ensure it starts silent
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
  };

  // Attach to the first user interaction
  // Use a more reliable event listener setup
  const eventType = 'pointerdown'; // More universal than click/touchstart
  const initHandler = () => {
    startAudioContext();
    // Clean up this specific listener after it runs once
    document.body.removeEventListener(eventType, initHandler);
  };
  document.body.addEventListener(eventType, initHandler, { once: true, passive: true });


  // Cleanup function for useEffect
  return () => {
    document.body.removeEventListener(eventType, initHandler);
    // Stop sounds safely
    globalThis.knobOsc?.stop();
    // Consider disposing synths on final unmount if necessary
    // globalThis.zapSynth?.dispose();
    // globalThis.lockSynth?.dispose();
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
  sleepEffect: string;
  stressEffect: string;
  headphoneFreq: number;
  botherLevel: number;
  botherLabel: string;
  communitySeriousness: string;
  mapInterest: string;
  citizenScientist: string;
  featurePriorities: string[]; // Still stores just the names in order
};

const defaultFormData: FormData = {
  name: '', // Added default for name
  ageGroup: '',
  occupation: '',
  noiseExposureFreq: 'Rarely',
  noiseSourceLocations: [],
  commonNoiseSources: [],
  focusDisturbance: '',
  sleepEffect: '',
  stressEffect: '',
  headphoneFreq: 1,
  botherLevel: 40,
  botherLabel: 'Library quiet (40dB)',
  communitySeriousness: '',
  mapInterest: '',
  citizenScientist: '',
  // Initial order of feature *names*
  featurePriorities: ['Noise Heatmaps', 'Quieter Routes', 'Noise Forecasts', 'Report & Learn Tool'],
};

// --- Define full feature data for the Draggable List ---
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

  // State specifically for the draggable list items, maintaining full object data
  // Initialize based on the default order of names in formData
  const [draggableFeatures, setDraggableFeatures] = useState<FeatureItem[]>(() => {
    return formData.featurePriorities.map(name => {
      const feature = allFeatures.find(f => f.name === name);
      if (!feature) {
        console.warn(`Feature ${name} not found in allFeatures during initialization.`);
        // Return a placeholder or default structure if a feature is missing
        return { id: `missing-${name}`, name: name, description: 'Feature data missing', icon: '' };
      }
      return feature;
    });
  });

  // --- PROGRESS BAR ---
  const totalSteps = 13; // Increased by 1 for the name step
  const progress = step > 0 ? ((step - 1) / totalSteps) * 100 : 0; // Adjust progress calculation (start after name step)

  // Focus name input when it appears
  useEffect(() => {
    if (step === 1) {
      nameInputRef.current?.focus();
    }
  }, [step]);


  useEffect(() => {
    const cleanup = initializeSounds();
    return cleanup;
  }, []);

  const stopCurrentSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (globalThis.knobOsc && globalThis.knobOsc.volume.value > -Infinity) {
      globalThis.knobOsc.volume.rampTo(-Infinity, 0.05);
    }
  };

  // Cleanup sounds specifically on component unmount
  useEffect(() => {
    return () => {
      stopCurrentSound();
      globalThis.knobOsc?.stop();
    };
  }, []); // Empty dependency array means this runs only on unmount

  const handleAnswer = (key: keyof FormData, value: any, autoAdvance: boolean = true) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (autoAdvance) {
      nextStep();
    }
  };

  // *** UPDATED Handler for Drag and Drop order changes ***
  const handleFeatureOrderChange = (newOrderNames: string[]) => {
    // 1. Update the order of names in formData *immediately* but safely after render
    //    We still use setTimeout to push the update after the current render tick.
    setTimeout(() => {
      setFormData(prev => {
        if (JSON.stringify(prev.featurePriorities) !== JSON.stringify(newOrderNames)) {
          // console.log("Updating formData featurePriorities:", newOrderNames);
          return { ...prev, featurePriorities: newOrderNames };
        }
        return prev;
      });
    }, 0);

    // 2. Update the local draggableFeatures state used by the DraggableList component.
    //    This update can also happen deferred, but we need to calculate the new order based
    //    on the names provided.
    setTimeout(() => {
      setDraggableFeatures(currentDraggableFeatures => {
        // Build map from CURRENT state for safety
        const featureMap = new Map<string, FeatureItem>();
        currentDraggableFeatures.forEach(f => featureMap.set(f.name, f));
        // Fallback just in case
        allFeatures.forEach(f => { if (!featureMap.has(f.name)) featureMap.set(f.name, f); });

        const newOrderedFeatures = newOrderNames.map(name => {
          const feature = featureMap.get(name);
          if (!feature) {
            console.error(`FIXED: Feature named "${name}" could not be found in map during reorder.`);
            return null; // Should not happen now
          }
          return feature;
        }).filter(Boolean) as FeatureItem[];

        const currentIds = currentDraggableFeatures.map(f => f.id).join(',');
        const newIds = newOrderedFeatures.map(f => f.id).join(',');

        if (newIds !== currentIds) {
          // console.log("Updating draggableFeatures state:", newOrderedFeatures.map(f=>f.name));
          return newOrderedFeatures; // Return the new array to update state
        }
        return currentDraggableFeatures; // No change needed
      });
    }, 0); // Also deferred
  };


  const nextStep = () => {
    stopCurrentSound();
    globalThis.lockSynth?.triggerAttackRelease("C1", "8n", Tone.now());
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    stopCurrentSound();
    setStep((prev) => prev - 1);
  };

  // Name step specific next button handler
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    nextStep();
  }

  const handleSubmit = async () => {
    stopCurrentSound();
    globalThis.lockSynth?.triggerAttackRelease("C1", "4n", Tone.now());
    setLoading(true);
    try {
      // Capture the state right before submitting
      // The setTimeout in handleFeatureOrderChange should have completed
      const finalFormData = { ...formData };
      console.log("Submitting:", finalFormData); // Log what's being sent

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalFormData),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('API Error Response:', errorBody);
        throw new Error(`Network response was not ok: ${response.statusText} - ${errorBody}`);
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
      {step > 0 && step < 99 && (
        <div className="fixed top-0 left-0 w-full h-2 bg-gray-200 dark:bg-gray-700 z-50">
          <motion.div
            className="h-2 bg-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>
      )}

      {/* Added pt-12 to account for progress bar and back button */}
      <div className="w-full max-w-2xl text-center pt-12 relative">

        {/* --- Back Button --- */}
        {/* Render back button conditionally */}
        {step > 0 && step < 99 && (
          <button
            onClick={prevStep}
            className="absolute top-6 left-0 sm:left-[-4rem] text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer z-20 p-2 rounded-full bg-gray-100 dark:bg-gray-800 shadow"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}


        {/* Render steps based on 'step' state */}

        {/* Step 0: Start Screen */}
        {step === 0 && (
          <motion.div key="step-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4"> How does your city sound? 🔊 </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8"> Help us build a 'Noise Profile' of our community.<br /> It's fast, interactive, and makes a real difference. </p>
            <button onClick={nextStep} className="px-10 py-4 text-xl font-bold bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 cursor-pointer"> Start the Survey </button>
          </motion.div>
        )}

        {/* Step 1: Name Input (NEW) */}
        {step === 1 && (
          <motion.div key="step-1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
              👋 Let's start with your name (optional)
            </h2>
            <form onSubmit={handleNameSubmit} className="flex flex-col items-center gap-4">
              <input
                ref={nameInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleAnswer('name', e.target.value, false)} // Don't auto-advance
                placeholder="Enter your name or leave blank"
                className="w-full p-4 text-lg border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                type="submit" // Use type submit to trigger onSubmit
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
            <SectionButton text="☐ Below 18" onClick={() => handleAnswer('ageGroup', 'Below 18')} />
            <SectionButton text="☐ 18–22 (College Student)" onClick={() => handleAnswer('ageGroup', '18-22')} />
            <SectionButton text="☐ 23–30" onClick={() => handleAnswer('ageGroup', '23-30')} />
            <SectionButton text="☐ 31–45" onClick={() => handleAnswer('ageGroup', '31-45')} />
            <SectionButton text="☐ 45+" onClick={() => handleAnswer('ageGroup', '45+')} />
          </motion.div>
        )}

        {/* Step 3: Occupation (Was 2) */}
        {step === 3 && (
          <motion.div key="step-3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6"> And what's your current role? </h2>
            <SectionButton text="🎓 Student" onClick={() => handleAnswer('occupation', 'Student')} />
            <SectionButton text="💼 Working professional" onClick={() => handleAnswer('occupation', 'Working professional')} />
            <SectionButton text="🏠 Homemaker" onClick={() => handleAnswer('occupation', 'Homemaker')} />
            <SectionButton text="🧐 Other" onClick={() => handleAnswer('occupation', 'Other')} />
          </motion.div>
        )}

        {/* Step 4: Noise Locations (Was 3) */}
        {step === 4 && (
          <motion.div key="step-4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full space-y-6">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4"> 🔊 Where do you experience the most noise? </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4"> Tap all the noisy spots on your daily map: </p>
            <div className="grid grid-cols-2 gap-4">
              {[{ label: 'Home', icon: '🏠' }, { label: 'Commute', icon: '🚗' }, { label: 'College/Work', icon: '🏢' }, { label: 'Metro/Bus Stop', icon: '🚇' }, { label: 'Construction', icon: '🏗️' },].map(({ label, icon }) => {
                const selected = formData.noiseSourceLocations.includes(label);
                return (<button key={label} onClick={(e) => { const updated = selected ? formData.noiseSourceLocations.filter((l) => l !== label) : [...formData.noiseSourceLocations, label]; handleAnswer('noiseSourceLocations', updated, false); const el = e.currentTarget; el.classList.remove('animate-bounceOnce'); void el.offsetWidth; el.classList.add('animate-bounceOnce'); }} className={`flex items-center justify-start gap-3 p-4 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer ${selected ? 'bg-green-200 border-green-500 text-green-800' : 'bg-gray-100 dark:bg-gray-800 hover:border-green-400'}`} > <span className="text-2xl">{icon}</span> <span className="text-lg font-medium">{label}</span> </button>);
              })}
            </div>
            <button onClick={nextStep} className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"> Next </button>
          </motion.div>
        )}

        {/* Step 5: Noise Frequency (Was 4) */}
        {step === 5 && (
          <motion.div key="step-5" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full space-y-6 flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4"> 📊 How often do you experience unwanted noise around you? </h2>
            <CompassDial options={['Rarely', 'Sometimes', 'Often', 'Very Often', 'Constantly']} value={formData.noiseExposureFreq} onChange={(val) => handleAnswer('noiseExposureFreq', val, false)} stopCurrentSound={stopCurrentSound} />
            <button onClick={nextStep} className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"> Next </button>
          </motion.div>
        )}

        {/* Step 6: Noise Sources (Was 5) */}
        {step === 6 && (
          <motion.div key="step-6" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full space-y-6">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4"> 🔉 What are the most common sounds around you? </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2"> Tap to hear and select the sounds you encounter most. </p>
            <div className="grid grid-cols-2 gap-4">
              {[{ label: 'Traffic', icon: '🚗', audio: '/sounds/traffic.mp3' }, { label: 'Construction', icon: '🏗️', audio: '/sounds/construction.mp3' }, { label: 'Loudspeakers', icon: '📢', audio: '/sounds/loudspeaker.mp3' }, { label: 'Neighbours', icon: '🏘️', audio: '/sounds/neighbours.mp3' }, { label: 'Metro/Trains', icon: '🚇', audio: '/sounds/train.mp3' }, { label: 'Others (listen at your own risk)', icon: '🎶', audio: '/sounds/rickroll.mp3' },].map(({ label, icon, audio }) => {
                const selected = formData.commonNoiseSources.includes(label);
                return (<button key={label} onClick={() => { stopCurrentSound(); const updated = selected ? formData.commonNoiseSources.filter((s) => s !== label) : [...formData.commonNoiseSources, label]; handleAnswer('commonNoiseSources', updated, false); if (!selected) { try { const sound = new Audio(audio); sound.play().catch(e => console.error("Error playing sound:", audio, e)); audioRef.current = sound; } catch (e) { console.error("Error creating Audio object:", audio, e); } } }} className={`flex items-center justify-start gap-3 p-4 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer ${selected ? 'bg-green-200 border-green-500 text-green-800' : 'bg-gray-100 dark:bg-gray-800 hover:border-green-400'}`} > <span className="text-2xl">{icon}</span> <span className="text-lg font-medium">{label}</span> </button>);
              })}
            </div>
            <button onClick={nextStep} className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"> Next </button>
          </motion.div>
        )}

        {/* Step 7: Focus Disturbance (Was 6) */}
        {step === 7 && (
          <motion.div key="step-7" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full space-y-6">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4"> 😣 How often does noise disturb your focus or sleep? </h2>
            <div className="grid grid-cols-2 gap-4">
              {['Rarely', 'Sometimes', 'Often', 'Almost Always'].map((option) => (<button key={option} onClick={() => handleAnswer('focusDisturbance', option, true)} className={`p-4 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer ${formData.focusDisturbance === option ? 'bg-green-200 border-green-500 text-green-800' : 'bg-gray-100 dark:bg-gray-800 hover:border-green-400'}`} > {option} </button>))}
            </div>
          </motion.div>
        )}


        {/* Step 8: Headphone Frequency (Was 7) */}
        {step === 8 && (
          <motion.div key="step-8" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full space-y-6 flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4"> 🎧 How often do you use headphones to block out city noise? </h2>
            <CompassDial options={Array.from({ length: 10 }, (_, i) => String(i + 1))} value={String(formData.headphoneFreq)} onChange={(val) => handleAnswer('headphoneFreq', parseInt(val), false)} stopCurrentSound={stopCurrentSound} />
            <button onClick={nextStep} className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"> Next </button>
          </motion.div>
        )}

        {/* Step 9: Bother Level (Was 8) */}
        {step === 9 && (
          <motion.div key="step-9" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full space-y-6 flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4"> 📶 At what point does noise start to bother you? </h2>
            <CompassDial options={['Library quiet (40dB)', 'Conversation (50dB)', 'Busy café (60dB)', 'Street traffic (70dB)', 'Honking (80dB)', 'Construction (90dB)', 'Loud music (100dB)', 'Jackhammer (110dB)']} value={formData.botherLabel} onChange={(label) => { const botherMap: { [key: string]: number } = { 'Library quiet (40dB)': 40, 'Conversation (50dB)': 50, 'Busy café (60dB)': 60, 'Street traffic (70dB)': 70, 'Honking (80dB)': 80, 'Construction (90dB)': 90, 'Loud music (100dB)': 100, 'Jackhammer (110dB)': 110, }; handleAnswer('botherLabel', label, false); handleAnswer('botherLevel', botherMap[label] || 40, false); }} stopCurrentSound={stopCurrentSound} />
            <button onClick={nextStep} className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"> Next </button>
          </motion.div>
        )}

        {/* --- SWIPE QUESTIONS --- */}

        {/* Step 10: Community Seriousness (Was 9) */}
        {step === 10 && (
          <motion.div key="step-10" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.3 }} className="w-full">
            <SwipeQuestion question="💡 Do you think noise pollution is taken seriously in your community?" options={{ up: 'Yes, definitely', right: 'Somewhat', down: 'Not really', left: 'Not sure' }} onAnswer={(answer) => handleAnswer('communitySeriousness', answer, true)} />
          </motion.div>
        )}

        {/* Step 11: Map Interest (Was 10) */}
        {step === 11 && (
          <motion.div key="step-11" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.3 }} className="w-full">
            <SwipeQuestion question="🗺️ Would a real-time city noise map help you?" options={{ up: 'Yes, very useful', right: 'Maybe', down: 'Not really useful', left: 'No, not at all' }} onAnswer={(answer) => handleAnswer('mapInterest', answer, true)} />
          </motion.div>
        )}


        {/* Step 12: Citizen Scientist (Was 11) */}
        {step === 12 && (
          <motion.div key="step-12" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.3 }} className="w-full">
            <SwipeQuestion question="🧪 Would you contribute by recording or reporting noise?" options={{ up: 'Yes, definitely', right: 'Maybe, occasionally', down: 'Unlikely', left: 'No, not interested' }} onAnswer={(answer) => handleAnswer('citizenScientist', answer, true)} />
          </motion.div>
        )}


        {/* Step 13: Drag and Drop (Was 12) */}
        {step === 13 && (
          <motion.div key="step-13" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
              🧩 Last step! Drag your favorite features to the top.
            </h2>
            {/* Use the DraggableList component */}
            <DraggableList
              initialItems={draggableFeatures} // Pass the state with full objects
              onOrderChange={handleFeatureOrderChange} // Pass the handler
            />
            {/* Changed button to Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-10 py-4 mt-4 text-xl font-bold bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" // Added margin-top
            >
              {loading ? 'Submitting...' : 'Confirm Order & Submit'}
            </button>
          </motion.div>
        )}

        {/* Step 99: Final "Persona" Screen */}
        {step === 99 && (
          <motion.div key="step-99" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4"> Thank You! </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8"> Your submission has been recorded. </p>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-2"> Your Noise Persona: 🧘 Zen Seeker </h2>
              <p className="text-gray-700 dark:text-gray-300"> (Dynamic persona description and mini-analytics go here.) </p>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}

