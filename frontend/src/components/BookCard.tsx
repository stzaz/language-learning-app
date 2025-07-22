'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Book } from '@/types';

interface BookCardProps {
    book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
    // Correct URL format with '&format=png'
    const placeholderUrl = `https://placehold.co/400x600/EAE0D5/5D4037?text=${encodeURIComponent(book.title)}&format=png`;
    const coverImage = book.cover_image_url || placeholderUrl;

    return (
        <Link href={`/books/${book.id}`} passHref>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col h-full cursor-pointer border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Cover Image Section using next/image */}
                <div className="relative h-48 w-full">
                    <Image
                        src={coverImage}
                        alt={`Cover for ${book.title}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Progress bar overlay */}
                    {book.progress !== undefined && book.progress > 0 && (
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-200/50 dark:bg-slate-900/50">
                            <div
                                className="h-full bg-amber-500"
                                style={{ width: `${book.progress}%` }}
                            ></div>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow">
                    {/* Genre and Rating */}
                    <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-2">
                        <span>{book.genre || 'Classic'}</span>
                        {book.rating && (
                            <div className="flex items-center gap-1">
                                <Star size={14} className="text-amber-400 fill-current" />
                                <span>{book.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    {/* Book Title and Author */}
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-1 line-clamp-2">{book.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">by {book.author}</p>
                    </div>

                    {/* Footer with language and difficulty */}
                    <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500 dark:text-slate-400">{book.language}</span>
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded-full font-medium">
                            Level {book.difficulty_level}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default BookCard;
