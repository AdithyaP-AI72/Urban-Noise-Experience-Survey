// FILE: components/survey/steps/Step10_Community.tsx

"use client";

import SurveyStep from '../SurveyStep';
import SwipeQuestion from '@/components/SwipeQuestion'; // Assuming this path is correct
import { FormData } from '../data';

type Props = {
    handleAnswer: (key: keyof FormData, value: any, autoAdvance?: boolean) => void;
};

export default function Step10_Community({ handleAnswer }: Props) {
    return (
        <SurveyStep stepKey="step-10" animation="swipe">
            <SwipeQuestion
                question="💡 Do you think noise pollution is taken seriously in your community?"
                options={{ up: 'Yes, definitely', right: 'Somewhat', down: 'Not really', left: 'Not sure' }}
                onAnswer={async (answer) => await handleAnswer('communitySeriousness', answer, true)}
            />
        </SurveyStep>
    );
}