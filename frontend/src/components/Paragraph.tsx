'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ParagraphProps {
    originalText: string;
    translatedText: string;
    onWordClick: (word: string, context: string) => void;
}

const Paragraph: React.FC<ParagraphProps> = ({ originalText, translatedText, onWordClick }) => {
    const [isTranslationVisible, setIsTranslationVisible] = useState(false);

    const toggleTranslation = () => {
        setIsTranslationVisible(!isTranslationVisible);
    };

    return (
        // The outer div is no longer the relative parent for the icon
        <div className="mb-8">
            {/* This new div is now the relative parent for the text and the icon */}
            <div className="relative group">
                {/* The main text content */}
                <p className="text-xl leading-loose text-slate-800 dark:text-slate-300">
                    {originalText.split(/(\s+)/).map((segment, index) => {
                        const isWord = segment.trim() !== '';
                        return isWord ? (
                            <span
                                key={index}
                                onClick={() => onWordClick(segment, originalText)}
                                className="cursor-pointer hover:bg-amber-200/50 dark:hover:bg-amber-800/50 rounded-md transition-colors"
                            >
                                {segment}
                            </span>
                        ) : (
                            <span key={index}>{segment}</span> // Preserves whitespace
                        );
                    })}
                </p>

                {/* The toggle button's position is now locked to this container */}
                <div className="absolute -left-16 top-0 h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={toggleTranslation}
                        className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300/70 dark:hover:bg-slate-600/70 text-slate-500 dark:text-slate-400"
                        title={isTranslationVisible ? "Hide translation" : "Show translation"}
                    >
                        {isTranslationVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            {/* The translation is now outside the relative container, so it doesn't affect the icon's position */}
            {isTranslationVisible && (
                <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 border-l-4 border-amber-500 rounded-r-lg transition-all duration-300 ease-in-out">
                    <p className="text-base text-slate-600 dark:text-slate-400 italic">
                        {translatedText}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Paragraph;
