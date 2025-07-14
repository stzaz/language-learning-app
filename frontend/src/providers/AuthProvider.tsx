// frontend/src/app/providers/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Define the shape of the user object (can be expanded later)
interface User {
    username: string;
    user_id: string;
}

// Define the shape of the context's value
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider component
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    // Effect to check for a token in localStorage on initial load
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            // In a real app, you'd verify the token with the backend here.
            // For now, we'll decode it to get user info.
            try {
                const payload = JSON.parse(atob(storedToken.split('.')[1]));
                setUser({ username: payload.sub, user_id: payload.user_id });
                setToken(storedToken);
            } catch (error) {
                console.error("Failed to decode token:", error);
                // If token is invalid, clear it
                localStorage.removeItem('authToken');
            }
        }
    }, []);

    const login = (newToken: string) => {
        try {
            const payload = JSON.parse(atob(newToken.split('.')[1]));
            setUser({ username: payload.sub, user_id: payload.user_id });
            setToken(newToken);
            localStorage.setItem('authToken', newToken);
            router.push('/'); // Redirect to home page after login
        } catch (error) {
            console.error("Failed to process token on login:", error);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        router.push('/login'); // Redirect to login page after logout
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily use the auth context in any component
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
