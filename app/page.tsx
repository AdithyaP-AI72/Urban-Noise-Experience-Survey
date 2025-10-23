"use client"; // This MUST be a client component to use state

import { useState } from 'react';
const getThumbColor = (value: number) => {
  switch (value) {
    case 1:
      return '[&::-webkit-slider-thumb]:bg-green-400 [&::-webkit-slider-thumb]:border-green-500';
    case 2:
      return '[&::-webkit-slider-thumb]:bg-yellow-300 [&::-webkit-slider-thumb]:border-yellow-500';
    case 3:
      return '[&::-webkit-slider-thumb]:bg-yellow-500 [&::-webkit-slider-thumb]:border-yellow-600';
    case 4:
      return '[&::-webkit-slider-thumb]:bg-orange-400 [&::-webkit-slider-thumb]:border-orange-500';
    case 5:
      return '[&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:border-red-600';
    default:
      return '[&::-webkit-slider-thumb]:bg-gray-400 [&::-webkit-slider-thumb]:border-gray-500';
  }
};


// Define the shape of our form data
type FormData = {
  ageGroup: string;
  occupation: string;
  noiseExposureFreq: string;
  noiseSourceLocations: string[];
  noiseRating: number;
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
  featurePriorities: string[];
};

const defaultFormData: FormData = {
  ageGroup: '',
  occupation: '',
  noiseExposureFreq: '',
  noiseSourceLocations: [],
  noiseRating: 3,
  commonNoiseSources: [],
  focusDisturbance: '',
  sleepEffect: '',
  stressEffect: '',
  headphoneFreq: 5,
  botherLevel: 60,
  botherLabel: '',
  communitySeriousness: '',
  mapInterest: '',
  citizenScientist: '',
  featurePriorities: ['Heatmaps', 'Quieter Routes', 'Forecasts', 'Report & Learn'],
};

