'use client';

import React, { useState, useEffect } from 'react';

// Define the type for a vocabulary entry based on the backend schema
interface VocabularyEntry {
    id: string;
    word: string;
    definition: string;
    context_sentence: string;
    user_id: string;
    created_at: string;
}

const VocabularyPage = () => {
    const [vocabularyList, setVocabularyList] = useState<VocabularyEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Hardcoded user ID for now. In a real app, this would come from an auth context.
    const userId = 'user123';

    useEffect(() => {
        const fetchVocabulary = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://127.0.0.1:8000/vocabulary/${userId}`);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch vocabulary' }));
                    throw new Error(errorData.detail || 'Failed to fetch vocabulary');
                }

                const data: VocabularyEntry[] = await response.json();
                setVocabularyList(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchVocabulary();
    }, [userId]); // Depend on userId in case it becomes dynamic later

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading your vocabulary...</div>;
    }

    if (error) {
        return <div style={{ padding: '2rem' }}>Error: {error}</div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>My Vocabulary</h1>
            <p>Here are the words you&apos;ve saved. Review them regularly!</p>
            <hr style={{ margin: '2rem 0' }} />

            {vocabularyList.length === 0 ? (
                <p>Your vocabulary list is empty. Start reading and save some new words!</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {vocabularyList.map((item) => (
                        <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ marginTop: 0, textTransform: 'capitalize' }}>{item.word}</h3>
                            <p><strong>Definition:</strong> {item.definition}</p>
                            <blockquote style={{ fontStyle: 'italic', color: '#555', margin: '1rem 0 0 0', paddingLeft: '1rem', borderLeft: '3px solid #eee' }}>
                                &quot;{item.context_sentence}&quot;
                            </blockquote>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VocabularyPage;

