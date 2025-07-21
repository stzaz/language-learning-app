import React from 'react';
import { render, screen } from '@testing-library/react';
import VocabularyPage from '../page';
import { useAuth } from '../../../providers/AuthProvider';

// Mock the next/link component
jest.mock('next/link', () => {
    function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
        return <a href={href}>{children}</a>;
    }
    return MockLink
});

// Mock the AuthProvider module
jest.mock('../../../providers/AuthProvider', () => ({
    useAuth: jest.fn(),
}));

// Set up a global mock for the fetch API
global.fetch = jest.fn();

describe('Vocabulary Page', () => {

    beforeEach(() => {
        // Clear all mocks before each test for isolation
        (useAuth as jest.Mock).mockClear();
        (global.fetch as jest.Mock).mockClear();
    });

    it('should display vocabulary words for an authenticated user', async () => {
        // 1. Arrange: Mock the authenticated user, their token, and their vocabulary
        const mockUserData = {
            id: 'user-123',
            email: 'test@example.com',
            vocabulary: [
                { id: 'v1', word: 'biblioteca', context_sentence: 'La biblioteca está abierta.', definition: '{"translation": "library"}' },
                { id: 'v2', word: 'gato', context_sentence: 'El gato duerme.', definition: '{"translation": "cat"}' }
            ]
        };
        // The component needs both the user and the token to function
        (useAuth as jest.Mock).mockReturnValue({ user: mockUserData, token: 'fake-token' });

        // Mock the fetch call to the /users/me endpoint
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockUserData),
        });

        // 2. Act: Render the component
        render(<VocabularyPage />);

        // 3. Assert: Wait for the async data to be displayed
        expect(await screen.findByText('biblioteca')).toBeInTheDocument();
        expect(screen.getByText(/"La biblioteca está abierta."/i)).toBeInTheDocument();

        expect(await screen.findByText('gato')).toBeInTheDocument();
        expect(screen.getByText(/"El gato duerme."/i)).toBeInTheDocument();
    });

    it('should display a message when the user has no vocabulary words', async () => {
        // 1. Arrange: Mock a user with an empty vocabulary list
        const mockUserWithNoWords = {
            id: 'user-456',
            email: 'newuser@example.com',
            vocabulary: [] // Empty array is key
        };
        (useAuth as jest.Mock).mockReturnValue({ user: mockUserWithNoWords, token: 'fake-token' });
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockUserWithNoWords),
        });

        // 2. Act
        render(<VocabularyPage />);

        // 3. Assert: Check for the correct "empty collection" message
        // FIXED: The assertion text now matches the component's actual output.
        expect(await screen.findByText("Your collection is empty.")).toBeInTheDocument();
        expect(screen.getByText('Start reading and save new words to see them here.')).toBeInTheDocument();
    });

    it('should display a login message for an unauthenticated user', () => {
        // 1. Arrange: Mock a logged-out user (no user, no token)
        (useAuth as jest.Mock).mockReturnValue({ user: null, token: null });

        // 2. Act
        render(<VocabularyPage />);

        // 3. Assert
        expect(screen.getByText("Log in to see your collection.")).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
    });
});
