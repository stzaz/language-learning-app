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

const BookPage = () => {
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            return;
        }

        const fetchBook = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://127.0.0.1:8000/books/${id}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Book not found');
                    }
                    throw new Error('Failed to fetch book data');
                }
                const data: Book = await response.json();
                setBook(data);
                if (data?.title) {
                    document.title = data.title
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!book) return <div>Book not found.</div>;

    return (
        <div>
            <h1>{book.title}</h1>
            <h2>by {book.author}</h2>
        </div>
    );
};

export default BookPage;

