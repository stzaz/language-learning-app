'use client';

import React from 'react';
import { X } from 'lucide-react'; // Using a standard close icon

// The interface for the AI explanation data
export interface AIExplanation {
    definition: string;
    part_of_speech: string;
    translation: string;
    contextual_insight?: string;
}

// The props for our modal component
interface ExplanationModalProps {
    word: string | null;
    explanation: AIExplanation | null;
    isLoading: boolean;
    onClose: () => void;
    onSave: () => void;
}

const ExplanationModal: React.FC<ExplanationModalProps> = ({ word, explanation, isLoading, onClose, onSave }) => {
    // Don't render the modal if no word is selected
    if (!word) {
        return null;
    }

    return (
        <>
            {/* Backdrop: A semi-transparent overlay that closes the modal when clicked */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ease-out"
                aria-hidden="true"
            />

            {/* Content Wrapper: Centers the modal and handles animations */}
            <div
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out"
                    // Prevents clicks inside the modal from closing it
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-serif font-semibold text-slate-800 dark:text-slate-100" id="modal-title">
                            Explanation for <span className="text-amber-600 dark:text-amber-400">&quot;{word}&quot;</span>
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-full p-1"
                            aria-label="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 min-h-[200px] flex items-center justify-center">
                        {isLoading ? (
                            // Loading State
                            <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                                <svg className="animate-spin h-8 w-8 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="font-serif mt-2">Loading explanation...</p>
                            </div>
                        ) : explanation ? (
                            // Content Display
                            <div className="flex flex-col gap-4 w-full text-slate-700 dark:text-slate-300">
                                <p className="text-lg">
                                    <strong className="font-semibold text-amber-700 dark:text-amber-500 capitalize">{explanation.translation}</strong>
                                    <em className="ml-2 text-slate-500 dark:text-slate-400">({explanation.part_of_speech})</em>
                                </p>
                                <div>
                                    <strong className="font-semibold text-slate-800 dark:text-slate-200">Definition:</strong>
                                    <p className="pl-4 mt-1 text-slate-600 dark:text-slate-400">{explanation.definition}</p>
                                </div>
                                {explanation.contextual_insight && (
                                    <div>
                                        <strong className="font-semibold text-slate-800 dark:text-slate-200">Contextual Insight:</strong>
                                        <p className="pl-4 mt-1 text-slate-600 dark:text-slate-400 italic">{explanation.contextual_insight}</p>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-2xl">
                        <button
                            onClick={onSave}
                            disabled={isLoading || !explanation}
                            className="w-full px-4 py-3 text-base font-semibold text-white bg-amber-600 rounded-lg shadow-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
                        >
                            ⭐ Save to Vocabulary
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ExplanationModal;
