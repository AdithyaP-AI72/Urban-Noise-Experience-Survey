// FILE: components/survey/SectionButton.tsx

"use client";

import React from 'react';

type SectionButtonProps = {
    text: string;
    onClick: () => void;
};

const SectionButton = ({ text, onClick }: SectionButtonProps) => (
    <button
        onClick={onClick}
        className="w-full max-w-md p-4 mb-3 text-left text-lg font-medium bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm hover:bg-green-100 dark:hover:bg-green-900 border border-transparent hover:border-green-500 transition-all duration-200 cursor-pointer"
    >
        {text}
    </button>
);

export default SectionButton;