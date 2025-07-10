'use client';

import React, { useState, useEffect } from 'react';
import BookCard from './BookCard';

export interface Book {
    id: string;
    title: string;
    author: string;
    language: string;
    difficulty_level: number;
    genre?: string;
    cover_image_url?: string;
    progress?: number;
    rating?: number;
}

const BookList = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('http://127.0.0.1:8000/books/');
                if (!response.ok) {
                    throw new Error('Failed to fetch books from the server.');
                }
                const data: Book[] = await response.json();
                setBooks(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    if (loading) return <div className="text-center p-8">Loading...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book) => (
                <BookCard key={book.id} book={book} />
            ))}
        </div>
    );
};

export default BookList;

