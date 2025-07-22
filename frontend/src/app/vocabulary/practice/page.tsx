// frontend/src/app/vocabulary/practice/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Flashcard from '@/components/Flashcard';
import { Check, X } from 'lucide-react'; import Link from 'next/link';
import { VocabularyItem } from '@/types';
import { getPracticeVocabulary } from '@/lib/api';

const PracticePage = () => {
    // --- State Management ---
    const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State for the practice session results
    const [knownWords, setKnownWords] = useState<string[]>([]);
    const [reviewWords, setReviewWords] = useState<string[]>([]);
    const [isSessionComplete, setIsSessionComplete] = useState(false);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchVocabulary = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getPracticeVocabulary();
                setVocabulary(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };
        fetchVocabulary();
    }, []);

    // Memoize the current item to prevent re-renders
    const currentItem = useMemo(() => {
        if (!vocabulary || vocabulary.length === 0) return null;
        return vocabulary[currentIndex];
    }, [currentIndex, vocabulary]);

    // --- Event Handlers ---
    const handleNextCard = () => {
        if (currentIndex < vocabulary.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // End of the session
            setIsSessionComplete(true);
        }
    };

    const handleMarkAsKnown = () => {
        if (currentItem) {
            setKnownWords([...knownWords, currentItem.word]);
            handleNextCard();
        }
    };

    const handleMarkForReview = () => {
        if (currentItem) {
            setReviewWords([...reviewWords, currentItem.word]);
            handleNextCard();
        }
    };

    const handleRestartSession = () => {
        setCurrentIndex(0);
        setKnownWords([]);
        setReviewWords([]);
        setIsSessionComplete(false);
    };

    // --- Render Logic ---
    const renderContent = () => {
        if (loading) return <p className="text-center text-slate-500">Loading your vocabulary...</p>;
        if (error) return <p className="text-center text-red-500">Error: {error}</p>;
        if (vocabulary.length === 0) {
            return (
                <div className="text-center">
                    <p className="text-slate-500 mb-4">You haven&apos;t saved any words yet.</p>
                    <Link href="/" className="text-amber-600 hover:underline">Go back to the library to start reading.</Link>
                </div>
            );
        }
        if (isSessionComplete) {
            return (
                <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold font-serif mb-4">Session Complete!</h2>
                    <p className="text-lg">You knew <strong className="text-green-500">{knownWords.length}</strong> words.</p>
                    <p className="text-lg">You marked <strong className="text-yellow-500">{reviewWords.length}</strong> words for review.</p>
                    <button
                        onClick={handleRestartSession}
                        className="mt-6 px-6 py-3 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-md"
                    >
                        Practice Again
                    </button>
                </div>
            );
        }
        if (currentItem) {
            return <Flashcard item={currentItem} />;
        }
        return null; // Should not happen
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-slate-50 dark:bg-slate-900">
            <div className="w-full max-w-lg">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold font-serif mb-2 text-slate-800 dark:text-white">Practice Session</h1>
                    {!isSessionComplete && vocabulary.length > 0 && (
                        <p className="text-slate-500 dark:text-slate-400">Word {currentIndex + 1} of {vocabulary.length}</p>
                    )}
                </header>

                <div className="w-full h-64 flex items-center justify-center">
                    {renderContent()}
                </div>

                {!isSessionComplete && vocabulary.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <button
                            onClick={handleMarkForReview}
                            className="px-6 py-4 rounded-lg bg-yellow-400 text-yellow-900 hover:bg-yellow-500 transition-colors shadow-md flex items-center justify-center gap-2 font-semibold"
                        >
                            <X size={20} />
                            Review Again
                        </button>
                        <button
                            onClick={handleMarkAsKnown}
                            className="px-6 py-4 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md flex items-center justify-center gap-2 font-semibold"
                        >
                            <Check size={20} />
                            I Knew This
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
};

export default PracticePage;
