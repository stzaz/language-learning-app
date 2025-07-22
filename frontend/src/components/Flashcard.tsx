'use client';

import React, { useState } from 'react';
import { VocabularyItem, AIExplanation } from '@/types';

// The props for our Flashcard component
interface FlashcardProps {
    item: VocabularyItem;
}

const Flashcard: React.FC<FlashcardProps> = ({ item }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    // Safely parse the JSON string from the definition field
    let explanation: AIExplanation | null = null;
    try {
        explanation = JSON.parse(item.definition);
    } catch (error) {
        console.error("Failed to parse explanation JSON:", error);
        // Handle cases where the definition is not valid JSON
        explanation = {
            definition: item.definition,
            part_of_speech: 'N/A',
            translation: 'N/A',
            contextual_insight: 'Original explanation format was invalid.'
        };
    }

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div
            className="w-full max-w-lg h-64 perspective-1000"
            onClick={handleFlip}
        >
            <div
                className={`relative w-full h-full transform-style-3d transition-transform duration-700 ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* Front of the card */}
                <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center p-6 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <h2 className="text-5xl font-bold font-serif text-slate-900 dark:text-white">
                        {item.word}
                    </h2>
                </div>

                {/* Back of the card */}
                <div className="absolute w-full h-full backface-hidden bg-slate-50 dark:bg-slate-700 rounded-2xl shadow-xl p-6 flex flex-col gap-3 rotate-y-180 border border-slate-200 dark:border-slate-600 overflow-y-auto">
                    {explanation ? (
                        <>
                            <p className="text-lg">
                                <strong className="font-semibold text-amber-700 dark:text-amber-500 capitalize">{explanation.translation}</strong>
                                <em className="ml-2 text-slate-500 dark:text-slate-400">({explanation.part_of_speech})</em>
                            </p>
                            <div>
                                <strong className="font-semibold text-sm text-slate-800 dark:text-slate-200">Definition:</strong>
                                <p className="mt-1 text-slate-600 dark:text-slate-300">{explanation.definition}</p>
                            </div>
                            {explanation.contextual_insight && (
                                <div>
                                    <strong className="font-semibold text-sm text-slate-800 dark:text-slate-200">Context:</strong>
                                    <p className="mt-1 text-slate-600 dark:text-slate-300 italic">&quot;{item.context_sentence}&quot;</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-slate-500">No explanation available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Flashcard;
