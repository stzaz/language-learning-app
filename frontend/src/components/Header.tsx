'use client';

import Link from 'next/link';
import { ThemeToggleButton } from './ThemeToggleButton';

export default function Header() {
    return (
        <header className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto p-4 flex justify-between items-center">
                <nav className="flex items-center gap-6 text-sm">
                    <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        Library
                    </Link>
                    <Link href="/vocabulary" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        Vocabulary
                    </Link>
                </nav>
                <ThemeToggleButton />
            </div>
        </header>
    );
}

