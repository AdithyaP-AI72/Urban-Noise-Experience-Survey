// FILE: app/page.tsx

"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Tone from 'tone';

// --- Local Imports ---
// Data
import { FormData, defaultFormData, allFeatures, FeatureItem } from '@/components/survey/Data';
// Sounds
import { initializeSounds, ensureAudioContextStarted } from '@/lib/sounds';
// Components
import CompassDial from '@/components/CompassDial';
import SwipeQuestion from '@/components/SwipeQuestion';
import DraggableList from '@/components/DraggableList';

// Step Components
import Step0_Start from '@/components/survey/steps/Step0_Start';
import Step1_Name from '@/components/survey/steps/Step1_Name';
import Step2_Age from '@/components/survey/steps/Step2_Age';
import Step3_Occupation from '@/components/survey/steps/Step3_Occupation';
import Step4_Locations from '@/components/survey/steps/Step4_Locations';
import Step5_NoiseFrequency from '@/components/survey/steps/Step5_NoiseFrequency';
import Step6_NoiseSources from '@/components/survey/steps/Step6_NoiseSources';
import Step7_Focus from '@/components/survey/steps/Step7_Focus';
import Step8_Headphones from '@/components/survey/steps/Step8_Headphones';
import Step9_BotherLevel from '@/components/survey/steps/Step9_BotherLevel';
import Step10_Community from '@/components/survey/steps/Step10_Community';
import Step11_MapInterest from '@/components/survey/steps/Step11_MapInterest';
import Step12_CitizenScientist from '@/components/survey/steps/Step12_CitizenScientist';
import Step13_Features from '@/components/survey/steps/Step13_Features';
import Step14_Loading from '@/components/survey/steps/Step14_Loading';
import Step15_Sus from '@/components/survey/steps/Step15_Sus';
import Step99_Persona from '@/components/survey/steps/Step99_Persona';


