// frontend/src/components/__tests__/BookCard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookCard from '../BookCard';
import { useAuth } from '@/providers/AuthProvider';
import * as api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Book } from '@/types';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock the AuthProvider
jest.mock('@/providers/AuthProvider', () => ({
    useAuth: jest.fn(),
}));

// Mock the API module
jest.mock('@/lib/api');

describe('BookCard Component Analytics', () => {
    const mockToken = 'fake-token';
    const mockPush = jest.fn(); // Mock for the router.push function

    const mockBook: Book = {
        id: 'book-123',
        title: 'Test Book',
        author: 'Test Author',
        language: 'en',
        difficulty_level: 3,
    };

    beforeEach(() => {
        // Clear mocks before each test
        (useAuth as jest.Mock).mockClear();
        (api.logEvent as jest.Mock).mockClear();
        (useRouter as jest.Mock).mockClear();

        // Setup default mocks
        (useAuth as jest.Mock).mockReturnValue({ token: mockToken });
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    });

    it('should call logEvent when a recommended book is clicked', async () => {
        // Arrange
        render(<BookCard book={mockBook} isRecommendation={true} />);

        // Act: Find the card (using its title) and click it
        const cardElement = screen.getByText('Test Book').closest('div.group');
        expect(cardElement).toBeInTheDocument();
        fireEvent.click(cardElement!);

        // Assert
        await waitFor(() => {
            // Check that logEvent was called with the correct parameters
            expect(api.logEvent).toHaveBeenCalledWith(
                mockToken,
                'recommendation_clicked',
                { book_id: 'book-123', book_title: 'Test Book' }
            );
        });

        // Also ensure navigation still happens
        expect(mockPush).toHaveBeenCalledWith('/books/book-123');
    });

    it('should NOT call logEvent when a non-recommended book is clicked', async () => {
        // Arrange
        render(<BookCard book={mockBook} isRecommendation={false} />);

        // Act
        const cardElement = screen.getByText('Test Book').closest('div.group');
        fireEvent.click(cardElement!);

        // Assert
        // Check that logEvent was NOT called
        expect(api.logEvent).not.toHaveBeenCalled();

        // Ensure navigation still happens
        expect(mockPush).toHaveBeenCalledWith('/books/book-123');
    });
});