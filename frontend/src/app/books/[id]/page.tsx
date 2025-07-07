'use client';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

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

const BookPage = () => {
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const [book, setBook] = useState<Book | null>(null);
    const [content, setContent] = useState<BookContent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isExplanationLoading, setIsExplanationLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchBookAndContent = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch book details and content in parallel
                const [bookResponse, contentResponse] = await Promise.all([
                    fetch(`http://127.0.0.1:8000/books/${id}`),
                    fetch(`http://127.0.0.1:8000/books/${id}/content`)
                ]);

                if (!bookResponse.ok) {
                    if (bookResponse.status === 404) {
                        throw new Error('Book not found');
                    }
                    throw new Error('Failed to fetch book data');
                }
                if (!contentResponse.ok) {
                    throw new Error('Failed to fetch book content');
                }

                const bookData: Book = await bookResponse.json();
                const contentData: BookContent[] = await contentResponse.json();

                setBook(bookData);
                setContent(contentData);

                if (bookData?.title) {
                    document.title = bookData.title;
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchBookAndContent();
    }, [id]);

    const handleWordClick = async (word: string, context: string) => {
        // Clean up word from common punctuation
        const cleanedWord = word.replace(/[.,¡!¿?:"“”'‘’]/g, '').trim();
        if (!cleanedWord) return;

        setSelectedWord(cleanedWord);
        setExplanation(null);
        setIsExplanationLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/explain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    word: cleanedWord,
                    context: context,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to get explanation' }));
                throw new Error(errorData.detail || 'Failed to get explanation');
            }

            const data = await response.json();
            setExplanation(data.explanation);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setExplanation(`Error: ${errorMessage}`);
        } finally {
            setIsExplanationLoading(false);
        }
    };

    const closeExplanation = () => {
        setSelectedWord(null);
        setExplanation(null);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!book) return <div>Book not found.</div>;

    return (
        <div>
            {selectedWord && (
                <>
                    <div
                        onClick={closeExplanation}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 999,
                        }}
                    />
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        maxWidth: '500px',
                        width: '90%'
                    }}>
                        <button onClick={closeExplanation} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        <h3>Explanation for <strong>&quot;{selectedWord}&quot;</strong></h3>
                        <hr style={{ margin: '1rem 0' }} />
                        {isExplanationLoading ? (
                            <p>Loading explanation...</p>
                        ) : (
                            <p style={{ whiteSpace: 'pre-wrap' }}>{explanation}</p>
                        )}
                    </div>
                </>
            )}
            <h1>{book.title}</h1>
            <h2>by {book.author}</h2>
            <hr style={{ margin: '2rem 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {content.map((paragraph) => (
                    <div key={paragraph.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                        <div>
                            <p>
                                {paragraph.original_text.split(/(\s+)/).map((segment, index) => {
                                    const isWord = segment.trim() !== '';
                                    if (isWord) {
                                        return (
                                            <span
                                                key={index}
                                                onClick={() => handleWordClick(segment, paragraph.original_text)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {segment}
                                            </span>
                                        );
                                    } else {
                                        return <span key={index}>{segment}</span>; // This preserves whitespace
                                    }
                                })}
                            </p>
                        </div>
                        <div style={{ color: '#555', fontStyle: 'italic' }}>
                            <p>{paragraph.translated_text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookPage;