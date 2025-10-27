// FILE: components/survey/steps/Step12_CitizenScientist.tsx

"use client";

import SurveyStep from '../SurveyStep';
import SwipeQuestion from '@/components/SwipeQuestion'; // Assuming this path is correct
import { FormData } from '../data';

type Props = {
    handleAnswer: (key: keyof FormData, value: any, autoAdvance?: boolean) => void;
};

export default function Step12_CitizenScientist({ handleAnswer }: Props) {
    return (
        <SurveyStep stepKey="step-12" animation="swipe">
            <SwipeQuestion
                question="🧪 Would you contribute by recording or reporting noise?"
                options={{ up: 'Yes, definitely', right: 'Maybe, occasionally', down: 'Unlikely', left: 'No, not interested' }}
                onAnswer={async (answer) => await handleAnswer('citizenScientist', answer, true)}
            />
        </SurveyStep>
    );
}