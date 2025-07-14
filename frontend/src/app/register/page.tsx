// frontend/src/app/register/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const RegisterPage = () => {
    const [email, setEmail] = useState(''); // Changed from username
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!email || !password) {
            setError('Both email and password are required.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email, // Changed from username
                    password: password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'An unknown error occurred.');
            }

            alert('Registration successful! You can now log in.');
            router.push('/login');

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8">
                    <h1 className="text-3xl font-bold font-serif text-center mb-2 text-slate-900 dark:text-white">
                        Join The Library
                    </h1>
                    <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
                        Create an account to save your progress.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email" // Changed from username
                                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email" // Changed to type="email" for better validation
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 dark:text-red-400 text-center">
                                {error}
                            </p>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
                <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-amber-600 hover:text-amber-500">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
