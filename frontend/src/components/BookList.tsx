'use client';

import React, { useState, useEffect, useMemo } from 'react';
import BookCard from './BookCard';
import { Search } from 'lucide-react';
import { Book } from '@/types';
import { getBooks } from '@/lib/api';

const BookList = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for Search and Filter ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('All');

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getBooks();
                setBooks(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    // --- Filtering Logic ---
    const filteredBooks = useMemo(() => {
        return books
            .filter(book => {
                // Filter by selected language
                if (selectedLanguage === 'All') {
                    return true;
                }
                return book.language === selectedLanguage;
            })
            .filter(book => {
                // Filter by search term (title or author)
                const term = searchTerm.toLowerCase();
                return (
                    book.title.toLowerCase().includes(term) ||
                    book.author.toLowerCase().includes(term)
                );
            });
    }, [books, searchTerm, selectedLanguage]);

    // --- Derived State for UI ---
    const availableLanguages = useMemo(() => {
        const languages = new Set(books.map(book => book.language));
        return ['All', ...Array.from(languages)];
    }, [books]);


    if (loading) {
        return <p className="text-center text-slate-500">Loading library...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">Error: {error}</p>;
    }

    return (
        <div>
            {/* --- Search and Filter Controls --- */}
            <div className="mb-12 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                    />
                </div>
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full md:w-48 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                >
                    {availableLanguages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>
            </div>

            {/* --- Book Grid --- */}
            {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredBooks.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-500">No books match your search criteria.</p>
            )}
        </div>
    );
};

export default BookList;
