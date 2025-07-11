'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggleButton() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    // This useEffect only runs on the client, so we can safely show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    // Until the component is mounted, we'll render nothing to avoid a hydration mismatch
    if (!mounted) {
        return null;
    }

    return (
        <button
            onClick={() => (theme === 'dark' ? setTheme('light') : setTheme('dark'))}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
            {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-slate-100" />
            ) : (
                <Moon className="h-5 w-5 text-slate-800" />
            )}
        </button>
    );
};