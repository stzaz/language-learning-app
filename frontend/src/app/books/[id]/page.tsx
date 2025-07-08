// frontend/app/books/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import ExplanationModal, { AIExplanation } from '@/components/ExplanationModal'; // Assuming components is in app/

// --- Type Definitions ---
interface Book {
    id: string;
    title: string;
    author: string;
    language: string;
    difficulty_level: number;
    created_at: string;
}

interface BookContent {
    id: string;
    book_id: string;
    paragraph_index: number;
    original_text: string;
    translated_text: string;
}

// --- Main Page Component ---
const BookPage = () => {
    // --- Hooks ---
    const params = useParams<{ id: string }>();
    const id = params?.id;

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
                const [bookResponse, contentResponse] = await Promise.all([
                    fetch(`http://127.0.0.1:8000/books/${id}`),
                    fetch(`http://127.0.0.1:8000/books/${id}/content`)
                ]);

                if (!bookResponse.ok || !contentResponse.ok) {
                    throw new Error('Failed to fetch book data. Please ensure the book exists and the server is running.');
                }

                const bookData: Book = await bookResponse.json();
                const contentData: BookContent[] = await contentResponse.json();

                setBook(bookData);
                setContent(contentData);
                document.title = bookData.title || 'The Living Library';

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchBookAndContent();
    }, [id]);

    // --- Event Handlers ---
    const handleWordClick = async (word: string, context: string) => {
        const cleanedWord = word.replace(/[.,¡!¿?:"“”'‘’]/g, '').trim();
        if (!cleanedWord) return;

        setSelectedWord(cleanedWord);
        setCurrentContext(context);
        setExplanation(null);
        setIsExplanationLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word: cleanedWord, context: context }),
            });

            if (!response.ok) {
                throw new Error('Failed to get explanation from the server.');
            }

            const data: { explanation: AIExplanation } = await response.json();
            setExplanation(data.explanation);
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
        if (!selectedWord || !explanation || !currentContext) return;

        const vocabularyEntry = {
            word: selectedWord,
            definition: JSON.stringify(explanation),
            context_sentence: currentContext,
            user_id: 'user123', // Hardcoded for now
        };

        try {
            await fetch('http://127.0.0.1:8000/vocabulary/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vocabularyEntry),
            });
            // In a real app, show a success toast/notification instead of an alert
            console.log(`"${selectedWord}" saved to vocabulary!`);
            closeExplanation();
        } catch (err) {
            // Handle save error, maybe show a notification
            console.error("Failed to save vocabulary:", err);
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
            {/* The modal is now handled by its own component */}
            <ExplanationModal
                word={selectedWord}
                explanation={explanation}
                isLoading={isExplanationLoading}
                onClose={closeExplanation}
                onSave={handleSaveVocabulary}
            />

            <main className="max-w-4xl mx-auto p-8 md:p-12">
                <header className="text-center mb-12 border-b border-slate-200 dark:border-slate-700 pb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">{book.title}</h1>
                    <h2 className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 mt-2">by {book.author}</h2>
                </header>

                <div className="space-y-12">
                    {content.map((paragraph) => (
                        <div key={paragraph.id} className="grid md:grid-cols-2 gap-8 md:gap-12 leading-relaxed">
                            {/* Original Text Column */}
                            <div className="text-lg text-slate-800 dark:text-slate-300">
                                <p>
                                    {paragraph.original_text.split(/(\s+)/).map((segment, index) => {
                                        const isWord = segment.trim() !== '';
                                        return isWord ? (
                                            <span
                                                key={index}
                                                onClick={() => handleWordClick(segment, paragraph.original_text)}
                                                className="cursor-pointer hover:bg-amber-200/50 dark:hover:bg-amber-800/50 rounded-md transition-colors"
                                            >
                                                {segment}
                                            </span>
                                        ) : (
                                            <span key={index}>{segment}</span> // Preserves whitespace
                                        );
                                    })}
                                </p>
                            </div>
                            {/* Translated Text Column */}
                            <div className="text-base text-slate-500 dark:text-slate-400 italic border-l-2 border-slate-200 dark:border-slate-700 pl-6">
                                <p>{paragraph.translated_text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default BookPage;
