// frontend/src/app/vocabulary/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookText, PlayCircle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider'; // Import the useAuth hook
import type { AIExplanation } from '@/components/ExplanationModal';

// Define the type for a vocabulary entry
interface VocabularyEntry {
    id: string;
    word: string;
    definition: string;
    context_sentence: string;
    user_id: string;
    created_at: string;
}

const VocabularyPage = () => {
    const { user, token } = useAuth(); // Get the user and token from our Auth context
    const [vocabularyList, setVocabularyList] = useState<VocabularyEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Only fetch vocabulary if the user is logged in (i.e., we have a token)
        if (token) {
            const fetchUserVocabulary = async () => {
                setLoading(true);
                setError(null);
                try {
                    // Fetch the current user's data, which includes their vocabulary
                    const response = await fetch('http://127.0.0.1:8000/users/me/', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch your vocabulary. Please try logging in again.');
                    }
                    const userData = await response.json();
                    // The user's vocabulary is nested inside the user object
                    setVocabularyList(userData.vocabulary || []);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'An unknown error occurred');
                } finally {
                    setLoading(false);
                }
            };

            fetchUserVocabulary();
        } else {
            // If there's no token, we're not loading anything
            setLoading(false);
        }
    }, [token]); // Re-run this effect if the token changes (e.g., user logs in/out)

    const renderContent = () => {
        if (loading) {
            return <p className="text-center text-slate-500">Loading your vocabulary...</p>;
        }
        if (error) {
            return <p className="text-center text-red-500">Error: {error}</p>;
        }
        // If the user is not logged in
        if (!user) {
            return (
                <div className="text-center py-16">
                    <BookText size={48} className="mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Log in to see your collection.</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Save words as you read to build your personal vocabulary.</p>
                    <Link href="/login" className="mt-6 inline-block px-6 py-3 text-base font-semibold text-white bg-amber-600 rounded-lg shadow-md hover:bg-amber-700">
                        Log In
                    </Link>
                </div>
            );
        }
        // If the user is logged in but has no words
        if (vocabularyList.length === 0) {
            return (
                <div className="text-center py-16">
                    <BookText size={48} className="mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Your collection is empty.</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Start reading and save new words to see them here.</p>
                </div>
            );
        }
        // If the user is logged in and has words
        return (
            <div className="space-y-4">
                {vocabularyList.map((item) => {
                    let translation = '...';
                    try {
                        const explanation: AIExplanation = JSON.parse(item.definition);
                        translation = explanation.translation;
                    } catch { }

                    return (
                        <div key={item.id} className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-serif font-semibold text-slate-900 dark:text-white capitalize">{item.word}</h3>
                                    <p className="text-amber-600 dark:text-amber-400 capitalize">{translation}</p>
                                </div>
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <blockquote className="mt-3 text-slate-600 dark:text-slate-300 italic border-l-4 border-slate-200 dark:border-slate-600 pl-4">
                                &quot;{item.context_sentence}&quot;
                            </blockquote>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold font-serif text-slate-900 dark:text-white">
                        My Vocabulary
                    </h1>
                    {user && vocabularyList.length > 0 && (
                        <Link href="/vocabulary/practice">
                            <span className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-amber-600 rounded-lg shadow-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all">
                                <PlayCircle size={20} />
                                Start Practice Session
                            </span>
                        </Link>
                    )}
                </div>
                {renderContent()}
            </main>
        </div>
    );
};

export default VocabularyPage;
