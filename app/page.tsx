"use client"; // This MUST be a client component to use state

import { useState } from 'react';

// Define the shape of our form data
const defaultFormData = {
  ageGroup: '',
  occupation: '',
  noiseExposureFreq: 'Sometimes',
  noiseSourceLocations: [],
  noiseRating: 3,
  commonNoiseSources: [],
  focusDisturbance: 'Sometimes',
  sleepEffect: 'Not much',
  stressEffect: 'Occasionally',
  headphoneFreq: 5,
  botherLevel: 60,
  botherLabel: 'Normal Conversation',
  communitySeriousness: 'Not sure',
  mapInterest: 'Maybe',
  citizenScientist: 'Maybe',
  featurePriorities: ['Heatmaps', 'Quieter Routes', 'Forecasts', 'Report & Learn'],
};

export default function SurveyHome() {
  // State to track which question/section we are on
  const [step, setStep] = useState(0); // 0 = Start Screen

  // State to hold all the answers
  const [formData, setFormData] = useState(defaultFormData);

  // State for loading spinner during submission
  const [loading, setLoading] = useState(false);

  // Helper function to update form data and auto-advance
  const handleAnswer = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    nextStep();
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  // Function to send data to our API
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Go to the final "Persona" screen
      setStep(99); // Use a unique number for the end screen
    } catch (error) {
      console.error('Failed to submit survey:', error);
      alert('There was an error submitting your survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reusable Button Component for Section 1
  const SectionButton = ({ text, onClick }: { text: string, onClick: () => void }) => (
    <button
      onClick={onClick}
      className="w-full max-w-md p-4 mb-3 text-left text-lg font-medium bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm hover:bg-green-100 dark:hover:bg-green-900 border border-transparent hover:border-green-500 transition-all duration-200"
    >
      {text}
    </button>
  );


  // Main render logic
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 lg:p-24 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="w-full max-w-2xl text-center">

        {/* Step 0: Start Screen */}
        {step === 0 && (
          <div className="animate-fadeIn">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              How does your city sound? 🔊
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Help us build a 'Noise Profile' of our community.
              <br />
              It's fast, interactive, and makes a real difference.
            </p>
            <button
              onClick={nextStep}
              className="px-10 py-4 text-xl font-bold bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105"
            >
              Start the Survey
            </button>
          </div>
        )}

        {/* Step 1: Section 1 - Age Group */}
        {step === 1 && (
          <div className="w-full animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
              🧠 First, what's your age group?
            </h2>
            <SectionButton text="☐ Below 18" onClick={() => handleAnswer('ageGroup', 'Below 18')} />
            <SectionButton text="☐ 18–22 (College Student)" onClick={() => handleAnswer('ageGroup', '18-22')} />
            <SectionButton text="☐ 23–30" onClick={() => handleAnswer('ageGroup', '23-30')} />
            <SectionButton text="☐ 31–45" onClick={() => handleAnswer('ageGroup', '31-45')} />
            <SectionButton text="☐ 45+" onClick={() => handleAnswer('ageGroup', '45+')} />
          </div>
        )}

        {/* Step 2: Section 1 - Occupation */}
        {step === 2 && (
          <div className="w-full animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
              And what's your current role?
            </h2>
            <SectionButton text="🎓 Student" onClick={() => handleAnswer('occupation', 'Student')} />
            <SectionButton text="💼 Working professional" onClick={() => handleAnswer('occupation', 'Working professional')} />
            <SectionButton text="🏠 Homemaker" onClick={() => handleAnswer('occupation', 'Homemaker')} />
            <SectionButton text="🧐 Other" onClick={() => handleAnswer('occupation', 'Other')} />
          </div>
        )}

        {/* --------------------------------------------------
          PLACEHOLDER SECTIONS - Add your components here
          --------------------------------------------------
        */}

        {/* Step 3: Section 2 - Noise Locations */}
        {step === 3 && (
          <div className="w-full animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
              🔊 Where do you experience the most noise?
            </h2>
            <p className="mb-4">(Section 2: Multi-select icons go here)</p>
            <button onClick={nextStep} className="px-6 py-2 bg-gray-200 rounded-md">Next</button>
          </div>
        )}

        {/* Step 4: Section 2 - Noise Rating */}
        {step === 4 && (
          <div className="w-full animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
              How noisy is your day-to-day?
            </h2>
            <p className="mb-4">(Section 2: Emoji scale goes here)</p>
            <button onClick={nextStep} className="px-6 py-2 bg-gray-200 rounded-md">Next</button>
          </div>
        )}

        {/* Step 5: Section 2 - Noise Sources */}
        {step === 5 && (
          <div className="w-full animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
              What are the most common sounds around you?
            </h2>
            <p className="mb-4">(Section 2: Sound icons go here)</p>
            <button onClick={nextStep} className="px-6 py-2 bg-gray-200 rounded-md">Next</button>
          </div>
        )}

        {/* Step 6: Section 3 - Focus */}
        {step === 6 && (
          <div className="w-full animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
              😣 How often does noise disturb your focus or sleep?
            </h2>
            <p className="mb-4">(Section 3: Button cards go here)</p>
            <button onClick={nextStep} className="px-6 py-2 bg-gray-200 rounded-md">Next</button>
          </div>
        )}

        {/* Step 7: Section 3 - Headphone Slider */}
        {step === 7 && (
          <div className="w-full animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
              How often do you use headphones to block out city noise?
            </h2>
            <p className="mb-4">(Section 3: 1-10 slider goes here)</p>
            <button onClick={nextStep} className="px-6 py-2 bg-gray-200 rounded-md">Next</button>
          </div>
        )}

        {/* Step 8: Section 3 - Decibel Slider */}
        {step === 8 && (
          <div className="w-full animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
              At what point does noise start to bother you?
            </h2>
            <p className="mb-4">(Section 3: Interactive Decibel slider goes here)</p>
            <button onClick={nextStep} className="px-6 py-2 bg-gray-200 rounded-md">Next</button>
          </div>
        )}

        {/* Step 9-11: Section 4 - Awareness/Solutions */}
        {step === 9 && (
          <div className="w-full animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
              💡 (Questions for Section 4 go here)
            </h2>
            <p className="mb-4">(Q9, Q10 with image, Q11)</p>
            <button onClick={nextStep} className="px-6 py-2 bg-gray-200 rounded-md">Next</button>
          </div>
        )}

        {/* Step 10: Section 5 - Drag and Drop */}
        {step === 10 && (
          <div className="w-full animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
              🧩 Last step! Drag your favorite features to the top.
            </h2>
            <p className="mb-4">(Section 5: Drag and Drop list goes here)</p>

            {/* Final Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-10 py-4 text-xl font-bold bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : 'Build My Noise Persona!'}
            </button>
          </div>
        )}


        {/* Step 99: Final "Persona" Screen */}
        {step === 99 && (
          <div className="animate-fadeIn text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Thank You!
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Your submission has been recorded.
            </p>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-2">
                Your Noise Persona: 🧘 Zen Seeker
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                (Your dynamic persona description and mini-analytics will go here.)
              </p>
            </div>
          </div>
        )}

        {/* Back button (optional, shown after step 1) */}
        {step > 1 && step < 99 && (
          <button
            onClick={prevStep}
            className="mt-8 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            &larr; Back
          </button>
        )}

      </div>
    </main>
  );
}

// Add this to your `globals.css` file for the animation:
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
*/