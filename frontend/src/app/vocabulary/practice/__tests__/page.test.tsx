// frontend/src/app/vocabulary/practice/__tests__/page.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PracticePage from '../page';
import { useAuth } from '@/providers/AuthProvider';
import * as api from '@/lib/api';

// Mock the next/link component
jest.mock('next/link', () => {
    function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
        return <a href={href}>{children}</a>;
    }
    return MockLink
});

// Mock the entire AuthProvider module
jest.mock('@/providers/AuthProvider', () => ({
    useAuth: jest.fn(),
}));

// Mock the entire API module
jest.mock('@/lib/api');

// --- Test Suite for the PracticePage ---
describe('Practice Page', () => {
    const mockUser = { username: 'testuser', user_id: '123' };
    const mockToken = 'fake-token';

    const mockVocabulary = [
        { id: 'v1', word: 'biblioteca', definition: '{}', context_sentence: '...' },
        { id: 'v2', word: 'gato', definition: '{}', context_sentence: '...' },
    ];

    beforeEach(() => {
        (useAuth as jest.Mock).mockClear();
        (api.getDueVocabulary as jest.Mock).mockClear();
        (api.reviewWord as jest.Mock).mockClear();
        (useAuth as jest.Mock).mockReturnValue({ user: mockUser, token: mockToken });
    });

    it('should fetch due vocabulary on load and display the first word', async () => {
        (api.getDueVocabulary as jest.Mock).mockResolvedValue(mockVocabulary);
        render(<PracticePage />);
        expect(api.getDueVocabulary).toHaveBeenCalledWith(mockToken);
        expect(await screen.findByText('biblioteca')).toBeInTheDocument();
    });

    it('should call the reviewWord API with rating 5 when "I Knew This" is clicked', async () => {
        (api.getDueVocabulary as jest.Mock).mockResolvedValue(mockVocabulary);
        (api.reviewWord as jest.Mock).mockResolvedValue({});

        render(<PracticePage />);
        await screen.findByText('biblioteca');

        const knownButton = screen.getByRole('button', { name: /i knew this/i });
        fireEvent.click(knownButton);

        await waitFor(() => {
            expect(api.reviewWord).toHaveBeenCalledWith(mockToken, 'v1', 5);
        });

        // --- FIX: Wait for the component to re-render with the next word ---
        await waitFor(() => {
            expect(screen.getByText('gato')).toBeInTheDocument();
        });
    });

    it('should call the reviewWord API with rating 1 when "Review Again" is clicked', async () => {
        (api.getDueVocabulary as jest.Mock).mockResolvedValue(mockVocabulary);
        (api.reviewWord as jest.Mock).mockResolvedValue({});

        render(<PracticePage />);
        await screen.findByText('biblioteca');

        const reviewButton = screen.getByRole('button', { name: /review again/i });
        fireEvent.click(reviewButton);

        await waitFor(() => {
            expect(api.reviewWord).toHaveBeenCalledWith(mockToken, 'v1', 1);
        });

        // --- FIX: Wait for the component to re-render with the next word ---
        await waitFor(() => {
            expect(screen.getByText('gato')).toBeInTheDocument();
        });
    });

    it('should display a "no words due" message if the API returns an empty array', async () => {
        (api.getDueVocabulary as jest.Mock).mockResolvedValue([]);
        render(<PracticePage />);
        expect(await screen.findByText(/you have no words due for review right now/i)).toBeInTheDocument();
    });

    it('should display the session complete screen after the last card', async () => {
        (api.getDueVocabulary as jest.Mock).mockResolvedValue([mockVocabulary[0]]);
        (api.reviewWord as jest.Mock).mockResolvedValue({});

        render(<PracticePage />);
        await screen.findByText('biblioteca');

        const knownButton = screen.getByRole('button', { name: /i knew this/i });
        fireEvent.click(knownButton);

        await waitFor(() => {
            expect(screen.getByText(/session complete/i)).toBeInTheDocument();
        });
        expect(screen.getByText(/you knew/i).textContent).toContain('1');
    });
});