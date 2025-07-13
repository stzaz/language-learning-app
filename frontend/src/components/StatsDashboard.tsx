'use client';

import React from 'react';
import { Flame, Star, BookOpen, Languages } from 'lucide-react';

// A single stat card component for reusability
const StatCard = ({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: string | number, unit: string }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-lg">
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {value} <span className="text-base font-normal text-slate-500 dark:text-slate-400">{unit}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};


const StatsDashboard = () => {
    // We'll use hardcoded data for now, as planned.
    const stats = {
        readingStreak: 7,
        wordsThisWeek: 42,
        booksInProgress: 1,
        languages: 1,
    };

    return (
        <div className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Flame className="w-6 h-6 text-amber-600" />}
                    label="Reading Streak"
                    value={stats.readingStreak}
                    unit="days"
                />
                <StatCard
                    icon={<Star className="w-6 h-6 text-amber-600" />}
                    label="Words This Week"
                    value={stats.wordsThisWeek}
                    unit="words"
                />
                <StatCard
                    icon={<BookOpen className="w-6 h-6 text-amber-600" />}
                    label="Books In Progress"
                    value={stats.booksInProgress}
                    unit="book"
                />
                <StatCard
                    icon={<Languages className="w-6 h-6 text-amber-600" />}
                    label="Languages"
                    value={stats.languages}
                    unit="language"
                />
            </div>
        </div>
    );
};

export default StatsDashboard;
