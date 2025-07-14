// frontend/src/components/Header.tsx
'use client'; // This component now needs to be a client component to use hooks

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import the hook
import { ThemeToggleButton } from './ThemeToggleButton';
import { useAuth } from '../providers/AuthProvider'; // Import useAuth to check login status

const Header = () => {
    const pathname = usePathname();
    const { user, logout } = useAuth(); // Get user and logout function from the context

    // Define the paths where the header should NOT be visible
    const authPaths = ['/login', '/register'];

    // If the current path is one of the auth paths, render nothing
    if (authPaths.includes(pathname)) {
        return null;
    }

    // Otherwise, render the full header
    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-30 border-b border-slate-200 dark:border-slate-700">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Site Name / Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
                            The Living Library
                        </Link>
                    </div>

                    {/* Main Navigation Links */}
                    <div className="hidden sm:flex sm:space-x-8">
                        <Link href="/" className="text-slate-500 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                            Library
                        </Link>
                        <Link href="/vocabulary" className="text-slate-500 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                            Vocabulary
                        </Link>
                    </div>

                    {/* Right-side Actions */}
                    <div className="flex items-center gap-4">
                        <ThemeToggleButton />
                        {user ? (
                            <>
                                <span className="text-sm text-slate-600 dark:text-slate-300">Welcome, {user.username}!</span>
                                <button
                                    onClick={logout}
                                    className="text-sm text-slate-500 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="text-sm font-medium text-amber-600 hover:text-amber-500">
                                Log In
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
