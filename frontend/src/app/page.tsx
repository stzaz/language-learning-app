'use client';

import BookList from '@/components/BookList';
import StatsDashboard from '@/components/StatsDashboard';
import Recommendations from '@/components/Recommendations'; // 1. Import the new component

const HomePage = () => {
    return (
        <main className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 dark:text-white">
                    The Living Library
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">
                    Your personal sanctuary for language learning through literature.
                </p>
            </div>

            <StatsDashboard />
            <Recommendations />
            <BookList />
        </main>
    );
};

export default HomePage;