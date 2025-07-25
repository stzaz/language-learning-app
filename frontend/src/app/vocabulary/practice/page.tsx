'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Flashcard from '@/components/Flashcard';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { VocabularyItem } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
// 1. Import logEvent alongside the other API functions
import { getDueVocabulary, reviewWord, logEvent } from '@/lib/api';

const PracticePage = () => {
    const { user, token } = useAuth();
    // --- State Management ---
    const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [knownCount, setKnownCount] = useState<number>(0);
    const [reviewCount, setReviewCount] = useState<number>(0);
    const [isSessionComplete, setIsSessionComplete] = useState(false);

    // --- Data Fetching & Event Logging ---
    useEffect(() => {
        if (token) {
            const fetchDueVocabulary = async () => {
                setLoading(true);
                setError(null);
                try {
                    const data = await getDueVocabulary(token);
                    setVocabulary(data);
                    // 2. Log an event when a practice session starts
                    if (data.length > 0) {
                        logEvent(token, 'practice_session_started', { word_count: data.length });
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'An unknown error occurred');
                } finally {
                    setLoading(false);
                }
            };
            fetchDueVocabulary();
        } else {
            setLoading(false);
        }
    }, [token]);

    const currentItem = useMemo(() => {
        if (!vocabulary || vocabulary.length === 0) return null;
        return vocabulary[currentIndex];
    }, [currentIndex, vocabulary]);

    // --- Event Handlers ---
    const handleNextCard = () => {
        if (currentIndex < vocabulary.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // 3. Log an event when the session is completed, before setting the state
            if (token) {
                logEvent(token, 'practice_session_completed', {
                    known_count: knownCount,
                    review_count: reviewCount,
                    total_words: vocabulary.length
                });
            }
            setIsSessionComplete(true);
        }
    };

    const handleReview = async (performanceRating: 1 | 5) => {
        if (!currentItem || !token) return;

        try {
            await reviewWord(token, currentItem.id, performanceRating);

            if (performanceRating === 5) {
                setKnownCount(prev => prev + 1);
            } else {
                setReviewCount(prev => prev + 1);
            }

            handleNextCard();
        } catch (err) {
            console.error("Failed to submit review:", err);
            setError("Could not save review. Please try again.");
        }
    };

    const handleRestartSession = () => {
        window.location.reload();
    };

    // --- Render Logic (no changes needed here) ---
    const renderContent = () => {
        if (loading) return <p className="text-center text-slate-500">Loading your vocabulary...</p>;
        if (error) return <p className="text-center text-red-500">Error: {error}</p>;

        if (!user) {
            return (
                <div className="text-center">
                    <p className="text-slate-500 mb-4">Please log in to start a practice session.</p>
                    <Link href="/login" className="text-amber-600 hover:underline">Log In</Link>
                </div>
            );
        }

        if (vocabulary.length === 0 && !isSessionComplete) {
            return (
                <div className="text-center">
                    <p className="text-slate-500 mb-4">You have no words due for review right now. Great work!</p>
                    <Link href="/" className="text-amber-600 hover:underline">Go back to the library.</Link>
                </div>
            );
        }

        if (isSessionComplete) {
            return (
                <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold font-serif mb-4">Session Complete!</h2>
                    <p className="text-lg">You knew <strong className="text-green-500">{knownCount}</strong> words.</p>
                    <p className="text-lg">You marked <strong className="text-yellow-500">{reviewCount}</strong> words for review.</p>
                    <button
                        onClick={handleRestartSession}
                        className="mt-6 px-6 py-3 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-md"
                    >
                        Practice Again Later
                    </button>
                </div>
            );
        }
        if (currentItem) {
            return <Flashcard item={currentItem} />;
        }
        return null;
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
                            onClick={() => handleReview(1)}
                            className="px-6 py-4 rounded-lg bg-yellow-400 text-yellow-900 hover:bg-yellow-500 transition-colors shadow-md flex items-center justify-center gap-2 font-semibold"
                        >
                            <X size={20} />
                            Review Again
                        </button>
                        <button
                            onClick={() => handleReview(5)}
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