// FILE: components/survey/steps/Step13_Features.tsx

"use client";

import SurveyStep from '../SurveyStep';
import DraggableList, { FeatureItem } from '@/components/DraggableList'; // Assuming this path is correct

type Props = {
    draggableFeatures: FeatureItem[];
    onOrderChange: (newOrderNames: string[]) => void;
    onSubmit: () => void;
    loading: boolean;
    error: string | null;
};

export default function Step13_Features({ draggableFeatures, onOrderChange, onSubmit, loading, error }: Props) {
    return (
        <SurveyStep stepKey="step-13">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
                🧩 Last step! Drag your favorite features to the top.
            </h2>
            <DraggableList
                initialItems={draggableFeatures}
                onOrderChange={onOrderChange}
            />
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <button
                onClick={onSubmit}
                disabled={loading}
                className="px-10 py-4 mt-4 text-xl font-bold bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                {loading ? 'Submitting...' : 'Confirm Order & Submit'}
            </button>
        </SurveyStep>
    );
}