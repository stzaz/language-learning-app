// This represents a single vocabulary entry
export interface VocabularyItem {
    id: string;
    word: string;
    definition: string;
    context_sentence: string;
    user_id: string;
    created_at: string;
}

// The interface for the AI explanation data
export interface AIExplanation {
    definition: string;
    part_of_speech: string;
    translation: string;
    contextual_insight?: string;
}

// This represents the user object from your AuthProvider
export interface User {
    username: string;
    user_id: string;
    vocabulary?: VocabularyItem[];
}

// This represents a book from your library
export interface Book {
    id: string;
    title: string;
    author: string;
    language: string;
    difficulty_level: number;
    genre?: string;
    cover_image_url?: string;
    progress?: number;
    rating?: number;
}

// This represents the content of a book
export interface BookContent {
    id: string;
    original_text: string;
    translated_text: string;
}


// --- NEW: This is the shape of the data from your /users/me/stats endpoint ---
export interface UserStats {
    reading_streak: number;
    total_words_learned: number;
    total_minutes_read: number;
}

// Token response from backend
export interface TokenResponse {
    access_token: string;
    token_type: string;
}