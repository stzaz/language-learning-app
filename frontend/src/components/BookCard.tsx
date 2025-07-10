// frontend/src/components/BookCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import type { Book } from './BookList'; // Using the shared type from BookList.tsx

// The props for our BookCard component
interface BookCardProps {
    book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
    return (
        // The Link component makes the entire card a clickable navigation element
        <Link href={`/books/${book.id}`} passHref>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 p-6 flex flex-col justify-between h-full cursor-pointer border border-slate-200 dark:border-slate-700">
                {/* Book Title and Author */}
                <div>
                    <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-2 line-clamp-2">{book.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">by {book.author}</p>
                </div>

                {/* Footer of the card with language and difficulty */}
                <div className="flex items-center justify-between text-sm mt-4">
                    <span className="text-slate-500 dark:text-slate-400">{book.language}</span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded-full font-medium">
                        Level {book.difficulty_level}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default BookCard;
