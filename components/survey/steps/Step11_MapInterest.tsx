// FILE: components/survey/steps/Step11_MapInterest.tsx

"use client";

import SurveyStep from '../SurveyStep';
import SwipeQuestion from '@/components/SwipeQuestion'; // Assuming this path is correct
import { FormData } from '../data';

type Props = {
    handleAnswer: (key: keyof FormData, value: any, autoAdvance?: boolean) => void;
};

export default function Step11_MapInterest({ handleAnswer }: Props) {
    return (
        <SurveyStep stepKey="step-11" animation="swipe">
            <SwipeQuestion
                question="🗺️ Would a real-time city noise map help you?"
                options={{ up: 'Yes, very useful', right: 'Maybe', down: 'Not really useful', left: 'No, not at all' }}
                onAnswer={async (answer) => await handleAnswer('mapInterest', answer, true)}
            />
        </SurveyStep>
    );
}