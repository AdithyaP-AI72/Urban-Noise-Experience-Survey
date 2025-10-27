// FILE: components/survey/steps/Step3_Occupation.tsx

"use client";

import SurveyStep from '../SurveyStep';
import SectionButton from '../SectionButton';
import { FormData } from '../data';

type Props = {
    handleAnswer: (key: keyof FormData, value: any, autoAdvance?: boolean) => void;
};

export default function Step3_Occupation({ handleAnswer }: Props) {
    return (
        <SurveyStep stepKey="step-3">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6"> And what's your current role? </h2>
            <SectionButton text="🎓 Student" onClick={async () => await handleAnswer('occupation', 'Student')} />
            <SectionButton text="💼 Working professional" onClick={async () => await handleAnswer('occupation', 'Working professional')} />
            <SectionButton text="🏠 Homemaker" onClick={async () => await handleAnswer('occupation', 'Homemaker')} />
            <SectionButton text="🧐 Other" onClick={async () => await handleAnswer('occupation', 'Other')} />
        </SurveyStep>
    );
}