// --- Main Survey Component ---
export default function SurveyHome() {
  const [step, setStep] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [isDuplicateUser, setIsDuplicateUser] = useState(false);

  // --- Refs ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const prankAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const susAudioRef = useRef<HTMLAudioElement | null>(null);

  // --- Draggable List State ---
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

  // --- Progress Bar ---
  const totalSteps = 13;
  const progress = (step ?? 0) > 0 ? (((step ?? 0) - 1) / totalSteps) * 100 : 0;

  // --- BGM ---
  const resumeBGM = () => {
    setTimeout(() => {
      if (bgmAudioRef.current && bgmAudioRef.current.paused) {
        bgmAudioRef.current.play().catch((e) => console.error("Failed to resume BGM:", e));
      }
    }, 1000); // Delay to avoid overlap
  };

  // --- Effects ---

  // Focus name input on step 1
  useEffect(() => {
    if (step === 1) {
      nameInputRef.current?.focus();
    }
  }, [step]);

  // Main mount effect: runs ONCE
  useEffect(() => {
    const cleanupSounds = initializeSounds();

    if (typeof window !== 'undefined') {
      const isDuplicate = localStorage.getItem('surveySubmitted') === 'true';

      if (isDuplicate) {
        setIsDuplicateUser(true);
        setFormData(prev => ({ ...prev, isDuplicate: true }));
      }
    }
    setStep(0);

    // Cleanup on *component unmount*
    return () => {
      cleanupSounds?.();
      prankAudioRef.current?.pause();
      prankAudioRef.current = null;
      bgmAudioRef.current?.pause();
      bgmAudioRef.current = null;
      susAudioRef.current?.pause();
      susAudioRef.current = null;
    };
  }, []); // Empty array = run once on mount

  // Audio management effect: runs on [step] change
  useEffect(() => {
    // 👻 "Sus" prank at step 15
    if (step === 15) {
      bgmAudioRef.current?.pause();
      prankAudioRef.current?.pause();

      if (!susAudioRef.current) {
        try {
          const audio = new Audio("/sounds/sus.mp3");
          audio.loop = true;
          audio.volume = 0.5;
          audio.play().catch((e) => console.error("Sus audio failed:", e));
          susAudioRef.current = audio;
        } catch (e) {
          console.error("Error creating Sus audio:", e);
        }
      }

      const timer = setTimeout(() => {
        setStep(1);
      }, 4000);

      return () => clearTimeout(timer);
    }
    // 🎶 Rickroll prank at step 14
    else if (step === 14) {
      bgmAudioRef.current?.pause();
      susAudioRef.current?.pause();

      // Run the submission sequence (messages + fetch)
      runSubmissionSequence();
    }
    // 🎉 Persona screen (99)
    else if (step === 99) {
      prankAudioRef.current?.pause();
      prankAudioRef.current = null;
      susAudioRef.current?.pause();
      susAudioRef.current = null;

      if (!bgmAudioRef.current) {
        try {
          const bgm = new Audio("/sounds/claire-de-lune-bgm.mp3");
          bgm.loop = true;
          bgm.volume = 0.3;
          bgm.play().catch((e) => console.error("BGM failed to play:", e));
          bgmAudioRef.current = bgm;
        } catch (e) {
          console.error("Error creating BGM audio:", e);
        }
      } else if (bgmAudioRef.current.paused) {
        bgmAudioRef.current.play().catch((e) => console.error("Failed to resume BGM:", e));
      }
    }
    // All other steps (0-13)
    else {
      if (prankAudioRef.current) {
        prankAudioRef.current.pause();
        prankAudioRef.current = null;
      }
      if (susAudioRef.current) {
        susAudioRef.current.pause();
        susAudioRef.current = null;
      }
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
      }
    }
  }, [step]);

  // General sound cleanup
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
    if (susAudioRef.current && !susAudioRef.current.paused) {
      susAudioRef.current.pause();
    }
  };

  useEffect(() => {
    return () => {
      stopCurrentSound();
      globalThis.knobOsc?.stop();
    };
  }, []);


  // --- Handlers ---

  const handleAnswer = async (key: keyof FormData, value: any, autoAdvance: boolean = true) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (autoAdvance) {
      await nextStep(key);
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

  const nextStep = async (key?: keyof FormData) => {
    await ensureAudioContextStarted();
    stopCurrentSound();
    setError(null);

    if (step === 0 && isDuplicateUser) {
      setStep(15);
      return;
    }

    const swipeQuestions: (keyof FormData)[] = ['communitySeriousness', 'mapInterest', 'citizenScientist'];
    if (!key || !swipeQuestions.includes(key)) {
      globalThis.lockSynth?.triggerAttackRelease("C1", "8n", Tone.now());
    }

    setStep((prev) => (prev ?? 0) + 1);
  };

  const prevStep = async () => {
    await ensureAudioContextStarted();
    stopCurrentSound();
    setError(null);
    setStep((prev) => (prev ?? 0) - 1);
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() === "") {
      setError("Please enter your name to continue.");
      return;
    }
    setError(null);
    await nextStep();
  }

  const runSubmissionSequence = async () => {
    await ensureAudioContextStarted();

    const messages = [
      "Encrypting your thoughts...",
      "Uploading to Noise Surveillance HQ...",
      "Analyzing your vibe...",
      "Detecting sarcasm...",
      "Just kidding 😄 — submission complete!",
    ];
    for (let i = 0; i < messages.length; i++) {
      if (step === 14) {
        setLoadingMessage(messages[i]);
        await new Promise((res) => setTimeout(res, 1000));
      }
    }

    setLoading(true);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('API Error Response:', errorBody);
        throw new Error(`Network response was not ok: ${response.statusText} - ${errorBody}`);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('surveySubmitted', 'true');
      }
      setStep(99); // Go to Persona page
    } catch (error) {
      console.error('Failed to submit survey:', error);
      alert(`There was an error submitting your survey. ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (formData.featurePriorities.length < 4) {
      setError("Please rank all features before submitting.");
      return;
    }

    setError(null);
    globalThis.lockSynth?.triggerAttackRelease("C1", "4n", Tone.now());
    setStep(14); // Go to rickroll page
  };

  const handleShare = async () => {
    const shareData = {
      title: 'SoundScape Survey',
      text: 'Try out this interactive noise survey experience! 👉',
      url: 'https://urban-noise-experience-survey.vercel.app/'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share failed:", err);
      }
    }
    else if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopyMessage("Link Copied!");
        setTimeout(() => setCopyMessage(""), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
        setCopyMessage("Failed to copy link.");
        setTimeout(() => setCopyMessage(""), 2000);
      }
    }
    else {
      setCopyMessage("Sharing not supported on this browser/connection.");
      console.warn("Web Share and Clipboard API not available.");
      setTimeout(() => setCopyMessage(""), 3000);
    }
  };

  // *** Handler for the cancel button ***
  const handleCancelUpload = async () => {
    await ensureAudioContextStarted(); // Ensure audio is ready

    // Play sound first
    if (!prankAudioRef.current) {
      try {
        const audio = new Audio("/sounds/rickroll.mp3");
        audio.loop = true;
        audio.volume = 0.4;
        prankAudioRef.current = audio; // Store ref immediately

        // *** CHANGE: Wait for play() to succeed, *then* alert ***
        audio.play()
          .then(() => {
            // Sound is now playing
            alert("You cannot cancel the upload!! 😈");
          })
          .catch((e) => {
            // If play fails (e.g., browser block), still show alert
            console.error("Rickroll failed:", e);
            alert("You cannot cancel the upload!! 😈");
          });

      } catch (e) {
        console.error("Error creating Rickroll audio:", e);
        // If creating audio fails, show alert
        alert("You cannot cancel the upload!! 😈");
      }
    } else {
      // If audio is *already* playing (e.g., clicked multiple times), just show the alert
      alert("You cannot cancel the upload!! 😈");
    }
  };


  // --- Render Step Component ---
  const renderCurrentStep = () => {
    switch (step) {
      case 0:
        return <Step0_Start onNextStep={() => nextStep()} />;
      case 1:
        return <Step1_Name
          formData={formData}
          handleAnswer={handleAnswer}
          handleNameSubmit={handleNameSubmit}
          nameInputRef={nameInputRef}
          error={error}
          setError={setError}
        />;
      case 2:
        return <Step2_Age handleAnswer={handleAnswer} />;
      case 3:
        return <Step3_Occupation handleAnswer={handleAnswer} />;
      case 4:
        return <Step4_Locations
          formData={formData}
          handleAnswer={handleAnswer}
          onNextStep={() => nextStep()}
          error={error}
          setError={setError}
        />;
      case 5:
        return <Step5_NoiseFrequency
          formData={formData}
          handleAnswer={handleAnswer}
          onNextStep={() => nextStep()}
          stopCurrentSound={stopCurrentSound}
        />;
      case 6:
        return <Step6_NoiseSources
          formData={formData}
          handleAnswer={handleAnswer}
          onNextStep={() => nextStep()}
          error={error}
          setError={setError}
          stopCurrentSound={stopCurrentSound}
          audioRef={audioRef}
        />;
      case 7:
        return <Step7_Focus formData={formData} handleAnswer={handleAnswer} />;
      case 8:
        return <Step8_Headphones
          formData={formData}
          handleAnswer={handleAnswer}
          onNextStep={() => nextStep()}
          stopCurrentSound={stopCurrentSound}
        />;
      case 9:
        return <Step9_BotherLevel
          formData={formData}
          handleAnswer={handleAnswer}
          onNextStep={() => nextStep()}
          stopCurrentSound={stopCurrentSound}
        />;
      case 10:
        return <Step10_Community handleAnswer={handleAnswer} />;
      case 11:
        return <Step11_MapInterest handleAnswer={handleAnswer} />;
      case 12:
        return <Step12_CitizenScientist handleAnswer={handleAnswer} />;
      case 13:
        return <Step13_Features
          draggableFeatures={draggableFeatures}
          onOrderChange={handleFeatureOrderChange}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />;
      case 14:
        return <Step14_Loading
          loadingMessage={loadingMessage}
          onCancelClick={handleCancelUpload}
        />;
      case 15:
        return <Step15_Sus />;
      case 99:
        return <Step99_Persona
          formData={formData}
          onShare={handleShare}
          copyMessage={copyMessage}
        />;
      case null:
      default:
        return (
          <div className="flex justify-center items-center h-48">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
    }
  };


  // --- Main Render Logic ---
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 lg:p-24 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden relative">

      {/* --- PROGRESS BAR --- */}
      {step !== null && step > 0 && step < 14 && (
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
        {step !== null && step > 0 && step < 14 && (
          <button
            onClick={prevStep}
            className="absolute top-4 left-0 sm:left-[-4rem] text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer z-20 p-2 rounded-full bg-gray-100 dark:bg-gray-800 shadow"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* --- Render Current Step --- */}
        {renderCurrentStep()}

      </div>
    </main>
  );
}