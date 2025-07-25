import { User, UserStats, TokenResponse, Book, BookContent, AIExplanation, VocabularyItem } from "../types";

export const registerUser = async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to register');
    }

    return response.json();
}

export const loginUser = async (email: string, password: string): Promise<TokenResponse> => {
    const formBody = new URLSearchParams();
    formBody.append('username', email); // The backend expects the email as 'username'
    formBody.append('password', password);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to log in');
    }

    return response.json();
};

export const getUserData = async (token: string): Promise<User> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user data. Please try logging in again.');
    }

    return response.json();
};

// --- Book Fetching Functions ---

export const getBooks = async (): Promise<Book[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/`);

    if (!response.ok) {
        throw new Error('Failed to fetch books from the server.');
    }

    return response.json();
};

export const getBookDetails = async (bookId: string): Promise<Book> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}`);
    if (!response.ok) throw new Error('Failed to fetch book details.');
    return response.json();
};

export const getBookContent = async (bookId: string): Promise<BookContent[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}/content`);
    if (!response.ok) throw new Error('Failed to fetch book content.');
    return response.json();
};

// --- AI & Vocabulary Functions ---

export const getAIExplanation = async (word: string, context: string, language: string): Promise<AIExplanation> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, context, language }),
    });
    if (!response.ok) throw new Error('Failed to get explanation from the server.');
    const data = await response.json();
    return data.explanation;
};

export const saveVocabularyWord = async (
    token: string,
    wordData: { word: string; definition: string; context_sentence: string }
): Promise<VocabularyItem> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vocabulary/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(wordData),
    });
    if (!response.ok) throw new Error("Failed to save word. Please try again.");
    return response.json();
};

export const getDueVocabulary = async (token: string): Promise<VocabularyItem[]> => {
    // This now fetches the user's specific vocabulary, not the public list.
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vocabulary/due-for-review`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch your vocabulary. Please try logging in again.');
    }


    return response.json();// Return the vocabulary list from the user object
};

// --- Function to submit a review for a word ---
export const reviewWord = async (
    token: string,
    wordId: string,
    performance_rating: number
): Promise<VocabularyItem> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vocabulary/${wordId}/review`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ performance_rating }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update review status.");
    }
    return response.json();
};

export const fetchUserStats = async (token: string): Promise<UserStats> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/stats`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user stats");
    }

    return response.json();
};

export const logReadingActivity = async (token: string, minutes: number): Promise<void> => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/activity`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ minutes }),
    });
};

// --- Recommendation Function ---
export const getUserRecommendations = async (token: string): Promise<Book[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/recommendations`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        // It's okay if this fails (e.g., for a new user), so we can return an empty array.
        console.error("Failed to fetch recommendations, returning empty list.");
        return [];
    }
    return response.json();
};

// --- Analytics Event Logging Function ---
export const logEvent = async (
    token: string,
    eventName: string,
    properties: object = {}
): Promise<void> => {
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ event_name: eventName, properties }),
        });
        // We can fire-and-forget this, no need to block the UI
        console.log(`Logged event: ${eventName}`);
    } catch (error) {
        // It's important that analytics failures do not break the user experience.
        console.error("Failed to log event:", error);
    }
};
