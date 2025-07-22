'use client';

import React, { useEffect, useState } from 'react';
import { Book } from '@/types';
import { useAuth } from '@/providers/AuthProvider';
import { getUserRecommendations } from '@/lib/api';
import BookCard from './BookCard';

const Recommendations = () => {
    const { user, token } = useAuth();
    const [recommendations, setRecommendations] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Only fetch recommendations if the user is logged in
        if (user && token) {
            const fetchRecommendations = async () => {
                try {
                    setIsLoading(true);
                    const data = await getUserRecommendations(token);
                    setRecommendations(data);
                } catch (error) {
                    console.error("Failed to fetch recommendations:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchRecommendations();
        } else {
            setIsLoading(false);
        }
    }, [user, token]);

    // If there's no user, or if loading is finished and there are no recommendations,
    // render nothing to keep the UI clean.
    if (!user || (!isLoading && recommendations.length === 0)) {
        return null;
    }

    return (
        <div className="mb-12">
            <h2 className="text-3xl font-bold font-serif text-slate-900 dark:text-white mb-6">
                Recommended For You
            </h2>
            {isLoading ? (
                // Display a loading skeleton that matches the BookCard layout
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200 dark:border-slate-700 animate-pulse">
                            <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
                            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recommendations.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Recommendations;