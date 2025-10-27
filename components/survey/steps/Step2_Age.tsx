// FILE: components/survey/steps/Step2_Age.tsx

"use client";

import SurveyStep from '../SurveyStep';
import SectionButton from '../SectionButton';
import { FormData } from '../data';

type Props = {
    handleAnswer: (key: keyof FormData, value: any, autoAdvance?: boolean) => void;
};

export default function Step2_Age({ handleAnswer }: Props) {
    return (
        <SurveyStep stepKey="step-2">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6"> 🧠 What's your age group? </h2>
            <SectionButton text="☐ Below 18" onClick={async () => await handleAnswer('ageGroup', 'Below 18')} />
            <SectionButton text="☐ 18–22 (College Student)" onClick={async () => await handleAnswer('ageGroup', '18-22')} />
            <SectionButton text="☐ 23–30" onClick={async () => await handleAnswer('ageGroup', '23-30')} />
            <SectionButton text="☐ 31–45" onClick={async () => await handleAnswer('ageGroup', '31-45')} />
            <SectionButton text="☐ 45+" onClick={async () => await handleAnswer('ageGroup', '45+')} />
        </SurveyStep>
    );
}