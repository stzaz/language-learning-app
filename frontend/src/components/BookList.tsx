import React, { useState, useEffect } from 'react';
import Link from 'next/link';


interface Book {
    id: string;
    title: string;
    author: string;
    language: string;
    difficulty_level: number;
    created_at: string;
}

const BookList: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/books/');
                if (!response.ok) {
                    throw new Error('Failed to fetch books');
                }
                const data: Book[] = await response.json();
                setBooks(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(errorMessage);
                console.error('Error fetching books:', err);
            }
        };

        fetchBooks();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>All Books</h2>
            <ul>
                {books.map((book) => (
                    <li key={book.id}>
                        <Link href={`/books/${book.id}`}>
                            {book.title} by {book.author}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BookList;

