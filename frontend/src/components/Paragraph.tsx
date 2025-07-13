// frontend/src/components/Paragraph.tsx
'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ParagraphProps {
    originalText: string;
    translatedText: string;
    onWordClick: (word: string, context: string) => void;
    fontSize: string; // New prop to accept font size class
    lineHeight: string; // New prop to accept line height class
}

// A list of common Spanish stop words to make the reading experience cleaner.
const spanishStopWords = new Set([
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un',
    'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le',
    'ya', 'o', 'este', 'ha', 'sí', 'porque', 'esta', 'cuando', 'muy', 'sin', 'sobre',
    'también', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante',
    'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos',
    'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'entre', 'tu', 'te', 'otro', 'era',
    'fue', 'mucho', 'le', 'un', 'una', 'unos', 'unas', 'es'
]);

const Paragraph: React.FC<ParagraphProps> = ({ originalText, translatedText, onWordClick, fontSize, lineHeight }) => {
    const [isTranslationVisible, setIsTranslationVisible] = useState(false);

    const toggleTranslation = () => {
        setIsTranslationVisible(!isTranslationVisible);
    };

    // This regex splits the text by spaces and also separates punctuation.
    const segments = originalText.split(/([,¡!¿?:"“”'‘’.\s])/g).filter(Boolean);

    return (
        <div className="mb-8">
            <div className="relative group">
                {/* Apply the dynamic fontSize and lineHeight classes passed down as props */}
                <p className={`${fontSize} ${lineHeight} text-slate-800 dark:text-slate-300 transition-all duration-300`}>
                    {segments.map((segment, index) => {
                        const cleanedSegment = segment.trim().toLowerCase();

                        // Check if the segment is a word and NOT a stop word
                        const isClickable = cleanedSegment && !spanishStopWords.has(cleanedSegment) && !/^[.,¡!¿?:"“”'‘’\s]+$/.test(segment);

                        if (isClickable) {
                            return (
                                <span
                                    key={index}
                                    onClick={() => onWordClick(segment, originalText)}
                                    className="cursor-pointer hover:bg-amber-200/50 dark:hover:bg-amber-800/50 rounded-md transition-colors"
                                >
                                    {segment}
                                </span>
                            );
                        } else {
                            // Render stop words and punctuation as unclickable text
                            return <span key={index}>{segment}</span>;
                        }
                    })}
                </p>

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
