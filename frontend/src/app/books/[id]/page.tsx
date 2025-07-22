// frontend/app/books/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import ExplanationModal from '@/components/ExplanationModal';
import Paragraph from '@/components/Paragraph';
import SettingsPanel from '@/components/SettingsPanel';
import { Settings } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { Book, AIExplanation, BookContent } from '@/types';
import {
    getBookDetails,
    getBookContent,
    getAIExplanation,
    saveVocabularyWord,
    logReadingActivity // Import our new activity logging function
} from '@/lib/api';

// --- Main Page Component ---
const BookPage = () => {
    // --- Hooks ---
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const { token } = useAuth(); // Get the current user's token

    // --- State Management ---
    const [book, setBook] = useState<Book | null>(null);
    const [content, setContent] = useState<BookContent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State for the explanation modal
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [explanation, setExplanation] = useState<AIExplanation | null>(null);
    const [isExplanationLoading, setIsExplanationLoading] = useState<boolean>(false);
    const [currentContext, setCurrentContext] = useState<string | null>(null);

    // State for Reader Settings
    const [fontSize, setFontSize] = useState<string>('text-xl');
    const [lineHeight, setLineHeight] = useState<string>('leading-loose');
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

    // --- Data Fetching Effect ---
    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        const fetchBookAndContent = async () => {
            setLoading(true);
            setError(null);
            try {
                const [bookData, contentData] = await Promise.all([
                    getBookDetails(id),
                    getBookContent(id),
                ]);
                setBook(bookData);
                setContent(contentData);
                document.title = bookData.title || 'The Living Library';
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };
        fetchBookAndContent();
    }, [id]);

    // --- NEW: Activity Logging Effect ---
    useEffect(() => {
        // Only start the timer if the user is logged in (we have a token)
        if (!token) {
            return;
        }

        // Set up an interval to log activity every 60 seconds
        const intervalId = setInterval(() => {
            console.log('Logging 1 minute of reading activity...');
            try {
                logReadingActivity(token, 1);
            } catch (error) {
                console.error("Failed to log reading activity:", error);
            }
        }, 60000); // 60,000 milliseconds = 1 minute

        // This is the cleanup function. It runs when the component unmounts.
        return () => {
            console.log('User navigated away. Stopping activity timer.');
            clearInterval(intervalId);
        };
    }, [token]); // The effect depends on the token, so it will start/stop on login/logout.


    // --- Event Handlers ---
    const handleWordClick = async (word: string, context: string) => {
        const cleanedWord = word.replace(/[.,¡!¿?:"“”'‘’]/g, '').trim();
        if (!cleanedWord) return;

        setSelectedWord(cleanedWord);
        setCurrentContext(context);
        setExplanation(null);
        setIsExplanationLoading(true);

        try {
            const data = await getAIExplanation(cleanedWord, context, book?.language || 'es');
            setExplanation(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setExplanation({
                definition: 'Failed to retrieve explanation.',
                part_of_speech: 'Error',
                translation: 'N/A',
                contextual_insight: errorMessage,
            });
        } finally {
            setIsExplanationLoading(false);
        }
    };

    const handleSaveVocabulary = async () => {
        if (!selectedWord || !explanation || !currentContext || !token) {
            alert("You must be logged in to save words.");
            return;
        }

        const vocabularyEntry = {
            word: selectedWord,
            definition: JSON.stringify(explanation),
            context_sentence: currentContext,
        };

        try {
            await saveVocabularyWord(token, vocabularyEntry);
            alert(`"${selectedWord}" saved to your vocabulary!`);
            closeExplanation();
        } catch (err) {
            console.error("Failed to save vocabulary:", err);
            alert(err instanceof Error ? err.message : "An unknown error occurred.");
        }
    };

    const closeExplanation = () => {
        setSelectedWord(null);
        setExplanation(null);
        setCurrentContext(null);
    };

    // --- Render Logic ---
    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;
    if (!book) return <div className="flex items-center justify-center min-h-screen">Book not found.</div>;

    return (
        <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen font-serif">
            <ExplanationModal
                word={selectedWord}
                explanation={explanation}
                isLoading={isExplanationLoading}
                onClose={closeExplanation}
                onSave={handleSaveVocabulary}
            />

            <main className="max-w-3xl mx-auto p-8 md:p-16">
                <header className="flex items-center justify-between mb-16 border-b border-slate-200 dark:border-slate-700 pb-10">
                    <div className="w-16"></div>
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">{book.title}</h1>
                        <h2 className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 mt-2">by {book.author}</h2>
                    </div>
                    <div className="w-16 flex justify-end">
                        <div className="relative">
                            <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <Settings size={20} />
                            </button>
                            {isSettingsOpen && (
                                <SettingsPanel
                                    fontSize={fontSize}
                                    lineHeight={lineHeight}
                                    onFontSizeChange={setFontSize}
                                    onLineHeightChange={setLineHeight}
                                />
                            )}
                        </div>
                    </div>
                </header>

                <article>
                    {content.map((paragraph) => (
                        <Paragraph
                            key={paragraph.id}
                            originalText={paragraph.original_text}
                            translatedText={paragraph.translated_text}
                            onWordClick={handleWordClick}
                            fontSize={fontSize}
                            lineHeight={lineHeight}
                        />
                    ))}
                </article>
            </main>
        </div>
    );
};

export default BookPage;
