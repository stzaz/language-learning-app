'use client';

import React, { useEffect, useState } from 'react';
import { Flame, Star, BookOpen, Languages } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { fetchUserStats } from '../lib/api'; // Import our new function
import { UserStats } from '../types'; // Import the type

// Reusable StatCard component (Add isLoading prop)
const StatCard = ({ icon: Icon, label, value, unit, isLoading }: { icon: React.ElementType, label: string, value: string | number, unit?: string, isLoading: boolean }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
            <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-lg">
                <Icon className="w-6 h-6 text-amber-600" />
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                {isLoading ? (
                    <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1"></div>
                ) : (
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {value} <span className="text-base font-normal text-slate-500 dark:text-slate-400">{unit}</span>
                    </p>
                )}
            </div>
        </div>
    </div>
);


// Main Dashboard Component
const StatsDashboard = () => {
    const { user, token } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && token) {
            const getStats = async () => {
                try {
                    setIsLoading(true);
                    const fetchedStats = await fetchUserStats(token);
                    setStats(fetchedStats);
                } catch (error) {
                    console.error("Error fetching stats:", error);
                    // Optionally set an error state here
                } finally {
                    setIsLoading(false);
                }
            };
            getStats();
        } else {
            // If there's no user, we're not loading anything
            setIsLoading(false);
        }
    }, [user, token]);

    // Don't render anything if the user is not logged in
    if (!user) {
        return null;
    }

    return (
        <div className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Flame}
                    label="Reading Streak"
                    value={stats?.reading_streak ?? 0}
                    unit="days"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={Star}
                    label="Words Learned"
                    // Corrected to use total_words_learned
                    value={stats?.total_words_learned ?? 0}
                    unit="words"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={BookOpen}
                    label="Minutes Read"
                    // Corrected to use total_minutes_read
                    value={stats?.total_minutes_read ?? 0}
                    unit="mins"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={Languages}
                    label="Languages"
                    value={1} // This can be dynamic later
                    unit="language"
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default StatsDashboard;