export default function SurveyHome() {
  // State to track which question/section we are on
  const [step, setStep] = useState(0); // 0 = Start Screen

  // State to hold all the answers
  const [formData, setFormData] = useState<FormData>(defaultFormData);

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
  <div className="w-full animate-fadeIn space-y-6">
    <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
      🔊 Where do you experience the most noise?
    </h2>
    <p className="text-gray-600 dark:text-gray-300 mb-4">
      Tap all the noisy spots on your daily map:
    </p>

    <div className="grid grid-cols-2 gap-4">
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
              const updated = selected
                ? formData.noiseSourceLocations.filter((l) => l !== label)
                : [...formData.noiseSourceLocations, label];
              setFormData((prev) => ({ ...prev, noiseSourceLocations: updated }));

              // Trigger bounce animation manually
              const el = e.currentTarget;
              el.classList.remove('animate-bounceOnce');
              void el.offsetWidth; // Force reflow
              el.classList.add('animate-bounceOnce');
            }}
            className={`flex items-center justify-start gap-3 p-4 rounded-lg shadow-sm border transition-all duration-200 ${
              selected
                ? 'bg-green-200 border-green-500'
                : 'bg-gray-100 dark:bg-gray-800 hover:border-green-400'
            }`}
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-lg font-medium">{label}</span>
          </button>
        );
      })}
    </div>

    <button
      onClick={nextStep}
      className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      Next
    </button>
  </div>
)}


        {/* Step 4: Section 2 - Noise Rating */}
        {step === 4 && (
  <div className="w-full animate-fadeIn space-y-6">
    <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
      📊 How noisy is your day-to-day?
    </h2>
    <p className="text-gray-600 dark:text-gray-300 mb-2">
      Slide to rate your typical noise level:
    </p>

    {/* Slider */}
    <div className="relative w-full">
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={formData.noiseRating}
        onChange={(e) => setFormData((prev) => ({ ...prev, noiseRating: parseInt(e.target.value) }))}
        className={`w-full h-3 rounded-full appearance-none bg-gradient-to-r from-green-400 via-yellow-400 to-red-500
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-6
          [&::-webkit-slider-thumb]:w-6
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:transition-all
          [&::-webkit-slider-thumb]:duration-200
          [&::-webkit-slider-thumb]:hover:scale-110
          ${getThumbColor(formData.noiseRating)}
        `}
      />
    </div>

    {/* Labels */}
    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mt-2 px-1">
      <span>😌 Peaceful</span>
      <span>🙂 Mild</span>
      <span>😐 Neutral</span>
      <span>😕 Annoying</span>
      <span>😫 Unbearable</span>
    </div>

    {/* Current Value */}
    <p className="mt-4 text-lg font-medium">
      You rated: {formData.noiseRating} / 5
    </p>

    <button
      onClick={nextStep}
      className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      Next
    </button>
  </div>
)}


        {/* Step 5: Section 2 - Noise Sources */}
        {step === 5 && (
  <div className="w-full animate-fadeIn space-y-6">
    <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
      🔉 What are the most common sounds around you?
    </h2>
    <p className="text-gray-600 dark:text-gray-300 mb-2">
      Tap to hear and select the sounds you encounter most.
    </p>

    <div className="grid grid-cols-2 gap-4">
      {[
        { label: 'Traffic', icon: '🚗', audio: '/sounds/construction.mp3' },
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
              const updated = selected
                ? formData.commonNoiseSources.filter((s) => s !== label)
                : [...formData.commonNoiseSources, label];
              setFormData((prev) => ({ ...prev, commonNoiseSources: updated }));

              const sound = new Audio(audio);
              sound.play();
            }}
            className={`flex items-center justify-start gap-3 p-4 rounded-lg shadow-sm border transition-all duration-200 ${
              selected
                ? 'bg-green-200 border-green-500'
                : 'bg-gray-100 dark:bg-gray-800 hover:border-green-400'
            }`}
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-lg font-medium">{label}</span>
          </button>
        );
      })}
    </div>

    <button
      onClick={nextStep}
      className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      Next
    </button>
  </div>
)}


        {/* Step 6: Section 3 - Focus */}
        {step === 6 && (
  <div className="w-full animate-fadeIn space-y-6">
    <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
      😣 How often does noise disturb your focus or sleep?
    </h2>
    <p className="text-gray-600 dark:text-gray-300 mb-2">
      Choose the option that best reflects your experience:
    </p>

    <div className="grid grid-cols-2 gap-4">
      {['Rarely', 'Sometimes', 'Often', 'Almost Always'].map((option) => (
        <button
          key={option}
          onClick={() => handleAnswer('focusDisturbance', option)}
          className={`p-4 rounded-lg shadow-sm border transition-all duration-200 ${
            formData.focusDisturbance === option
              ? 'bg-green-200 border-green-500'
              : 'bg-gray-100 dark:bg-gray-800 hover:border-green-400'
          }`}
        >
          {option}
        </button>
      ))}
    </div>

    <button
      onClick={nextStep}
      className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      Next
    </button>
  </div>
)}


        {/* Step 7: Section 3 - Headphone Slider */}
        {step === 7 && (
  <div className="w-full animate-fadeIn space-y-6">
    <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
      🎧 How often do you use headphones to block out city noise?
    </h2>
    <p className="text-gray-600 dark:text-gray-300 mb-2">
      Drag the slider to reflect your usage:
    </p>

    {/* Slider */}
    <div className="relative w-full">
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={formData.headphoneFreq}
        onChange={(e) => setFormData((prev) => ({ ...prev, headphoneFreq: parseInt(e.target.value) }))}
        className="w-full h-3 rounded-full appearance-none bg-gradient-to-r from-green-400 via-yellow-400 to-red-500
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-6
          [&::-webkit-slider-thumb]:w-6
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-gray-400
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:transition-all
          [&::-webkit-slider-thumb]:duration-200
          [&::-webkit-slider-thumb]:hover:scale-110"
      />
    </div>

    {/* Emoji Feedback */}
    <div className="text-3xl text-center mt-2">
      {formData.headphoneFreq <= 2 && '🧘‍♂️'}
      {formData.headphoneFreq > 2 && formData.headphoneFreq <= 5 && '🎶'}
      {formData.headphoneFreq > 5 && formData.headphoneFreq <= 8 && '🔊'}
      {formData.headphoneFreq > 8 && '🧱'}
    </div>

    {/* Value Display */}
    <p className="mt-2 text-lg font-medium text-center">
      {formData.headphoneFreq}/10
    </p>

    <button
      onClick={nextStep}
      className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      Next
    </button>
  </div>
)}


        {/* Step 8: Section 3 - Decibel Slider */}
        {step === 8 && (
  <div className="w-full animate-fadeIn space-y-6">
    <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
      📶 At what point does noise start to bother you?
    </h2>
    <p className="text-gray-600 dark:text-gray-300 mb-2">
      Drag the slider to choose your discomfort threshold:
    </p>

    {/* Slider */}
    <div className="relative w-full">
      <input
        type="range"
        min={40}
        max={100}
        step={20}
        value={formData.botherLevel}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          const labelMap: { [key: number]: string } = {
            40: 'Library Quiet',
            60: 'Normal Conversation',
            80: 'Busy Traffic',
            100: 'Construction Site',
          };
          setFormData((prev) => ({
            ...prev,
            botherLevel: val,
            botherLabel: labelMap[val],
          }));
        }}
        className="w-full h-3 rounded-full appearance-none bg-gradient-to-r from-green-400 via-yellow-400 to-red-500
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-6
          [&::-webkit-slider-thumb]:w-6
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-gray-400
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:transition-all
          [&::-webkit-slider-thumb]:duration-200
          [&::-webkit-slider-thumb]:hover:scale-110"
      />
    </div>

    {/* Labels */}
    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mt-2 px-1">
      <span>🤫 40 dB</span>
      <span>🗣️ 60 dB</span>
      <span>🚗 80 dB</span>
      <span>🏗️ 100 dB</span>
    </div>

    {/* Feedback */}
    <p className="mt-4 text-lg font-medium text-center">
      You start feeling uncomfortable at <strong>{formData.botherLevel} dB</strong> — <em>{formData.botherLabel}</em>
    </p>

    <button
      onClick={nextStep}
      className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      Next
    </button>
  </div>
)}


        {/* Step 9-11: Section 4 - Awareness/Solutions */}
        {step === 9 && (
  <div className="w-full animate-fadeIn space-y-10">
    {/* Q1: Community Seriousness */}
    <div>
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
        💡 Do you think noise pollution is taken seriously in your community?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['Yes', 'No', 'Not sure'].map((option) => (
          <button
            key={option}
            onClick={() => setFormData((prev) => ({ ...prev, communitySeriousness: option }))}
            className={`p-4 rounded-lg shadow-sm border transition-all duration-200 ${
              formData.communitySeriousness === option
                ? 'bg-green-200 border-green-500'
                : 'bg-gray-100 dark:bg-gray-800 hover:border-green-400'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>

    {/* Q2: Interest in Noise Map */}
    <div>
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
        🗺️ Would a real-time city noise map showing quiet vs. noisy zones help you?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['Yes', 'Maybe', 'No'].map((option) => (
          <button
            key={option}
            onClick={() => setFormData((prev) => ({ ...prev, mapInterest: option }))}
            className={`p-4 rounded-lg shadow-sm border transition-all duration-200 ${
              formData.mapInterest === option
                ? 'bg-green-200 border-green-500'
                : 'bg-gray-100 dark:bg-gray-800 hover:border-green-400'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>

    {/* Q3: Citizen Scientist Contribution */}
    <div>
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
        🧪 Would you be willing to contribute by recording or reporting noise levels through your phone?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['Yes', 'Maybe', 'No'].map((option) => (
          <button
            key={option}
            onClick={() => setFormData((prev) => ({ ...prev, citizenScientist: option }))}
            className={`p-4 rounded-lg shadow-sm border transition-all duration-200 ${
              formData.citizenScientist === option
                ? 'bg-green-200 border-green-500'
                : 'bg-gray-100 dark:bg-gray-800 hover:border-green-400'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>

    <button
      onClick={nextStep}
      className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      Next
    </button>
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